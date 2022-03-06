import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    View,
} from 'react-native';
import { Pawn } from '../types/types';
import BallPathPreview from './BallPathPreview';
import { shouldUpdate } from './diffWatcher';
import { useGameState } from './game_state_provider';
import GridCell from './GridCell';
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
    const watchValues = useRef({
        allDeflections: stateSubject.value.allDeflections,
        ...stateSubject.value.deflectionProcessing,
    });

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
            duration: 50,
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

                const anims = deflections.map((deflection, i) => {
                    if (i === 0 && deflectionProcessing.allDeflectionsIndex === 0) {
                        return expandBall;
                    } else if (i === 0) {
                        return Animated.delay(50);
                    }
                    const previousDeflection = deflections[i - 1];

                    const distance = Math.abs(previousDeflection.position.x - deflection.position.x)
                        + Math.abs(previousDeflection.position.y - deflection.position.y);

                    const timePerCell = 100 - (5 * i)
                    const time = distance * Math.max(timePerCell, 50);

                    const anims = [
                        Animated.timing(
                            posAnim,
                            {
                                toValue: deflection.position,
                                duration: time,
                                useNativeDriver: true
                            }
                        )
                    ];

                    const key = `cell_${previousDeflection.position.y}_${previousDeflection.position.x}`;
                    const setDurability = previousDeflection.events.find(evt => evt.name === 'SET_DURABILITY');
                    if (animatedDurabilities.current[key] && setDurability) {
                        const durabilityAnim = Animated.timing(
                            animatedDurabilities.current[key],
                            {
                                toValue: setDurability.durability,
                                duration: 10,
                                useNativeDriver: true
                            }
                        );
                        anims.push(durabilityAnim);
                    }

                    if (i === 1) {
                        anims.push(expandBall);
                    } else if (i === deflections.length - 1) {
                        anims.push(shrinkBall);
                    }
                    return Animated.parallel(anims);
                });
                await startAnimation(Animated.sequence(anims));

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
                animatedDurabilities.current[key] = new Animated.Value(0)
            }
            return <GridCell key={key} durability={animatedDurabilities.current[key]} colIdx={colIdx} rowIdx={rowIdx} bounceAnim={bounceAnim} />
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