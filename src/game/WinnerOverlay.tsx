import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import PlainOverlay from '../lobby/PlainOverlay';
import UserService from '../lobby/userService';
import { usePlayer } from '../main_providers/player_provider';
import { useSyncedAnimation } from '../main_providers/synced_animation';
import { AppNavigation } from '../types/uiTypes';
import { shouldUpdate } from './diffWatcher';
import { useGameState } from './game_state_provider';
import Spinner from './Spinner';

const WinnerOverlay = () => {
    const theme = useTheme();
    const { player, updatePlayer } = usePlayer();
    const { stateSubject } = useGameState();
    const nav = useNavigation<AppNavigation>();
    const { bounceAnim } = useSyncedAnimation();
    const [isLoading, setIsLoading] = useState(false);

    const [state, setState] = useState({
        winner: stateSubject.value.winner,
        isDeflecting: stateSubject.value.deflectionProcessing.isActive
    });

    useEffect(() => {
        const sub = stateSubject.subscribe(({ winner, deflectionProcessing: { isActive } }) => {
            const newState = {
                winner,
                isDeflecting: isActive
            };
            if (shouldUpdate(newState, state)) {
                setState(newState);
            }
        });

        return () => sub.unsubscribe();
    }, [state]);

    const winner = state.winner;
    if (!winner || state.isDeflecting) {
        return <View></View>
    }

    const backToMenu = async () => {
        if (!player || !updatePlayer || isLoading) return;
        setIsLoading(true);

        await UserService.refreshStats().catch(() => { });
        const user = await UserService.getCurrentUser().catch(() => undefined);
        if (!user) {
            player.gameStats.games += 1;
            updatePlayer({ ...player });
        } else {
            updatePlayer(user);
        }
        nav.navigate('Lobby');
    }

    const text = winner === player?.id ? 'YOU WON' : 'YOU LOST...';
    const subtitleText = winner === player?.id ? 'That was amazing!' : 'But you sure had fun, am I right?';

    const dampenedBounceAnim = Animated.add(0.5, Animated.multiply(0.5, bounceAnim));
    return <PlainOverlay>
        <Text style={{ fontWeight: 'bold', color: theme.colors.text, fontSize: 32 }}>{text}</Text>
        <Text style={{ fontWeight: 'bold', color: theme.colors.text, fontSize: 24 }}>{subtitleText}</Text>
        <Pressable
            style={{ ...styles.button, backgroundColor: theme.colors.background, borderColor: theme.colors.text, borderWidth: 2 }}
            onPress={backToMenu}>
            {isLoading
                ? <View style={{ width: 28, height: 28, alignSelf: 'center' }}><Spinner /></View>
                : <Animated.Text style={{
                    ...styles.buttonText,
                    fontSize: 14,
                    color: theme.colors.text,
                    transform: [{ scale: dampenedBounceAnim }]
                }}>Back to Menu</Animated.Text>}
        </Pressable>
    </PlainOverlay>
}

const styles = StyleSheet.create({
    button: {
        marginTop: 40,
        borderWidth: 4,
        paddingVertical: 8,
        width: 140,
        height: 48,
    },
    buttonText: {
        fontWeight: 'bold',
        textAlignVertical: 'center',
        textAlign: 'center',
        marginVertical: 4,
    }
});

export default WinnerOverlay;
