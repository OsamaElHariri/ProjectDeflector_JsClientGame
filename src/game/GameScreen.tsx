import React, { useEffect, useRef } from 'react';
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
import PlayerHud from './PlayerHud';
import { Player } from '../types/types';
import { useSyncedAnimation } from '../main_providers/synced_animation';
import PlayerNameTag from './PlayerNameTag';
import { BehaviorSubject } from 'rxjs';
import HintOverlay from './HintOverlay';

interface Props {
    route: RouteProp<{ params: { game: Game, players: { [playerId: string]: Player } } }, 'params'>
}

const GameScreen = ({ route }: Props) => {
    const initialGame = route.params.game;
    const { restartAnim } = useSyncedAnimation();
    const tutorialDisplay = useRef<BehaviorSubject<boolean>>(new BehaviorSubject<boolean>(false)).current;
    useEffect(() => restartAnim(), []);

    const dimensions = useWindowDimensions();

    const hudWidth = 115;
    const scoreBarWidth = 50;
    const gridSize = Math.min(dimensions.width - hudWidth * 2 - scoreBarWidth * 2, dimensions.height);

    const targetScore = initialGame.targetScore;

    return (
        <GameStateProvider game={initialGame} players={route.params.players}>
            <HintOverlay tutorialDisplay={tutorialDisplay} gridSize={gridSize} />
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'stretch', position: 'relative', height: '100%' }}>
                <PlayerHud playerId={initialGame.playerIds[0]} hudWidth={hudWidth} >
                    <PlayerNameTag playerId={initialGame.playerIds[0]} tutorialDisplay={tutorialDisplay} />
                    <View style={{ width: '100%', flex: 1 }}>
                        <TurnTimer playerId={initialGame.playerIds[0]} />
                    </View>
                    <PawnPreviewContainer width={hudWidth} playerId={initialGame.playerIds[0]}></PawnPreviewContainer>
                    <ShuffleButton width={hudWidth} playerId={initialGame.playerIds[0]} />
                </PlayerHud>

                <View style={{ zIndex: 2, position: 'relative' }}>
                    <View style={{ width: scoreBarWidth }}>
                        <ScoreBar playerId={initialGame.playerIds[0]} maxScore={targetScore} />
                    </View>
                </View>

                <GameGrid gridSize={gridSize} />

                <View style={{ zIndex: 2, position: 'relative', transform: [{ scaleX: -1 }] }}>
                    <View style={{ width: scoreBarWidth }}>
                        <ScoreBar playerId={initialGame.playerIds[1]} maxScore={targetScore} />
                    </View>
                </View>

                <PlayerHud playerId={initialGame.playerIds[1]} hudWidth={hudWidth}>
                    <PlayerNameTag playerId={initialGame.playerIds[1]} tutorialDisplay={tutorialDisplay} />
                    <View style={{ width: '100%', flex: 1 }}>
                        <TurnTimer playerId={initialGame.playerIds[1]} />
                    </View>
                    <PawnPreviewContainer width={hudWidth} playerId={initialGame.playerIds[1]}></PawnPreviewContainer>
                    <ShuffleButton width={hudWidth} playerId={initialGame.playerIds[1]} />
                </PlayerHud>
            </View>
        </GameStateProvider>
    );
};

export default GameScreen;
