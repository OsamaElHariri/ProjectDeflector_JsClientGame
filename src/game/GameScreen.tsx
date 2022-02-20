import React from 'react';
import {
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { Game } from './types';
import { RouteProp } from '@react-navigation/native';
import ScoreBar from './ScoreBar';

interface Props {
    route: RouteProp<{ params: { game: Game } }, 'params'>
}

const GameScreen = ({ route }: Props) => {
    const dimensions = useWindowDimensions();

    const gridSize = Math.min(0.6 * dimensions.width, dimensions.height);

    const rows = 3;
    const cols = 3;

    const gridWidth = 100 / rows;
    const gridHeight = 100 / cols;
    const table = (Array(9).fill('').map((elem: undefined, idx) =>
        <View key={`cell_${idx}`} style={{ backgroundColor: 'black', width: `${gridWidth}%`, height: `${gridHeight}%` }}>
            <Text style={{ color: 'red' }}>1</Text>
        </View>
    ));

    return (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'stretch', position: 'relative', height: '100%' }}>
            <View style={{ flex: 1 }}>
                <View style={{ backgroundColor: 'white', display: 'flex', height: '100%' }}>
                    <View style={{ width: '100%', height: '100%', flex: 1, backgroundColor: 'blue' }}></View>
                    <View style={{ backgroundColor: 'skyblue', height: 200 }}></View>
                    <View style={{ backgroundColor: 'cyan', height: 150 }}></View>
                </View>
            </View>
            <View style={{ position: 'relative' }}>
                <View style={{ width: 50 }}>
                    <ScoreBar score={4} maxScore={7} isMatchPoint={false} />
                </View>
            </View>
            <View style={{ backgroundColor: 'green', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ position: 'relative', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: gridSize, height: gridSize, backgroundColor: 'yellow' }}>
                    {table}
                </View>
            </View>
            <View style={{ flex: 1, backgroundColor: 'red' }}>
                <Text>123</Text>
            </View>
        </View>
    );
};

export default GameScreen;
