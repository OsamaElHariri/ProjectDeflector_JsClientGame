import { useTheme } from '@react-navigation/native';
import React from 'react';

import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { BehaviorSubject } from 'rxjs';
import { usePlayer } from '../main_providers/player_provider';
import { useSyncedAnimation } from '../main_providers/synced_animation';

interface Props {
    playerId: string
    tutorialDisplay?: BehaviorSubject<boolean>
}

const PlayerNameTag = ({ playerId, tutorialDisplay }: Props) => {
    const theme = useTheme();
    const { bounceAnim } = useSyncedAnimation();
    const { player } = usePlayer();

    const scaleAnim = tutorialDisplay
        ? Animated.add(0.6, Animated.multiply(0.4, bounceAnim))
        : new Animated.Value(1);

    if (player?.id === playerId) {
        return <Pressable onPress={() => tutorialDisplay?.next(!tutorialDisplay.value)}>
            <View style={{ ...styles.tag, backgroundColor: player.color }}>
                <Text style={{ ...styles.tagText, color: theme.colors.background }}>You</Text>
                <Animated.Image source={require('./assets/info.png')} style={{
                    resizeMode: 'center',
                    width: 18,
                    height: 18,
                    tintColor: theme.colors.background,
                    marginLeft: 4,
                    transform: [{ scale: scaleAnim }]
                }} />
            </View>
        </Pressable>
    }
    return <View style={{ ...styles.tag, borderWidth: 2, borderColor: theme.colors.text }}>
        <Text style={{ ...styles.tagText, color: theme.colors.text }}>Them</Text>
    </View>
}

const styles = StyleSheet.create({
    tag: {
        minWidth: '70%',
        marginTop: 8,
        marginBottom: 12,
        padding: 4,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    tagText: {
        fontSize: 14,
        alignSelf: 'center',
        textAlignVertical: 'center',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
});

export default PlayerNameTag;
