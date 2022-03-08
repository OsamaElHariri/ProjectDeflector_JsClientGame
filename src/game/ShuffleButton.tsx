import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import {
    Animated,
    Image,
    Pressable,
    Text,
    View,
} from 'react-native';
import { useSyncedAnimation } from '../main_providers/synced_animation';
import GameService from './gameService';
import { useGameState } from './game_state_provider';
import Spinner from './Spinner';

interface Props {
    width: number
    playerId: string
}

const ShuffleButton = ({ width, playerId }: Props) => {
    const theme = useTheme();
    const { stateSubject, networkRequestStatus, updateState } = useGameState();
    const bounceAnim = useSyncedAnimation();
    const networkKey = `loading_${playerId}`;

    const [state, setState] = useState({
        networkState: networkRequestStatus.subject.value[networkKey]
    });

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
        const res = await (new GameService).shuffle({
            gameId: stateSubject.value.game.gameId,
            hasPeek: false,
            playerSide: playerId,
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
        <View style={{ position: 'absolute', width: 18, height: 18, right: 5 }}>
            {state.networkState === 'LOADING' ? <Spinner /> : null}
        </View>
        <Pressable onPress={shuffle}>
            <Animated.View style={{ display: 'flex', alignItems: 'center', paddingTop: 8, paddingBottom: 16, transform: [{ scale: bounceAnim }] }}>
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
