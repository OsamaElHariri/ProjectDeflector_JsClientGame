import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import {
    Animated,
    DevSettings,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import PlainOverlay from '../lobby/PlainOverlay';
import { usePlayer } from '../main_providers/player_provider';
import { useSyncedAnimation } from '../main_providers/synced_animation';
import { AppNavigation } from '../types/uiTypes';
import { shouldUpdate } from './diffWatcher';
import { useGameState } from './game_state_provider';

const WinnerOverlay = () => {
    const theme = useTheme();
    const { player } = usePlayer();
    const { stateSubject } = useGameState();
    const nav = useNavigation<AppNavigation>();
    const { bounceAnim } = useSyncedAnimation();

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

    const backToMenu = () => {
        DevSettings.reload();
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
            <Animated.Text style={{
                ...styles.buttonText,
                fontSize: 14,
                color: theme.colors.text,
                transform: [{ scale: dampenedBounceAnim }]
            }}>Back to Menu</Animated.Text>
        </Pressable>
    </PlainOverlay>
}

const styles = StyleSheet.create({
    button: {
        marginTop: 40,
        borderWidth: 4,
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    buttonText: {
        fontWeight: 'bold',
        textAlignVertical: 'center',
        textAlign: 'center',
    }
});

export default WinnerOverlay;
