import { useTheme } from '@react-navigation/native';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    ImageSourcePropType,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import Svg, { Text } from 'react-native-svg';
import { usePlayer } from '../main_providers/player_provider';
import { useSyncedAnimation } from '../main_providers/synced_animation';
import { shouldUpdate } from './diffWatcher';
import GameService from './gameService';
import { useGameState } from './game_state_provider';
import Spinner from './Spinner';

interface TimerContentProps {
    text: string
    textFillColor: string
    textBorderColor: string
    fullImage: ImageSourcePropType
    borderImage: ImageSourcePropType
}

const TimerContent = ({ textFillColor, textBorderColor, text, fullImage, borderImage }: TimerContentProps) => (
    <View style={{ width: '100%', height: '100%', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '100%' }}>
            <Image source={fullImage} style={{
                position: 'absolute',
                resizeMode: 'center',
                tintColor: textBorderColor,
                width: '100%',
                height: 40,
                transform: [{ scale: 0.96 }]
            }} />
            <Image source={borderImage} style={{
                resizeMode: 'center',
                tintColor: textFillColor,
                width: '100%',
                height: 40,
            }} />
        </View>
        <View style={{ height: 40, width: '100%' }}>
            <Svg height='100%' width='100%' viewBox='0 0 50 50'>
                <Text
                    x={'26'}
                    y={'38'}
                    textAnchor='middle'
                    stroke={textBorderColor}
                    strokeWidth="2"
                    fill={textFillColor}
                    fontSize="34"
                    fontWeight='bold'
                    letterSpacing={2}
                >
                    {text}
                </Text>
            </Svg>
        </View>
    </View>
)

interface Props {
    children: ReactNode
    playerId: string
    hudWidth: number
}

const PlayerHud = ({ playerId, children, hudWidth }: Props) => {
    const theme = useTheme();
    const { player } = usePlayer();
    const { bounceAnim } = useSyncedAnimation();
    const { stateSubject, networkRequestStatus, updateState } = useGameState();
    const leftSide = stateSubject.value.game.playerIds[0] === playerId;
    const direction = leftSide ? -1 : 1;

    const networkKey = `hud_actions_${playerId}`;
    const [state, setState] = useState({
        playerTurn: stateSubject.value.game.playerTurn,
        lastTurnEndTime: stateSubject.value.game.lastTurnEndTime,
        previewPawn: stateSubject.value.previewPawn,
        networkState: networkRequestStatus.subject.value[networkKey],
    });

    useEffect(() => {
        const sub = stateSubject.subscribe(({ game: { playerTurn, lastTurnEndTime }, previewPawn }) => {
            const newState = {
                ...state,
                previewPawn,
                playerTurn,
                lastTurnEndTime,
            }
            if (shouldUpdate(newState, state)) {
                setState(newState);
            }
        });
        return () => sub.unsubscribe();
    }, [state]);


    useEffect(() => {
        const sub = networkRequestStatus.subject.subscribe(statuses => {
            if (statuses[networkKey] !== state.networkState) {
                setState({
                    ...state,
                    networkState: statuses[networkKey]
                });
            }
        });
        return () => sub.unsubscribe();
    }, [state.networkState]);

    const scaleAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        scaleAnim.setValue(state.playerTurn === playerId ? 2 : 0);
        Animated.timing(
            scaleAnim,
            {
                toValue: 0,
                duration: Math.max(0, state.lastTurnEndTime + stateSubject.value.game.timePerTurn - Date.now()),
                easing: Easing.linear,
                useNativeDriver: true
            }
        ).start();
    }, [scaleAnim, state.playerTurn, state.lastTurnEndTime]);

    const mainPosAnim = useRef(new Animated.Value(0)).current
    const actionsPosAnim = useRef(new Animated.Value(1)).current
    useEffect(() => {
        const showActions = playerId === player?.id && state.previewPawn && playerId === state.playerTurn;
        Animated.timing(
            mainPosAnim,
            {
                toValue: showActions ? 1 : 0,
                duration: showActions ? 150 : 250,
                easing: showActions ? Easing.linear : Easing.elastic(1),
                useNativeDriver: true
            }
        ).start();

        Animated.timing(
            actionsPosAnim,
            {
                toValue: showActions ? 0 : 1,
                duration: showActions ? 250 : 150,
                easing: showActions ? Easing.elastic(1) : Easing.linear,
                useNativeDriver: true
            }
        ).start();

    }, [mainPosAnim, actionsPosAnim, state.previewPawn]);

    const mainHudPos = mainPosAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, direction * (hudWidth + 10)],
    });

    const actionsPos = actionsPosAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, direction * (hudWidth + 10)],
    });

    const addPawn = async () => {
        if (!state.previewPawn) return;

        if (state.networkState === 'LOADING') return;
        networkRequestStatus.update(networkKey, 'LOADING');

        const res = await GameService.addPawn({
            gameId: stateSubject.value.game.gameId,
            x: state.previewPawn.position.x,
            y: state.previewPawn.position.y,
        }).catch(err => {
            networkRequestStatus.update(networkKey, 'ERROR');
        });
        if (!res) return;
        networkRequestStatus.update(networkKey, 'NONE');

        updateState.onAddPawn(res);
    }

    const onConfirm = () => {
        addPawn();
    }

    const onCancel = () => {
        updateState.onCancelPeek();
    }

    const iconScaleAnim = Animated.add(0.3, Animated.multiply(0.7, bounceAnim));

    return (
        <View style={{ height: '100%', width: hudWidth }}>

            <Animated.View style={{ display: 'flex', height: '100%', alignItems: 'center', transform: [{ translateX: mainHudPos }] }}>
                {children}
            </Animated.View>

            <Animated.View style={{ position: 'absolute', backgroundColor: theme.colors.background, width: hudWidth, height: '100%', transform: [{ translateX: actionsPos }] }}>

                <View style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>

                    <View style={{ flex: 1 }}>
                        <Pressable onPress={state.playerTurn === playerId ? onConfirm : undefined}>
                            <View style={{ ...styles.timerContainer }}>
                                <View style={{ position: 'absolute', width: '100%', height: '100%', top: '50%' }}>
                                    <Animated.View style={{ width: '100%', height: '100%', backgroundColor: player?.color, transform: [{ scaleY: scaleAnim }] }}></Animated.View>
                                </View>
                                <Animated.View style={{ ...styles.iconContainer, transform: [{ scale: iconScaleAnim }] }}>
                                    <TimerContent
                                        text='OK'
                                        textBorderColor={player?.color || ""}
                                        textFillColor={theme.colors.background}
                                        fullImage={require('./assets/confirm.png')}
                                        borderImage={require('./assets/confirm_border.png')} />
                                </Animated.View>
                                <View style={{ ...styles.timerBorder, borderColor: theme.colors.text }} ></View>

                                <View style={{ position: 'absolute', width: 18, height: 18, right: leftSide ? 10 : undefined, top: 10, left: leftSide ? undefined : 10 }}>
                                    {state.networkState === 'LOADING' ? <Spinner /> : null}
                                </View>
                            </View>
                        </Pressable>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Pressable onPress={state.playerTurn === playerId ? onCancel : undefined}>
                            <View style={{ ...styles.timerContainer }}>
                                <View style={{ position: 'absolute', width: '100%', height: '100%', top: '-50%' }}>
                                    <Animated.View style={{ width: '100%', height: '100%', backgroundColor: theme.colors.text, transform: [{ scaleY: scaleAnim }] }}></Animated.View>
                                </View>
                                <Animated.View style={{ ...styles.iconContainer, transform: [{ scale: iconScaleAnim }] }}>
                                    <TimerContent
                                        text='NO'
                                        textBorderColor={theme.colors.text}
                                        textFillColor={theme.colors.background}
                                        fullImage={require('./assets/cancel.png')}
                                        borderImage={require('./assets/cancel_border.png')} />
                                </Animated.View>
                                <View style={{ ...styles.timerBorder, borderColor: theme.colors.text }} ></View>
                            </View>
                        </Pressable>
                    </View>

                </View>

            </Animated.View>

            <View style={{ position: 'absolute', width: hudWidth + 2, height: '100%', backgroundColor: theme.colors.background, transform: [{ translateX: direction * (hudWidth + 10 - direction) }] }}>
            </View>

        </View>
    );
};


const styles = StyleSheet.create({
    timerContainer: {
        overflow: 'hidden',
        width: '100%',
        marginVertical: 12,
    },
    timerBorder: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderWidth: 4
    },
    iconContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
});

export default PlayerHud;