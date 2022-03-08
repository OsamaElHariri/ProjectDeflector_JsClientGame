import { useTheme } from '@react-navigation/native';
import React from 'react';

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

interface Props {
    width: number
    playerId: string
}

const ShuffleButton = ({ width, playerId }: Props) => {
    const theme = useTheme();
    const { stateSubject, updateState } = useGameState();
    const bounceAnim = useSyncedAnimation();

    const shuffle = async () => {
        const res = await (new GameService).shuffle({
            gameId: stateSubject.value.game.gameId,
            hasPeek: false,
            playerSide: playerId,
            x: 0,
            y: 0
        });
        updateState.onShuffle(res);
    }

    return <Pressable onPress={shuffle}>
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
}

export default ShuffleButton;
