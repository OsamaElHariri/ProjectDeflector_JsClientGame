import { useTheme } from '@react-navigation/native';
import React from 'react';

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { usePlayer } from '../main_providers/player_provider';

interface Props {
    playerId: string
}

const PlayerNameTag = ({ playerId }: Props) => {
    const theme = useTheme();
    const { player } = usePlayer();

    if (player?.id === playerId) {
        return <View style={{ ...styles.tag, backgroundColor: player.color }}>
            <Text style={{ ...styles.tagText, color: theme.colors.background }}>You</Text>
        </View>
    }
    return <View style={{ ...styles.tag, borderWidth: 2, borderColor: theme.colors.text }}>
        <Text style={{ ...styles.tagText, color: theme.colors.text }}>Them</Text>
    </View>
}


const styles = StyleSheet.create({
    tag: {
        width: '70%',
        marginTop: 8,
        padding: 2,
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
