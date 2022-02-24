import React from 'react';
import {
    useWindowDimensions,
    View,
} from 'react-native';
import { Game } from './types';
import { RouteProp } from '@react-navigation/native';
import ScoreBar from './ScoreBar';
import TurnTimer from './TurnTimer';
import GameGrid from './GameGrid';
import { GameStateProvider } from './game_state_provider';
import ShuffleButton from './ShuffleButton';
import PawnPreviewContainer from './PawnPreviewContainer';
import WinnerOverlay from './WinnerOverlay';

interface Props {
    route: RouteProp<{ params: { game: Game } }, 'params'>
}

const GameScreen = ({ route }: Props) => {
    const initialGame = route.params.game;

    const dimensions = useWindowDimensions();

    const hudWidth = 120;
    const scoreBarWidth = 50;
    const gridSize = Math.min(dimensions.width - hudWidth * 2 - scoreBarWidth * 2, dimensions.height);

    return (
        <GameStateProvider game={initialGame}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'stretch', position: 'relative', height: '100%' }}>
                <View style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                    <View style={{ width: '100%', flex: 1 }}>
                        <TurnTimer playerId={initialGame.playerIds[0]} />
                    </View>
                    <PawnPreviewContainer width={hudWidth} playerId={initialGame.playerIds[0]}></PawnPreviewContainer>
                    <ShuffleButton width={hudWidth} playerId={initialGame.playerIds[0]} />
                </View>

                <View style={{ position: 'relative' }}>
                    <View style={{ width: scoreBarWidth }}>
                        <ScoreBar playerId={initialGame.playerIds[0]} maxScore={7} />
                    </View>
                </View>

                <GameGrid gridSize={gridSize} />

                <View style={{ position: 'relative' }}>
                    <View style={{ width: scoreBarWidth }}>
                        <ScoreBar playerId={initialGame.playerIds[1]} maxScore={7} />
                    </View>
                </View>

                <View style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                    <View style={{ width: '100%', flex: 1 }}>
                        <TurnTimer playerId={initialGame.playerIds[1]} />
                    </View>
                    <PawnPreviewContainer width={hudWidth} playerId={initialGame.playerIds[1]}></PawnPreviewContainer>
                    <ShuffleButton width={hudWidth} playerId={initialGame.playerIds[1]} />
                </View>
            </View>
            <WinnerOverlay />
        </GameStateProvider>
    );
};

export default GameScreen;
