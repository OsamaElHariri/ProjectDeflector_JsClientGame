import React, { ReactNode } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { Game } from './types';
import { RouteProp, useTheme } from '@react-navigation/native';
import ScoreBar from './ScoreBar';
import PawnVisual from './PawnVisual';
import TurnTimer from './TurnTimer';
import GridVisuals from './GridVisuals';

interface ShuffleButtonProps {
    width: number
}

const ShuffleButton = ({ width }: ShuffleButtonProps) => {
    const theme = useTheme();
    return <View style={{ display: 'flex', alignItems: 'center', paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ width: width, height: width * 0.4 }}>
            <Image source={require('./assets/shuffle.png')} style={{
                resizeMode: 'center',
                width: '100%',
                height: '100%',
                tintColor: theme.colors.text,
            }} />
        </View>
        <Text style={{ fontWeight: 'bold', color: theme.colors.text, paddingTop: 8 }}>Shuffle</Text>
    </View>
}

interface PawnPreviewContainerProps {
    width: number
    children: ReactNode
}

const PawnPreviewContainer = ({ width, children }: PawnPreviewContainerProps) => {
    const theme = useTheme();
    return <View style={{ marginTop: 8, padding: 8, height: width * 0.8, width: width * 0.8 }}>
        <View style={{ ...styles.pawnPreviewContainer, borderColor: theme.colors.text }}>
            {children}
        </View>
    </View>
}

interface Props {
    route: RouteProp<{ params: { game: Game } }, 'params'>
}

const GameScreen = ({ route }: Props) => {
    const dimensions = useWindowDimensions();

    const hudWidth = 120;
    const scoreBarWidth = 50;
    const gridSize = Math.min(dimensions.width - hudWidth * 2 - scoreBarWidth * 2, dimensions.height);

    return (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'stretch', position: 'relative', height: '100%' }}>
            <View style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                <View style={{ width: '100%', flex: 1 }}>
                    <TurnTimer />
                </View>
                <PawnPreviewContainer width={hudWidth}>
                    <PawnVisual durability={5} variant={'BACKSLASH'}></PawnVisual>
                </PawnPreviewContainer>
                <ShuffleButton width={hudWidth} />
            </View>

            <View style={{ position: 'relative' }}>
                <View style={{ width: scoreBarWidth }}>
                    <ScoreBar score={4} maxScore={7} isMatchPoint={true} />
                </View>
            </View>

            <GridVisuals gridSize={gridSize} />

            <View style={{ position: 'relative' }}>
                <View style={{ width: scoreBarWidth }}>
                    <ScoreBar score={4} maxScore={7} isMatchPoint={true} />
                </View>
            </View>

            <View style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                <View style={{ width: '100%', flex: 1 }}>
                    <TurnTimer />
                </View>
                <PawnPreviewContainer width={hudWidth}>
                    <PawnVisual durability={5} variant={'BACKSLASH'}></PawnVisual>
                </PawnPreviewContainer>
                <ShuffleButton width={hudWidth} />
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    pawnPreviewContainer: {
        borderWidth: 4,
    },
});

export default GameScreen;
