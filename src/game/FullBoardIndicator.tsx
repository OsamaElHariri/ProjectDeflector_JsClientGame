import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';

import {
    Animated, Easing, View,
} from 'react-native';
import { BALL_DIAMETER } from '../constants';
import { shouldUpdate } from './diffWatcher';
import { useGameState } from './game_state_provider';
import { GameState } from './types';

interface Props {
    gridSize: number
}

const FullBoardIndicator = ({ gridSize }: Props) => {
    const theme = useTheme();
    const { stateSubject } = useGameState();
    const scaleAnim = useRef(new Animated.Value(0)).current;

    const getShouldDisplay = (gameState: GameState) =>
        gameState.deflectionProcessing.isActive && gameState.allDeflections.length > 1;


    const [state, setState] = useState({
        shouldDisplay: getShouldDisplay(stateSubject.value),
    });

    useEffect(() => {
        Animated.timing(
            scaleAnim,
            {
                toValue: state.shouldDisplay ? 1 : 0,
                duration: state.shouldDisplay ? 300 : 200,
                easing: state.shouldDisplay ? Easing.elastic(2) : Easing.linear,
                useNativeDriver: true
            }
        ).start();
    }, [state.shouldDisplay]);

    useEffect(() => {
        const sub = stateSubject.subscribe(gameState => {
            const newState = {
                shouldDisplay: getShouldDisplay(gameState),
            }
            if (shouldUpdate(newState, state)) {
                setState(newState);
            }
        });
        return () => sub.unsubscribe();
    }, [state]);

    return <View style={{ height: '100%', width: gridSize, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-end',
        }}>
            <Animated.Text style={{
                color: theme.colors.text,
                textAlignVertical: 'center',
                fontSize: 18,
                fontWeight: 'bold',
                letterSpacing: 3,
                transform: [{ scale: scaleAnim }],
            }}>FULL</Animated.Text>
        </View>
        <View style={{ paddingRight: BALL_DIAMETER * 1.5 }} />
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-start',
        }}>
            <Animated.Text style={{
                color: theme.colors.text,
                textAlignVertical: 'center',
                fontSize: 18,
                fontWeight: 'bold',
                letterSpacing: 3,
                transform: [{ scale: scaleAnim }],
            }}>BOARD</Animated.Text>
        </View>
    </View>
}

export default FullBoardIndicator;
