import Svg, { Text, TSpan } from "react-native-svg";
import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { usePlayer } from '../main_providers/player_provider';
import GameService from './gameService';
import { useGameState } from './game_state_provider';

interface Props {
    playerId: string
}

const WaitingDots = ({ color }: { color: string }) => {
    return <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <View style={{ ...styles.waitingDot, backgroundColor: color }}></View>
        <View style={{ ...styles.waitingDot, backgroundColor: color }}></View>
        <View style={{ ...styles.waitingDot, backgroundColor: color }}></View>
    </View>
}

type TurnTimerIconOption = 'CLOCK' | 'END' | 'CANCEL' | 'WAITING'
const TurnTimerIcon = ({ icon, dotColor }: { icon: TurnTimerIconOption, dotColor: string }) => {
    const theme = useTheme();

    const clockAnim = useRef(new Animated.Value(0)).current;
    const endAnim = useRef(new Animated.Value(0)).current;
    const cancelAnim = useRef(new Animated.Value(0)).current;
    const waitingAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const hideValues = {
            toValue: 0,
            speed: 25,
            bounciness: 5,
            useNativeDriver: true
        };
        const showValues = {
            toValue: 1,
            speed: 20,
            bounciness: 15,
            useNativeDriver: true
        };

        Animated.spring(
            clockAnim,
            icon === 'CLOCK' ? showValues : hideValues
        ).start()
        Animated.spring(
            endAnim,
            icon === 'END' ? showValues : hideValues
        ).start()
        Animated.spring(
            cancelAnim,
            icon === 'CANCEL' ? showValues : hideValues
        ).start()
        Animated.spring(
            waitingAnim,
            icon === 'WAITING' ? showValues : hideValues
        ).start()
    }, [icon, clockAnim, endAnim, cancelAnim, waitingAnim]);

    return <View style={{ width: '100%', height: '100%' }}>
        <Animated.View style={{ ...styles.iconPosition, transform: [{ scale: clockAnim }] }}>
            <Image source={require('./assets/stop_watch.png')} style={{
                resizeMode: 'contain',
                tintColor: theme.colors.background,
                width: '40%',
                height: 60,
            }} />
        </Animated.View>
        <Animated.View style={{ ...styles.iconPosition, transform: [{ scale: endAnim }] }}>
            <View style={{ height: 60, width: '100%' }}>
                <Svg height='100%' width='100%' viewBox='0 0 60 60'>
                    <Text
                        y={'-10'}
                        textAnchor='middle'
                        stroke={'#73956F'}
                        strokeWidth="2"
                        fill={theme.colors.background}
                        fontSize="28"
                        fontWeight='bold'
                    >
                        <TSpan x='30' dy='1.1em'>END</TSpan>
                        <TSpan x='30' dy='1.1em'>TURN</TSpan>
                    </Text>
                </Svg>
            </View>
        </Animated.View>
        <Animated.View style={{ ...styles.iconPosition, transform: [{ scale: cancelAnim }] }}>
            <View style={{ width: '100%', height: '100%', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: '100%' }}>
                    <Image source={require('./assets/cancel.png')} style={{
                        position: 'absolute',
                        resizeMode: 'center',
                        tintColor: theme.colors.text,
                        width: '100%',
                        height: 30,
                        transform: [{ scale: 0.99 }]
                    }} />
                    <Image source={require('./assets/cancel_border.png')} style={{
                        resizeMode: 'center',
                        tintColor: theme.colors.background,
                        width: '100%',
                        height: 30,
                    }} />
                </View>
                <View style={{ height: 40, width: '100%' }}>
                    <Svg height='100%' width='100%' viewBox='0 0 50 50'>
                        <Text
                            x={'25'}
                            y={'34'}
                            textAnchor='middle'
                            stroke={theme.colors.text}
                            strokeWidth="2"
                            fill={theme.colors.background}
                            fontSize="28"
                            fontWeight='bold'
                        >
                            CANCEL
                        </Text>
                    </Svg>
                </View>
            </View>
        </Animated.View>
        <Animated.View style={{ ...styles.iconPosition, transform: [{ scale: waitingAnim }] }}>
            <WaitingDots color={dotColor} />
        </Animated.View>
    </View>
}

const TurnTimer = ({ playerId }: Props) => {
    const theme = useTheme();
    const player = usePlayer();

    const { state, updateState } = useGameState();
    const { playerTurn, gameId } = state.game;

    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        scaleAnim.setValue(playerTurn === playerId ? 2 : 0)
        Animated.timing(
            scaleAnim,
            {
                toValue: 0,
                duration: 1000 * 10,
                easing: Easing.linear,
                useNativeDriver: true
            }
        ).start();
    }, [scaleAnim, playerTurn]);

    const endTurn = async () => {
        const res = await (new GameService).endTurn({
            gameId: gameId,
            playerSide: playerId,
        });

        const { allDeflections, winner, ...gameUpdates } = res;
        const { game: { gameBoard: { pawns } } } = state;

        allDeflections.forEach(deflections => {
            deflections.forEach((deflection, i) => {
                if (i === 0) return;
                if (!pawns[deflection.position.y] || !pawns[deflection.position.y][deflection.position.x]) return;

                pawns[deflection.position.y][deflection.position.x].durability -= 1;
                deflection.events.forEach(event => {
                    if (event.name === 'DESTROY_PAWN') {
                        pawns[event.position.y][event.position.x].name = '';
                    }
                });
            });
        });
        const { scoreBoard, ...remainingUpdates } = gameUpdates;

        updateState({
            ...state,
            winner,
            allDeflections,
            previewPawn: undefined,
            deflectionPreview: undefined,
            game: {
                ...state.game,
                ...remainingUpdates,
                gameBoard: {
                    ...state.game.gameBoard,
                    scoreBoard
                }
            },
        });
    }

    const cancelPawn = () => {
        updateState({
            ...state,
            previewPawn: undefined,
            deflectionPreview: undefined,
        });
    }

    const onPress = () => {
        if (state.previewPawn) {
            cancelPawn();
        } else {
            endTurn();
        }
    }

    const isCurrentPlayerTimer = playerId === player?.id;

    const getTimerIcon = () => {
        if (!isCurrentPlayerTimer) {
            if (playerId === playerTurn) return 'CLOCK';
            else return 'WAITING';
        } else {
            if (state.previewPawn) return 'CANCEL';
            else if (playerId === playerTurn) return 'END';
            else return 'WAITING';
        }
    }
    const timerIcon = getTimerIcon();

    const colorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(
            colorAnim,
            {
                toValue: timerIcon === 'CANCEL' ? 0 : 1,
                duration: 100,
                useNativeDriver: true
            }
        ).start();
    }, [colorAnim, timerIcon]);

    return (
        <TouchableWithoutFeedback onPress={playerTurn === playerId ? onPress : undefined}>
            <View style={{ ...styles.turnTimerContainer, backgroundColor: isCurrentPlayerTimer ? '' : theme.colors.text }}>
                <View style={{ position: 'absolute', width: '100%', height: '100%', top: '50%' }}>
                    <Animated.View style={{ width: '100%', height: '100%', backgroundColor: theme.colors.text, transform: [{ scaleY: scaleAnim }] }}></Animated.View>
                </View>
                <View style={{ position: 'absolute', width: '100%', height: '100%', top: '50%' }}>
                    <Animated.View style={{ width: '100%', height: '100%', backgroundColor: '#73956F', opacity: colorAnim, transform: [{ scaleY: scaleAnim }] }}></Animated.View>
                </View>
                <View style={styles.iconContainer}>
                    <TurnTimerIcon key={'timer_icon'} icon={timerIcon} dotColor={isCurrentPlayerTimer ? theme.colors.text : theme.colors.background} />
                </View>
                <View style={{ ...styles.timerBorder, borderColor: theme.colors.text }} ></View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    turnTimerContainer: {
        overflow: 'hidden',
        marginTop: 16,
        width: '100%',
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
    iconPosition: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    waitingDot: {
        width: 12,
        height: 12,
        marginHorizontal: 4,
        borderRadius: 100
    }
});

export default TurnTimer;