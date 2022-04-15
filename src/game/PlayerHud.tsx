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
    Text
} from 'react-native';
import { useAudio } from '../main_providers/audio_provider';
import { usePlayer } from '../main_providers/player_provider';
import { useSyncedAnimation } from '../main_providers/synced_animation';
import { shouldUpdate } from './diffWatcher';
import GameService from './gameService';
import { useGameState } from './game_state_provider';
import Spinner from './Spinner';

interface TimerContentProps {
    text: string
    color: string
    image: ImageSourcePropType
}

const TimerContent = ({ color, text, image }: TimerContentProps) => (
    <View style={{ width: '100%', height: '100%', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '100%' }}>
            <Image source={image} style={{
                resizeMode: 'center',
                tintColor: color,
                width: '100%',
                height: 32,
            }} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8, color: color }}>{text}</Text>
    </View>
)

interface Props {
    children: ReactNode
    playerId: string
    hudWidth: number
}

const PlayerHud = ({ playerId, children, hudWidth }: Props) => {
    const theme = useTheme();
    const audio = useAudio();
    const { player } = usePlayer();
    const { bounceAnim } = useSyncedAnimation();
    const { stateSubject, networkRequestStatus, updateState } = useGameState();
    const leftSide = stateSubject.value.game.playerIds[0] === playerId;
    const direction = leftSide ? -1 : 1;
    const [timerHeight, setTimerHeight] = useState(0);

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

    const translateAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        translateAnim.setValue(state.playerTurn === playerId ? 0 : timerHeight);
        Animated.timing(
            translateAnim,
            {
                toValue: timerHeight,
                duration: Math.max(0, state.lastTurnEndTime + stateSubject.value.game.timePerTurn - Date.now()),
                easing: Easing.linear,
                useNativeDriver: true
            }
        ).start();
    }, [translateAnim, state.playerTurn, state.lastTurnEndTime, timerHeight]);

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

        audio.play('confirm_pawn');
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

    const onCancel = () => {
        audio.play('cancel');
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
                        <Pressable onPress={state.playerTurn === playerId ? addPawn : undefined}>
                            <View onLayout={(event) => setTimerHeight(event.nativeEvent.layout.height)} style={{ ...styles.timerContainer }}>
                                <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
                                    <Animated.View style={{ ...styles.iconContainer, position: 'absolute', transform: [{ scale: iconScaleAnim }] }}>
                                        <TimerContent
                                            text='OK'
                                            color={player?.color || ""}
                                            image={require('./assets/confirm.png')} />
                                    </Animated.View>
                                    <Animated.View style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 20, backgroundColor: player?.color, transform: [{ translateY: translateAnim }] }}>
                                        <Animated.View style={{ transform: [{ translateY: Animated.multiply(-1, translateAnim) }] }}>
                                            <Animated.View style={{ ...styles.iconContainer, transform: [{ scale: iconScaleAnim }] }}>
                                                <TimerContent
                                                    text='OK'
                                                    color={theme.colors.background}
                                                    image={require('./assets/confirm.png')} />
                                            </Animated.View>
                                        </Animated.View>
                                    </Animated.View>
                                </View>
                                <View style={{ ...styles.timerBorder, borderColor: theme.colors.text }} ></View>
                                <View style={{ width: '100%', height: '100%' }} />

                                <View style={{ position: 'absolute', width: 18, height: 18, right: leftSide ? 10 : undefined, top: 10, left: leftSide ? undefined : 10 }}>
                                    {state.networkState === 'LOADING' ? <Spinner /> : null}
                                </View>
                            </View>
                        </Pressable>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Pressable onPress={state.playerTurn === playerId ? onCancel : undefined}>
                            <View style={{ ...styles.timerContainer }}>
                                <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
                                    <Animated.View style={{ ...styles.iconContainer, position: 'absolute', transform: [{ scale: iconScaleAnim }] }}>
                                        <TimerContent
                                            text='NO'
                                            color={theme.colors.text}
                                            image={require('./assets/cancel.png')} />
                                    </Animated.View>
                                    <Animated.View style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 20, backgroundColor: theme.colors.text, transform: [{ translateY: Animated.multiply(-1, translateAnim) }] }}>
                                        <Animated.View style={{ transform: [{ translateY: translateAnim }] }}>
                                            <Animated.View style={{ ...styles.iconContainer, transform: [{ scale: iconScaleAnim }] }}>
                                                <TimerContent
                                                    text='NO'
                                                    color={theme.colors.background}
                                                    image={require('./assets/cancel.png')} />
                                            </Animated.View>
                                        </Animated.View>
                                    </Animated.View>
                                </View>
                                <View style={{ ...styles.timerBorder, borderColor: theme.colors.text }} ></View>
                                <View style={{ width: '100%', height: '100%' }} />
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
        borderRadius: 20,
    },
    timerBorder: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 20,
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