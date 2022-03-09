import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { usePlayer } from '../main_providers/player_provider';
import { useSyncedAnimation } from '../main_providers/synced_animation';
import { shouldUpdate } from './diffWatcher';
import GameService from './gameService';
import { useGameState } from './game_state_provider';
import Spinner from './Spinner';
import TurnTimerIcon, { TurnTimerIconOption } from "./TurnTimerIcons";
import { GameState } from './types';

interface Props {
    playerId: string
}

const TurnTimer = ({ playerId }: Props) => {
    const theme = useTheme();
    const player = usePlayer();
    const bounceAnim = useSyncedAnimation();
    const networkKey = `turn_timer_${playerId}`;

    const { stateSubject, networkRequestStatus, updateState } = useGameState();

    const isCurrentPlayerTimer = playerId === player?.id;

    const getTimerIcon = (gameState: GameState) => {
        if (!isCurrentPlayerTimer) {
            if (playerId === gameState.game.playerTurn) return 'CLOCK';
            else return 'WAITING';
        } else {
            if (gameState.previewPawn) return 'CANCEL';
            else if (playerId === gameState.game.playerTurn) return 'END';
            else return 'WAITING';
        }
    }

    const [state, setState] = useState({
        networkState: networkRequestStatus.subject.value[networkKey],
        playerTurn: stateSubject.value.game.playerTurn,
        icon: getTimerIcon(stateSubject.value)
    });

    useEffect(() => {
        const sub = stateSubject.subscribe(gameState => {
            const newState = {
                ...state,
                playerTurn: gameState.game.playerTurn,
                icon: getTimerIcon(gameState)
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
        scaleAnim.setValue(state.playerTurn === playerId ? 2 : 0)
        Animated.timing(
            scaleAnim,
            {
                toValue: 0,
                duration: 1000 * 10,
                easing: Easing.linear,
                useNativeDriver: true
            }
        ).start();
    }, [scaleAnim, state.playerTurn]);

    const endTurn = async () => {
        if (state.networkState === 'LOADING') return;
        networkRequestStatus.update(networkKey, 'LOADING');

        const res = await (new GameService).endTurn({
            gameId: stateSubject.value.game.gameId,
            playerSide: playerId,
        }).catch(err => {
            networkRequestStatus.update(networkKey, 'ERROR');
        });
        if (!res) return;
        networkRequestStatus.update(networkKey, 'NONE');

        updateState.onEndTurn(res);
    }

    const cancelPawn = () => {
        updateState.onCancelPeek();
    }

    const onPress = () => {
        if (stateSubject.value.previewPawn) {
            cancelPawn();
        } else {
            endTurn();
        }
    }

    const timerIcon = state.icon as TurnTimerIconOption;

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

    const iconScaleAnim = state.icon === 'END' || state.icon === 'CANCEL'
        ? Animated.add(0.5, Animated.multiply(0.5, bounceAnim))
        : new Animated.Value(1);

    let color = stateSubject.value.game.colors[playerId];


    return (
        <View style={{ marginTop: 16 }}>
            <Pressable onPress={state.playerTurn === playerId ? onPress : undefined}>
                <View style={{ ...styles.turnTimerContainer, backgroundColor: isCurrentPlayerTimer ? '' : theme.colors.text }}>
                    <View style={{ position: 'absolute', width: '100%', height: '100%', top: '50%' }}>
                        <Animated.View style={{ width: '100%', height: '100%', backgroundColor: theme.colors.text, transform: [{ scaleY: scaleAnim }] }}></Animated.View>
                    </View>
                    <View style={{ position: 'absolute', width: '100%', height: '100%', top: '50%' }}>
                        <Animated.View style={{ width: '100%', height: '100%', backgroundColor: color, opacity: colorAnim, transform: [{ scaleY: scaleAnim }] }}></Animated.View>
                    </View>
                    <Animated.View style={{ ...styles.iconContainer, transform: [{ scale: iconScaleAnim }] }}>
                        <TurnTimerIcon key={'timer_icon'} icon={timerIcon} dotColor={isCurrentPlayerTimer ? theme.colors.text : theme.colors.background} playerColor={color} />
                    </Animated.View>
                    <View style={{ ...styles.timerBorder, borderColor: theme.colors.text }} ></View>
                </View>
            </Pressable>

            <View style={{ position: 'absolute', width: 18, height: 18, right: 10, top: 10 }}>
                {state.networkState === 'LOADING' ? <Spinner /> : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    turnTimerContainer: {
        overflow: 'hidden',
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