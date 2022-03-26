import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';

import {
    Animated,
    Easing,
    Image,
    Pressable,
    Text,
    View,
} from 'react-native';
import { usePlayer } from '../main_providers/player_provider';
import { useSyncedAnimation } from '../main_providers/synced_animation';
import { shouldUpdate } from './diffWatcher';
import GameService from './gameService';
import { useGameState } from './game_state_provider';
import Spinner from './Spinner';

interface Props {
    width: number
    playerId: string
}

const ShuffleButton = ({ width, playerId }: Props) => {
    const theme = useTheme();
    const { player } = usePlayer();
    const { stateSubject, networkRequestStatus, updateState } = useGameState();
    const leftSide = stateSubject.value.game.playerIds[0] === playerId;
    const bounceAnim = useSyncedAnimation();
    const scaleAnim = useRef(new Animated.Value(0)).current
    const networkKey = `loading_${playerId}`;

    const [state, setState] = useState({
        playerTurn: stateSubject.value.game.playerTurn,
        canShuffle: stateSubject.value.game.playerTurn === playerId && stateSubject.value.game.availableShuffles[playerId] > 0,
        networkState: networkRequestStatus.subject.value[networkKey]
    });

    useEffect(() => {
        Animated.timing(
            scaleAnim,
            {
                toValue: state.canShuffle ? 1 : 0,
                duration: state.canShuffle ? 500 : 200,
                easing: state.canShuffle ? Easing.elastic(2) : Easing.linear,
                useNativeDriver: true
            }
        ).start();
    }, [scaleAnim, state.canShuffle]);

    useEffect(() => {
        const sub = stateSubject.subscribe(({ game: { availableShuffles, playerTurn } }) => {
            const newState = {
                ...state,
                canShuffle: playerId === player?.id && playerTurn === playerId && availableShuffles[playerTurn] > 0,
                playerTurn,
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

    const shuffle = async () => {
        if (state.networkState === 'LOADING') return;
        networkRequestStatus.update(networkKey, 'LOADING');
        const res = await GameService.shuffle({
            gameId: stateSubject.value.game.gameId,
            hasPeek: false,
            x: 0,
            y: 0
        }).catch(err => {
            networkRequestStatus.update(networkKey, 'ERROR');
        });

        if (!res) return;
        networkRequestStatus.update(networkKey, 'NONE');
        updateState.onShuffle(res);
    }

    return <View>
        <View style={{ position: 'absolute', width: 18, height: 18, right: leftSide ? 5 : undefined, left: leftSide ? undefined : 5 }}>
            {state.networkState === 'LOADING' ? <Spinner /> : null}
        </View>
        <Pressable onPress={state.canShuffle ? shuffle : undefined}>
            <Animated.View style={{
                display: 'flex',
                alignItems: 'center',
                paddingTop: 8,
                paddingBottom: 16,
                transform: [{
                    scale: Animated.multiply(bounceAnim, scaleAnim)
                }]
            }}>
                <View style={{ width: width, height: width * 0.4 }}>
                    <Image source={require('./assets/shuffle.png')} style={{
                        resizeMode: 'center',
                        width: '100%',
                        height: '100%',
                        tintColor: theme.colors.text,
                    }} />
                </View>
                <Text style={{ fontWeight: 'bold', color: theme.colors.text, paddingTop: 8 }}>Shuffle</Text>
            </Animated.View>
        </Pressable>
    </View>
}

export default ShuffleButton;
