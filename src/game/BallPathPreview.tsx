import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    View,
} from 'react-native';
import { shouldUpdate } from './diffWatcher';
import { useGameState } from './game_state_provider';
import { Deflection, Direction, GameState } from './types';

interface LineProps {
    width: number
}

const Line = ({ width }: LineProps) => {
    const offseteAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.timing(
                offseteAnim,
                {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.linear,
                    useNativeDriver: true
                }
            )
        ).start();
    }, [offseteAnim]);

    const dashWidth = 15;
    const dashSpace = 14;
    const dashHeight = 8;

    const dashCount = Math.ceil(width / (dashWidth + dashSpace));
    const dashes = Array(dashCount + 1).fill(undefined).map((_, i) => {
        return <View
            key={`dash_${i}`}
            style={{
                width: dashWidth,
                height: dashHeight,
                marginRight: dashSpace,
                backgroundColor: 'red',
                borderRadius: dashHeight
            }}>
        </View>
    });

    return <View style={{
        width: width,
        height: dashHeight,
        overflow: 'hidden',
        borderRadius: dashHeight,
        top: -dashHeight / 2,
        left: -width / 2,
        transform: [
            { translateX: width / 2 },
        ]
    }}>
        <Animated.View style={{
            display: 'flex',
            flexDirection: 'row',
            transform: [{
                translateX: Animated.multiply(
                    Animated.subtract(1, offseteAnim),
                    -dashSpace - dashWidth
                )
            }]
        }}>
            {dashes}
        </Animated.View>
    </View>
}

interface Props {
    cellSize: number
}

const BallPathPreview = ({ cellSize }: Props) => {
    const { stateSubject } = useGameState();

    const getDeflections = (gameState: GameState) => {
        let deflectionPath: Deflection[] | undefined = gameState.deflectionPreview || gameState.currentTurnDeflections || gameState.game.deflections;

        if (gameState.deflectionProcessing.isActive && gameState.allDeflections[gameState.deflectionProcessing.allDeflectionsIndex]) {
            deflectionPath = undefined;
        }
        return deflectionPath;
    }

    const [state, setState] = useState({
        deflections: getDeflections(stateSubject.value)
    });

    useEffect(() => {
        const sub = stateSubject.subscribe(gameState => {
            const deflections = getDeflections(gameState);
            if (shouldUpdate({ deflections }, state)) {
                setState({ deflections });
            }
        });

        return () => sub.unsubscribe();
    }, [state]);

    if (!state.deflections) {
        return <></>
    }

    const getRotationDegrees = (direction: Direction) => {
        if (direction === 'UP') return '90deg';
        if (direction === 'DOWN') return '-90deg';
        if (direction === 'LEFT') return '180deg';
        if (direction === 'RIGHT') return '0deg';
        return '0deg';
    }

    const deflectionPath = state.deflections;
    const lines = deflectionPath.map((deflection, i) => {
        if (i === deflectionPath.length - 1) return undefined;

        const currentPos = deflection.position;
        const nextPos = deflectionPath[i + 1].position;

        let width = Math.abs(nextPos.x - currentPos.x + nextPos.y - currentPos.y) * cellSize;
        if (i === deflectionPath.length - 2) {
            width -= cellSize * 0.45;
        }

        return <View
            pointerEvents='none'
            key={`line_${currentPos.x}_${currentPos.y}_${i}`}
            style={{
                width: 0,
                height: 0,
                left: cellSize / 2 + deflection.position.x * cellSize,
                top: cellSize / 2 + deflection.position.y * cellSize,
                transform: [
                    { rotateZ: getRotationDegrees(deflection.toDirection) },
                ],
            }}>
            <Line width={width} />
        </View>
    });

    return (
        <>
            {lines}
        </>
    );
};

export default BallPathPreview;