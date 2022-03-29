import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import {
    Animated,
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
        variant,
        variantLength: stateSubject.value.game.variants[playerId].length
    });

    useEffect(() => {
        const sub = stateSubject.subscribe(({ game: { variants } }) => {
            const [variant] = variants[playerId].slice(-1);
            const newState = {
                variant: variant,
                variantLength: variants[playerId].length,
            };
            if (shouldUpdate(newState, state)) {
                setState(newState);
            }
        });

        return () => sub.unsubscribe();
    }, [state])
    let color = stateSubject.value.players[playerId].color;

    return <View style={{ marginTop: 8, padding: 8, height: width * 0.8, width: width * 0.8 }}>
        <View style={{ ...styles.pawnPreviewContainer, borderColor: theme.colors.text }}>
            <PawnVisual durability={new Animated.Value(5)} variant={state.variant} color={color} animationCursor={state.variantLength}></PawnVisual>
        </View>
    </View>
}

const styles = StyleSheet.create({
    pawnPreviewContainer: {
        borderWidth: 4,
    },
});

export default PawnPreviewContainer;