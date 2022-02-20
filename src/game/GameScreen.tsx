import React, { ReactNode } from 'react';
import {
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { Game } from './types';
import { RouteProp } from '@react-navigation/native';
import ScoreBar from './ScoreBar';
import PawnVisual from './PawnVisual';

interface PawnPreviewContainerProps {
    width: number
    children: ReactNode
}

const PawnPreviewContainer = ({ width, children }: PawnPreviewContainerProps) => {
    return <View style={{ padding: 8, height: width, width: width }}>
        <View style={{ ...styles.pawnPreviewContainer }}>
            {children}
        </View>
    </View>
}

interface Props {
    route: RouteProp<{ params: { game: Game } }, 'params'>
}

const GameScreen = ({ route }: Props) => {
    const dimensions = useWindowDimensions();

    const hudWidth = 100;
    const scoreBarWidth = 50;
    const gridSize = Math.min(dimensions.width - hudWidth * 2 - scoreBarWidth * 2, dimensions.height);

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
            <View style={{ width: hudWidth }}>
                <View style={{ display: 'flex', height: '100%' }}>
                    <View style={{ width: '100%', height: '100%', flex: 1, backgroundColor: 'blue' }}></View>
                    <PawnPreviewContainer width={hudWidth}>
                        <PawnVisual durability={5} variant={'BACKSLASH'}></PawnVisual>
                    </PawnPreviewContainer>
                    <View style={{ backgroundColor: 'cyan', height: 150 }}></View>
                </View>
            </View>
            <View style={{ position: 'relative' }}>
                <View style={{ width: scoreBarWidth }}>
                    <ScoreBar score={4} maxScore={7} isMatchPoint={true} />
                </View>
            </View>
            <View style={{ backgroundColor: 'green', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ position: 'relative', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: gridSize, height: gridSize, backgroundColor: 'yellow' }}>
                    {table}
                </View>
            </View>
            <View style={{ position: 'relative' }}>
                <View style={{ width: scoreBarWidth }}>
                    <ScoreBar score={4} maxScore={7} isMatchPoint={true} />
                </View>
            </View>
            <View style={{ width: hudWidth }}>
                <View style={{ display: 'flex', height: '100%' }}>
                    <View style={{ width: '100%', height: '100%', flex: 1, backgroundColor: 'blue' }}></View>
                    <PawnPreviewContainer width={hudWidth}>
                        <PawnVisual durability={5} variant={'SLASH'}></PawnVisual>
                    </PawnPreviewContainer>
                    <View style={{ backgroundColor: 'cyan', height: 150 }}></View>
                </View>
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    pawnPreviewContainer: {
        borderWidth: 6,
    },
});

export default GameScreen;
