import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    View,
} from 'react-native';
import { Pawn } from '../types/types';
import BallPathPreview from './BallPathPreview';
import { useGameState } from './game_state_provider';
import GridCell from './GridCell';
import { Deflection } from './types';

interface Props {
    gridSize: number
}

const updatePawns = (deflection: Deflection, pawns: Pawn[][]): Pawn[][] => {
    if (!pawns[deflection.position.y] || !pawns[deflection.position.y][deflection.position.x]) return pawns;

    pawns[deflection.position.y][deflection.position.x].durability -= 1;
    deflection.events.forEach(event => {
        if (event.name === 'DESTROY_PAWN') {
            pawns[event.position.y][event.position.x].name = '';
        }
    });
    return [...pawns];
}

const startAnimation = async (animation: { start: Function }) => {
    return new Promise(resolve => {
        animation.start(() => {
            resolve(true);
        });
    });
}

const GameGrid = ({ gridSize }: Props) => {
    const { state, updateState } = useGameState();
    const { deflectionProcessing, game: { playerTurn, gameBoard: { pawns, xMax, yMax } }, allDeflections } = state;

    const bounceAnim = useRef(new Animated.Value(0.5)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.spring(
                    bounceAnim,
                    {
                        toValue: 0.7,
                        speed: 2,
                        bounciness: 20,
                        useNativeDriver: true
                    }
                ),
                Animated.spring(
                    bounceAnim,
                    {
                        toValue: 0.5,
                        speed: 10,
                        bounciness: 5,
                        useNativeDriver: true
                    }
                ),
            ])
        ).start();
    }, [bounceAnim]);


    const posAnim = useRef(new Animated.ValueXY()).current;
    const ballScaleAnim = useRef(new Animated.Value(0)).current;

    const expandBall = Animated.timing(
        ballScaleAnim,
        {
            toValue: 1,
            easing: Easing.elastic(1),
            duration: 300,
            useNativeDriver: true,
        }
    );

    const shrinkBall = Animated.timing(
        ballScaleAnim,
        {
            toValue: 0,
            easing: Easing.back(1),
            duration: 200,
            useNativeDriver: true,
        }
    );

    useEffect(() => {
        if (
            !deflectionProcessing.isActive
            || deflectionProcessing.allDeflectionsIndex >= allDeflections.length
            || allDeflections[deflectionProcessing.allDeflectionsIndex].length === 0
        ) return;

        const deflections = allDeflections[deflectionProcessing.allDeflectionsIndex];

        if (deflections.length > 0) {
            posAnim.setValue(deflections[0].position)
        }
        (async () => {
            for (let i = 0; i < deflections.length; i++) {
                const deflection = deflections[i];

                let anim = Animated.timing(
                    posAnim,
                    {
                        toValue: deflection.position,
                        duration: 200,
                        useNativeDriver: true
                    }
                );

                if (i === 0) {
                    anim = Animated.parallel([anim, expandBall]);
                } else if (i === deflections.length - 1) {
                    anim = Animated.parallel([anim, shrinkBall]);
                }

                await startAnimation(anim);
                const updatedPawns = updatePawns(deflection, pawns);
                updateState.updatePawns(updatedPawns);
            }

            const nextIndex = deflectionProcessing.allDeflectionsIndex + 1;
            updateState.updateDeflectionProcessing({
                isActive: nextIndex < allDeflections.length,
                allDeflectionsIndex: Math.min(nextIndex, allDeflections.length)
            });
        })();
    }, [deflectionProcessing.isActive, deflectionProcessing.allDeflectionsIndex]);

    const rows = xMax + 1;
    const rowsWithPadding = rows + 1;
    const cols = yMax + 1;

    const cellSize = Math.min(gridSize / rowsWithPadding, gridSize / cols);

    const grid = Array(rows).fill(undefined).map((_, rowIdx) => {
        const columns = Array(cols).fill(undefined).map((_, colIdx) => {
            return <GridCell key={`cell_${rowIdx}_${colIdx}`} colIdx={colIdx} rowIdx={rowIdx} bounceAnim={bounceAnim} />
        });

        return <View key={`grid_${rowIdx}`} style={{ display: 'flex', flexDirection: 'row', flex: 1, width: '100%', height: '100%' }}>
            {columns}
        </View>
    });

    const ballDiameter = 30;
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
            <View style={{ height: cellSize / 2 }}></View>
            <View style={{ position: 'relative', display: 'flex', flexDirection: 'column', width: cellSize * cols, height: cellSize * rows }}>
                {grid}
            </View>
            <View style={{ position: 'absolute', width: cellSize * rows, height: cellSize * cols }}>
                <BallPathPreview cellSize={cellSize} />
            </View>
            <View style={{ width: '100%', top: -ballDiameter / 2 - cellSize * (rows - 0.5), left: -ballDiameter / 2 + cellSize / 2 }}>
                <Animated.View style={{
                    width: ballDiameter,
                    height: ballDiameter,
                    borderRadius: 100,
                    position: 'absolute',
                    backgroundColor: 'black',
                    transform: [
                        { translateX: Animated.multiply(posAnim.x, cellSize) },
                        { translateY: Animated.multiply(posAnim.y, cellSize) },
                        { scale: ballScaleAnim }
                    ]
                }}></Animated.View>
            </View>
            <View style={{ height: cellSize / 2 }}></View>
        </View>
    );
};

export default GameGrid;