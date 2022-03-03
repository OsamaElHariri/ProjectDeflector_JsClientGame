import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    View,
} from 'react-native';
import { BehaviorSubject } from 'rxjs';
import { LONG_PRESS_DELAY } from '../constants';
import PressIndicator from '../gesture_feedback/PressIndicator';
import { usePlayer } from '../main_providers/player_provider';
import { GestureState } from '../types/uiTypes';
import BallPathPreview from './BallPathPreview';
import GameService from './gameService';
import { useGameState } from './game_state_provider';
import PawnVisual from './PawnVisual';

interface Props {
    gridSize: number
}

const startAnimation = async (animation: { start: Function }) => {
    return new Promise(resolve => {
        animation.start(() => {
            resolve(true);
        });
    });
}

const GameGrid = ({ gridSize }: Props) => {
    const theme = useTheme();
    const player = usePlayer();
    const { state, updateState } = useGameState();
    const { game: { playerTurn, gameBoard: { pawns, xMax, yMax } }, allDeflections } = state;
    const gestureHandlers = useRef<{ [key: string]: BehaviorSubject<GestureState> }>({})

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
    useEffect(() => {
        if (allDeflections.length === 0) return;

        (async () => {
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

            for (let i = 0; i < allDeflections.length; i++) {
                const deflections = allDeflections[i];
                posAnim.setValue(deflections[0].position);
                const animations = deflections.map((deflection, idx) => {
                    const anim = Animated.timing(
                        posAnim,
                        {
                            toValue: deflection.position,
                            duration: 200,
                            useNativeDriver: true
                        }
                    );
                    if (idx === 0) {
                        return Animated.parallel([anim, expandBall]);
                    } else if (idx === deflections.length - 1) {
                        return Animated.parallel([anim, shrinkBall]);
                    } else {
                        return anim;
                    }
                });
                await startAnimation(Animated.sequence(animations));
            }
        })();
    }, [allDeflections]);

    const rows = xMax + 1;
    const rowsWithPadding = rows + 1;
    const cols = yMax + 1;

    const cellSize = Math.min(gridSize / rowsWithPadding, gridSize / cols);

    const gridBorder = 2;

    const addPawn = async (x: number, y: number) => {
        const res = await (new GameService).addPawn({
            gameId: state.game.gameId,
            playerSide: state.game.playerTurn,
            x,
            y,
        });
        state.game.gameBoard.pawns[y][x] = res.newPawn;
        updateState({
            ...state,
            previewPawn: undefined,
            currentTurnDeflections: res.deflections,
            game: {
                ...state.game,
                variants: res.variants,
                gameBoard: {
                    ...state.game.gameBoard,
                    scoreBoard: res.scoreBoard,
                    pawns: [...state.game.gameBoard.pawns]
                }
            },
        });
    }

    const peek = async (x: number, y: number) => {
        const res = await (new GameService).peek({
            gameId: state.game.gameId,
            playerSide: state.game.playerTurn,
            x,
            y,
        });
        updateState({
            ...state,
            deflectionPreview: res.deflections,
            previewPawn: res.newPawn
        });
    }

    const onLongPress = (key: string, x: number, y: number) => {
        gestureHandlers.current[key].next({
            ...gestureHandlers.current[key].value,
            isHeld: false,
            isEnabled: false,
            isPressTriggered: false,
            isLongPressTriggered: true
        });
        addPawn(x, y);
    }

    const onPress = (key: string, x: number, y: number) => {
        gestureHandlers.current[key].next({
            ...gestureHandlers.current[key].value,
            isHeld: false,
            isPressTriggered: true,
            isLongPressTriggered: false
        });
        peek(x, y);
    }

    const onPressIn = (key: string) => {
        gestureHandlers.current[key].next({
            ...gestureHandlers.current[key].value,
            isHeld: true,
            isLongPressTriggered: false,
            isPressTriggered: false
        });
    }

    const onPressOut = (key: string) => {
        if (!gestureHandlers.current[key].value.isHeld) return;
        gestureHandlers.current[key].next({
            ...gestureHandlers.current[key].value,
            isHeld: false,
        });
    }

    const grid = Array(rows).fill(undefined).map((_, rowIdx) => {
        const columns = Array(cols).fill(undefined).map((_, colIdx) => {
            let pawn = pawns[rowIdx][colIdx];
            let isPreview = false;
            if (pawn.name === '' && state.previewPawn) {
                const previewPos = state.previewPawn.position;
                if (previewPos.x === colIdx && previewPos.y === rowIdx) {
                    isPreview = true;
                    pawn = state.previewPawn;
                }
            }

            const key = `cell_${rowIdx}_${colIdx}`;
            if (!gestureHandlers.current[key]) {
                gestureHandlers.current[key] = new BehaviorSubject<GestureState>({
                    isEnabled: true,
                    isHeld: false,
                    isLongPressTriggered: false,
                    isPressTriggered: false,
                });
            }

            const canPress = pawn.name === '';
            const canLongPress = pawn.name === '' || isPreview;

            return <View key={key} style={{
                borderColor: theme.colors.text,
                borderTopWidth: rowIdx === 0 ? gridBorder * 2 : gridBorder,
                borderLeftWidth: colIdx === 0 ? gridBorder * 2 : gridBorder,
                borderBottomWidth: rowIdx === rows - 1 ? gridBorder * 2 : gridBorder,
                borderRightWidth: colIdx === cols - 1 ? gridBorder * 2 : gridBorder,
                flex: 1
            }}>
                <Pressable
                    style={{ width: '100%', height: '100%' }}
                    delayLongPress={LONG_PRESS_DELAY}
                    onPress={canPress ? (() => onPress(key, colIdx, rowIdx)) : undefined}
                    onLongPress={canLongPress ? (() => onLongPress(key, colIdx, rowIdx)) : undefined}
                    onPressIn={() => onPressIn(key)}
                    onPressOut={() => onPressOut(key)}
                >
                    <PressIndicator gestureStateObservable={gestureHandlers.current[key]} bounceAnim={bounceAnim} />
                    <View style={{ opacity: isPreview ? 0.4 : 1 }}>
                        <PawnVisual durability={pawn.durability} variant={pawn.name}></PawnVisual>
                    </View>
                </Pressable>
            </View>
        });

        return <View key={`grid_${rowIdx}`} style={{ display: 'flex', flexDirection: 'row', flex: 1, width: '100%', height: '100%' }}>
            {columns}
        </View>
    });

    useEffect(() => {
        pawns.forEach((pawnRow, rowIdx) => pawnRow.forEach((pawn, colIdx) => {
            const key = `cell_${rowIdx}_${colIdx}`;

            if (pawn.name === '' && playerTurn === player?.id) {
                gestureHandlers.current[key].next({
                    ...gestureHandlers.current[key].value,
                    isEnabled: true
                });
            } else {
                gestureHandlers.current[key].next({
                    ...gestureHandlers.current[key].value,
                    isEnabled: false
                });
            }
        }))
    }, [playerTurn])

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