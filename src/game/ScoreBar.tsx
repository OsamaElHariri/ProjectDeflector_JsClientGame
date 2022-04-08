import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    View,
} from 'react-native';
import { usePlayer } from '../main_providers/player_provider';
import { shouldUpdate } from './diffWatcher';
import { useGameState } from './game_state_provider';
import { GameState } from './types';


interface ScoreBoxProps {
    index: number
    width: number
    isMatchPoint: boolean
    children: ReactNode
}

const ScoreBox = ({ width, children, index, isMatchPoint }: ScoreBoxProps) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(
            rotateAnim,
            {
                toValue: isMatchPoint ? 1 : 0,
                duration: 600 - index,
                easing: Easing.in(Easing.elastic(3)),
                delay: index * 100,
                useNativeDriver: true
            }
        ).start();
    }, [rotateAnim, isMatchPoint]);

    return <Animated.View style={{
        overflow: 'hidden', width: width, height: width, transform: [{
            rotateZ: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '45deg']
            })
        }]
    }}>
        {children}
    </Animated.View>
}

interface ScoreDotProps {
    isPoint: boolean
    color: string
}

const ScoreDot = ({ isPoint, color }: ScoreDotProps) => {
    const expandAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(
            expandAnim,
            {
                toValue: isPoint ? 0.8 : 0,
                duration: 200,
                easing: Easing.quad,
                useNativeDriver: true
            }
        ).start();
    }, [expandAnim, isPoint]);

    return <Animated.View style={{ ...styles.expanded, backgroundColor: color, borderRadius: 100, transform: [{ scale: expandAnim }] }}></Animated.View>
}

interface Props {
    playerId: string
    maxScore: number
}

const ScoreBar = ({ playerId, maxScore }: Props) => {
    const { player } = usePlayer();
    const [currentLayout, setCurrentLayout] = useState<{ width: number, height: number }>();
    const { stateSubject } = useGameState();

    const initScaleAnims = useMemo(
        () => Array(maxScore)
            .fill(undefined)
            .map((_, idx) => new Animated.Value(1)), []);
    const scaleAnims = useRef(initScaleAnims).current;
    const turnStartAnim = useRef(new Animated.Value(1)).current;

    const getIsCurrentlyScoring = (gameState: GameState) => {
        if (stateSubject.value.deflectionProcessing.isActive) return false;
        if (stateSubject.value.game.playerTurn !== playerId) return false;
        const partial = stateSubject.value.postDeflectionPartialGameBoardPreview || stateSubject.value.nextTurnPartialGameBoard || stateSubject.value.game.postDeflectionPartialGameBoard;

        return partial.scoreBoard[playerId] > partial.previousScoreBoard[playerId];
    }

    const [state, setState] = useState({
        score: stateSubject.value.game.gameBoard.scoreBoard[playerId],
        isMatchPoint: stateSubject.value.game.matchPointPlayers[playerId],
        playerTurn: stateSubject.value.game.playerTurn,
        isCurrentlyScoring: getIsCurrentlyScoring(stateSubject.value),
    });

    useEffect(() => {
        const sub = stateSubject.subscribe((gameState) => {
            const { allPostDeflectionPartialGameBoards, deflectionProcessing, game: { matchPointPlayers, playerTurn, gameBoard: { scoreBoard } } } = gameState;
            let score = scoreBoard[playerId];
            const activeDeflectionScore = allPostDeflectionPartialGameBoards[deflectionProcessing.allDeflectionsIndex]?.scoreBoard[playerId];
            if (deflectionProcessing.isActive && activeDeflectionScore) {
                score = activeDeflectionScore;
            }

            const newState = {
                score,
                isMatchPoint: matchPointPlayers[playerId],
                playerTurn,
                isCurrentlyScoring: getIsCurrentlyScoring(gameState),
            }
            if (shouldUpdate(newState, state)) {
                setState(newState);
            }
        });

        return () => sub.unsubscribe();

    }, [state]);

    const getScaleSequence = (anim: Animated.Value) =>
        Animated.sequence([
            Animated.timing(
                anim,
                {
                    toValue: 0.85,
                    duration: 300,
                    easing: Easing.out(Easing.linear),
                    useNativeDriver: true,
                }
            ),
            Animated.timing(
                anim,
                {
                    toValue: 1.1,
                    duration: 350,
                    useNativeDriver: true,
                }
            ),
            Animated.timing(
                anim,
                {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.in(Easing.linear),
                    useNativeDriver: true,
                }
            )
        ]);

    useEffect(() => {
        if (playerId !== player?.id) return;
        if (state.playerTurn !== playerId) {
            turnStartAnim.setValue(1);
            return;
        }
        getScaleSequence(turnStartAnim).start();
    }, [state.playerTurn]);

    useEffect(() => {
        if (playerId !== player?.id) return;
        if (!state.isCurrentlyScoring) {
            scaleAnims.forEach(anim => {
                anim.stopAnimation();
                anim.setValue(1);
            });
            return;
        }

        const anims = scaleAnims.map(anim =>
            Animated.loop(getScaleSequence(anim))
        );
        Animated.stagger(150, anims).start();
    }, [state.isCurrentlyScoring]);

    const onLayout = (evt: any) => {
        setCurrentLayout(evt.nativeEvent.layout)
    }

    let nodes: JSX.Element[] = [];
    if (currentLayout) {
        let width = currentLayout.width * 0.7;
        const ratioMargin = 0.25;
        const preferredHeight = maxScore * width * (1 + ratioMargin) + width * ratioMargin;

        if (preferredHeight > currentLayout.height) {
            width = (currentLayout.height - width * ratioMargin) / (maxScore * (1 + ratioMargin));
        }

        let color = stateSubject.value.players[playerId].color;

        nodes = Array(maxScore).fill(undefined).map((_, idx) => {
            const scaleAnim = scaleAnims[idx];

            const isPoint = idx < state.score;
            return <Animated.View key={`score_${idx}`} style={{
                marginBottom: width * ratioMargin,
                marginTop: idx === maxScore - 1 ? width * ratioMargin : 0,
                transform: [{ scale: Animated.multiply(turnStartAnim, scaleAnim) }]
            }}>
                <ScoreBox index={idx} isMatchPoint={state.isMatchPoint} width={width}>
                    <View style={{ ...styles.expanded, position: 'absolute', top: -width * 0.5, left: -width * 0.5, transform: [{ translateX: width * 0.5 }, { translateY: width * 0.5 }] }}>
                        <ScoreDot isPoint={isPoint} color={color} />
                    </View>
                    <View style={{ ...styles.expanded, borderColor: color, borderWidth: width * 0.25 }}></View>
                </ScoreBox>
            </Animated.View>
        });
    }

    return (
        <View onLayout={onLayout} style={styles.scoreBar}>
            {nodes}
        </View>
    );
};

const styles = StyleSheet.create({
    scoreBar: {
        display: 'flex',
        flexDirection: 'column-reverse',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        height: '100%',
    },
    expanded: {
        width: '100%',
        height: '100%',
    },
});

export default ScoreBar;
