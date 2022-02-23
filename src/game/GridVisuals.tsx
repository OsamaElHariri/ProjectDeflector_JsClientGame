import { useTheme } from '@react-navigation/native';
import React from 'react';
import {
    View,
} from 'react-native';

interface Props {
    gridSize: number
}

const GridVisuals = ({ gridSize }: Props) => {
    const theme = useTheme();

    const rows = 3;
    const rowsWithPadding = rows + 1;
    const cols = 3;

    const cellSize = Math.min(gridSize / rowsWithPadding, gridSize / cols);

    const gridBorder = 2;
    const grid = Array(rows).fill(undefined).map((_, rowIdx) => {

        const columns = Array(cols).fill(undefined).map((_, colIdx) => {
            return <View key={`cell_${colIdx}`} style={{
                borderColor: theme.colors.text,
                borderTopWidth: rowIdx === 0 ? gridBorder * 2 : gridBorder,
                borderLeftWidth: colIdx === 0 ? gridBorder * 2 : gridBorder,
                borderBottomWidth: rowIdx === rows - 1 ? gridBorder * 2 : gridBorder,
                borderRightWidth: colIdx === cols - 1 ? gridBorder * 2 : gridBorder,
                flex: 1
            }}></View>
        });

        return <View key={`grid_row_${rowIdx}`} style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
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