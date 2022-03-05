import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import {
    Button,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { usePlayer } from '../main_providers/player_provider';
import { AppNavigation } from '../types/uiTypes';
import { shouldUpdate } from './diffWatcher';
import { useGameState } from './game_state_provider';

const WinnerOverlay = () => {
    const theme = useTheme();
    const player = usePlayer();
    const { stateSubject } = useGameState();
    const nav = useNavigation<AppNavigation>();

    const [state, setState] = useState({
        winner: stateSubject.value.winner
    });

    useEffect(() => {
        const sub = stateSubject.subscribe(({ winner }) => {
            const newState = { winner };
            if (shouldUpdate(newState, state)) {
                setState(newState);
            }
        });

        return () => sub.unsubscribe();
    }, [state]);

    const winner = state.winner;
    if (!winner) {
        return <View></View>
    }

    const backToMenu = () => {
        nav.replace('Lobby');
    }

    const text = winner === player?.id ? 'YOU WON' : 'YOU LOST...';
    const subtitleText = winner === player?.id ? 'That was amazing!' : 'But you sure had fun, am I right?';

    return <View style={{ ...styles.overlay, backgroundColor: theme.colors.background }}>
        <Text style={{ fontWeight: 'bold', color: theme.colors.text, fontSize: 32 }}>{text}</Text>
        <Text style={{ fontWeight: 'bold', color: theme.colors.text, fontSize: 24 }}>{subtitleText}</Text>
        <View style={styles.button}>
            <Button
                title='GO TO MENU'
                onPress={backToMenu}
            />
        </View>
    </View>
}

const styles = StyleSheet.create({
    overlay: {
        paddingTop: '10%',
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%',
        textAlign: 'center',
    },
    button: {
        marginTop: 24,
    },
});

export default WinnerOverlay;
