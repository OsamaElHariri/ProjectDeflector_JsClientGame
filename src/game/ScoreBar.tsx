import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    View,
} from 'react-native';
import { shouldUpdate } from './diffWatcher';
import { useGameState } from './game_state_provider';


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
}

const ScoreDot = ({ isPoint }: ScoreDotProps) => {
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

    return <Animated.View style={{ ...styles.expanded, backgroundColor: '#73956F', borderRadius: 100, transform: [{ scale: expandAnim }] }}></Animated.View>
}

interface Props {
    playerId: string
    maxScore: number
}

const ScoreBar = ({ playerId, maxScore }: Props) => {
    const [currentLayout, setCurrentLayout] = useState<{ width: number, height: number }>();
    const { stateSubject } = useGameState();

    const [state, setState] = useState({
        score: stateSubject.value.game.gameBoard.scoreBoard[playerId],
        isMatchPoint: stateSubject.value.game.matchPointPlayers[playerId]
    });

    useEffect(() => {
        const sub = stateSubject.subscribe(({ game: { matchPointPlayers, gameBoard: { scoreBoard } } }) => {
            const newState = {
                score: scoreBoard[playerId],
                isMatchPoint: matchPointPlayers[playerId]
            }
            if (shouldUpdate(newState, state)) {
                setState(newState);
            }
        });

        return () => sub.unsubscribe();

    }, [state]);

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

        nodes = Array(maxScore).fill(undefined).map((_, idx) => {
            const isPoint = idx < state.score;
            return <View key={`score_${idx}`} style={{ marginBottom: width * ratioMargin, marginTop: idx === maxScore - 1 ? width * ratioMargin : 0 }}>
                <ScoreBox index={idx} isMatchPoint={state.isMatchPoint} width={width}>
                    <View style={{ ...styles.expanded, position: 'absolute', top: -width * 0.5, left: -width * 0.5, transform: [{ translateX: width * 0.5 }, { translateY: width * 0.5 }] }}>
                        <ScoreDot isPoint={isPoint} />
                    </View>
                    <View style={{ ...styles.expanded, borderColor: '#73956F', borderWidth: width * 0.25 }}></View>
                </ScoreBox>
            </View>
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
