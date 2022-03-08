import React, { useEffect, useRef } from 'react';
import {
    Animated,
    View,
} from 'react-native';
import { Pawn } from '../types/types';
import BallPathPreview from './BallPathPreview';
import { shouldUpdate } from './diffWatcher';
import { useGameState } from './game_state_provider';
import GridCell from './GridCell';
import { getDeflectionAnimations } from './gridDeflectionAnimations';
import { Deflection } from './types';

interface Props {
    gridSize: number
}

const updatePawns = (deflection: Deflection, pawns: Pawn[][]): Pawn[][] => {
    if (!pawns[deflection.position.y] || !pawns[deflection.position.y][deflection.position.x]) return pawns;

    deflection.events.forEach(event => {
        if (event.name === 'DESTROY_PAWN') {
            pawns[event.position.y][event.position.x].name = '';
        } else if (event.name === 'SET_DURABILITY') {
            pawns[deflection.position.y][deflection.position.x].durability = event.durability;
        }
    });
    return pawns;
}

const startAnimation = async (animation: { start: Function }) => {
    return new Promise(resolve => {
        animation.start(() => {
            resolve(true);
        });
    });
}

const GameGrid = ({ gridSize }: Props) => {
    const { stateSubject, updateState } = useGameState();
    const animatedDurabilities = useRef<{ [key: string]: Animated.Value }>({});
    const pawnScaleAnim = useRef<{ [key: string]: Animated.Value }>({});
    const watchValues = useRef({
        allDeflections: stateSubject.value.allDeflections,
        ...stateSubject.value.deflectionProcessing,
    });

    const posAnim = useRef(new Animated.ValueXY()).current;
    const ballScaleAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    useEffect(() => {
        const sub = stateSubject.subscribe(({ allDeflections, deflectionProcessing, game: { gameBoard: { pawns } } }) => {
            if (!shouldUpdate(watchValues.current, { allDeflections, ...deflectionProcessing })) {
                return;
            }

            watchValues.current = { allDeflections, ...deflectionProcessing };

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
                await startAnimation(getDeflectionAnimations({
                    animatedDurabilities: animatedDurabilities.current,
                    ballPosAnim: posAnim,
                    ballScaleAnim: ballScaleAnim,
                    deflections: deflections,
                    pawnScaleAnim: pawnScaleAnim.current
                }));

                let newPawns = pawns;
                for (let i = 0; i < deflections.length; i++) {
                    newPawns = updatePawns(deflections[i], pawns);
                }
                updateState.updatePawns(newPawns);

                const nextIndex = deflectionProcessing.allDeflectionsIndex + 1;
                updateState.updateDeflectionProcessing({
                    isActive: nextIndex < allDeflections.length,
                    allDeflectionsIndex: Math.min(nextIndex, allDeflections.length)
                });
            })();
        });

        return () => sub.unsubscribe();
    }, []);

    const rows = stateSubject.value.game.gameBoard.xMax + 1;
    const rowsWithPadding = rows + 1;
    const cols = stateSubject.value.game.gameBoard.yMax + 1;

    const cellSize = Math.min(gridSize / rowsWithPadding, gridSize / cols);

    const grid = Array(rows).fill(undefined).map((_, rowIdx) => {
        const columns = Array(cols).fill(undefined).map((_, colIdx) => {
            const key = `cell_${rowIdx}_${colIdx}`;
            if (!animatedDurabilities.current[key]) {
                animatedDurabilities.current[key] = new Animated.Value(0);
            }
            if (!pawnScaleAnim.current[key]) {
                pawnScaleAnim.current[key] = new Animated.Value(1);
            }
            return <View key={key} style={{ flex: 1 }}>
                <GridCell durability={animatedDurabilities.current[key]}
                    colIdx={colIdx}
                    rowIdx={rowIdx}
                    scaleAnim={pawnScaleAnim.current[key]} />
            </View>
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
                        { scaleX: ballScaleAnim.x },
                        { scaleY: ballScaleAnim.y }
                    ]
                }}></Animated.View>
            </View>
            <View style={{ height: cellSize / 2 }}></View>
        </View>
    );
};

export default GameGrid;