import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import {
    StyleSheet,
    View,
} from 'react-native';
import { shouldUpdate } from './diffWatcher';
import { useGameState } from './game_state_provider';
import PawnVisual from './PawnVisual';
interface PawnPreviewContainerProps {
    width: number
    playerId: string
}

const PawnPreviewContainer = ({ width, playerId }: PawnPreviewContainerProps) => {
    const theme = useTheme();
    const { stateSubject } = useGameState();
    const [variant] = stateSubject.value.game.variants[playerId].slice(-1);
    const [state, setState] = useState({
        variant
    });

    useEffect(() => {
        const sub = stateSubject.subscribe(({ game: { variants } }) => {
            const [variant] = variants[playerId].slice(-1);
            const newState = { variant: variant };
            if (shouldUpdate(newState, state)) {
                setState(newState);
            }
        });

        return () => sub.unsubscribe();
    }, [state])

    return <View style={{ marginTop: 8, padding: 8, height: width * 0.8, width: width * 0.8 }}>
        <View style={{ ...styles.pawnPreviewContainer, borderColor: theme.colors.text }}>
            <PawnVisual durability={5} variant={state.variant}></PawnVisual>
        </View>
    </View>
}

const styles = StyleSheet.create({
    pawnPreviewContainer: {
        borderWidth: 4,
    },
});

export default PawnPreviewContainer;