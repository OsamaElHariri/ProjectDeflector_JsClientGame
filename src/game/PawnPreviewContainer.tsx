import { useTheme } from '@react-navigation/native';
import React from 'react';

import {
    StyleSheet,
    View,
} from 'react-native';
import { useGameState } from './game_state_provider';
import PawnVisual from './PawnVisual';
interface PawnPreviewContainerProps {
    width: number
    playerId: string
}

const PawnPreviewContainer = ({ width, playerId }: PawnPreviewContainerProps) => {
    const theme = useTheme();
    const { state } = useGameState();
    const [variant] = state.game.variants[playerId].slice(-1);

    return <View style={{ marginTop: 8, padding: 8, height: width * 0.8, width: width * 0.8 }}>
        <View style={{ ...styles.pawnPreviewContainer, borderColor: theme.colors.text }}>
            <PawnVisual durability={5} variant={variant}></PawnVisual>
        </View>
    </View>
}

const styles = StyleSheet.create({
    pawnPreviewContainer: {
        borderWidth: 4,
    },
});

export default PawnPreviewContainer;