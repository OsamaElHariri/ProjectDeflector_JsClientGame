import { useTheme } from '@react-navigation/native';
import React from 'react';
import {
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import GameService from './gameService';
import { useGameState } from './game_state_provider';
import PawnVisual from './PawnVisual';

interface Props {
    gridSize: number
}

const GridVisuals = ({ gridSize }: Props) => {
    const theme = useTheme();
    const { state, updateState } = useGameState();
    const { game: { gameBoard: { pawns } } } = state;

    const rows = 3;
    const rowsWithPadding = rows + 1;
    const cols = 3;

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

    const grid = Array(cols).fill(undefined).map((_, rowIdx) => {
        const columns = Array(rows).fill(undefined).map((_, colIdx) => {
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

        return <View key={`grid_${rowIdx}`} style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
            {columns}
        </View>
    });

    const ballDiameter = 40;
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
            <View style={{ height: cellSize / 2 }}></View>
            <View style={{ width: '100%', top: -ballDiameter / 2 + cellSize / 2, left: -ballDiameter / 2 + cellSize / 2 }}>
                <View style={{
                    width: ballDiameter,
                    height: ballDiameter,
                    borderRadius: 100,
                    position: 'absolute',
                    backgroundColor: 'black',
                    // Should animate these to move the ball across the grid
                    transform: [{ translateX: cellSize * 0 }, { translateY: cellSize * 0 }]
                }}></View>
            </View>
            <View style={{ position: 'relative', display: 'flex', flexDirection: 'column', width: cellSize * cols, height: cellSize * rows }}>
                {grid}
            </View>
            <View style={{ height: cellSize / 2 }}></View>
        </View>
    );
};

export default GridVisuals;