import { RouteProp, useNavigation, useTheme } from '@react-navigation/native';
import React, { useState } from 'react';

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
import Spinner from './Spinner';

interface Props {
    route: RouteProp<{ params: { winner: string } }, 'params'>
}

const WinnerOverlay = ({ route: { params: { winner } } }: Props) => {
    const theme = useTheme();
    const { player, updatePlayer } = usePlayer();
    const nav = useNavigation<AppNavigation>();
    const { bounceAnim } = useSyncedAnimation();
    const [isLoading, setIsLoading] = useState(false);

    const backToMenu = async () => {
        if (!player || !updatePlayer || isLoading) return;
        setIsLoading(true);

        const stats = await UserService.getStats();
        const user = await UserService.getCurrentUser();
        if (!user) {
            player.gameStats.games += 1;
            updatePlayer({ ...player });
        } else {
            updatePlayer({
                ...user,
                gameStats: stats
            });
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
        borderRadius: 10,
    },
    buttonText: {
        fontWeight: 'bold',
        textAlignVertical: 'center',
        textAlign: 'center',
        marginVertical: 4,
    }
});

export default WinnerOverlay;
