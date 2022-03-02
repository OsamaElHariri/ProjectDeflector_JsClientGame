import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { usePlayer } from '../main_providers/player_provider';
import GameService from './gameService';
import { useGameState } from './game_state_provider';
import TurnTimerIcon from "./TurnTimerIcons";

interface Props {
    playerId: string
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
            currentTurnDeflections: undefined,
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
        <Pressable onPress={playerTurn === playerId ? onPress : undefined}>
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
        </Pressable>
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