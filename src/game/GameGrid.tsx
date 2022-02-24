import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
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
    const { state, updateState } = useGameState();
    const { game: { gameBoard: { pawns, xMax, yMax } }, allDeflections } = state;
    const posAnim = useRef(new Animated.ValueXY()).current;

    useEffect(() => {
        if (allDeflections.length === 0) return;

        (async () => {
            for (let i = 0; i < allDeflections.length; i++) {
                const deflections = allDeflections[i];
                posAnim.setValue(deflections[0].position);
                const animations = deflections.map(deflection => (
                    Animated.timing(
                        posAnim,
                        {
                            toValue: deflection.position,
                            duration: 200,
                            useNativeDriver: true
                        }
                    )
                ));
                await startAnimation(Animated.sequence(animations));
            }
        })();
    }, [allDeflections])

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
        state.game.gameBoard.pawns[y][x] = res.newPawn
        updateState({
            ...state,
            game: {
                ...state.game,
                variants: res.variants,
                gameBoard: {
                    ...state.game.gameBoard,
                    scoreBoard: res.scoreBoard,
                    pawns: [...state.game.gameBoard.pawns]
                }
            }
        })
    }

    const grid = Array(rows).fill(undefined).map((_, rowIdx) => {
        const columns = Array(cols).fill(undefined).map((_, colIdx) => {
            const pawn = pawns[rowIdx][colIdx];

            return <TouchableWithoutFeedback key={`cell_${colIdx}`} onPress={pawn.name === '' ? (() => addPawn(colIdx, rowIdx)) : undefined}>
                <View style={{
                    borderColor: theme.colors.text,
                    borderTopWidth: rowIdx === 0 ? gridBorder * 2 : gridBorder,
                    borderLeftWidth: colIdx === 0 ? gridBorder * 2 : gridBorder,
                    borderBottomWidth: rowIdx === rows - 1 ? gridBorder * 2 : gridBorder,
                    borderRightWidth: colIdx === cols - 1 ? gridBorder * 2 : gridBorder,
                    flex: 1
                }}>
                    <PawnVisual durability={pawn.durability} variant={pawn.name}></PawnVisual>
                </View>
            </TouchableWithoutFeedback>
        });

        return <View key={`grid_${rowIdx}`} style={{ display: 'flex', flexDirection: 'row', flex: 1, width: '100%', height: '100%' }}>
            {columns}
        </View>
    });

    const ballDiameter = 30;
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
            <View style={{ height: cellSize / 2 }}></View>
            <View style={{ width: '100%', top: -ballDiameter / 2 + cellSize / 2, left: -ballDiameter / 2 + cellSize / 2 }}>
                <Animated.View style={{
                    width: ballDiameter,
                    height: ballDiameter,
                    borderRadius: 100,
                    position: 'absolute',
                    backgroundColor: 'black',
                    transform: [{ translateX: Animated.multiply(posAnim.x, cellSize) }, { translateY: Animated.multiply(posAnim.y, cellSize) }]
                }}></Animated.View>
            </View>
            <View style={{ position: 'relative', display: 'flex', flexDirection: 'column', width: cellSize * cols, height: cellSize * rows }}>
                {grid}
            </View>
            <View style={{ height: cellSize / 2 }}></View>
        </View>
    );
};

export default GameGrid;