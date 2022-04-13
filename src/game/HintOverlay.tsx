import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { BehaviorSubject } from 'rxjs';
import { usePlayer } from '../main_providers/player_provider';
import { useSyncedAnimation } from '../main_providers/synced_animation';
import { useGameState } from './game_state_provider';

interface Props {
    gridSize: number
    tutorialDisplay: BehaviorSubject<boolean>
}

const HintOverlay = ({ gridSize, tutorialDisplay }: Props) => {
    const theme = useTheme();
    const { player } = usePlayer();
    const [hintIndex, setHintIndex] = useState(0);
    const { bounceAnim } = useSyncedAnimation();
    const [display, setDisplay] = useState(tutorialDisplay.value);
    const { stateSubject: { value: gameState } } = useGameState();
    const leftSide = gameState.game.playerIds[0] === player?.id;

    useEffect(() => {
        const sub = tutorialDisplay.subscribe(newDisplay => {
            setDisplay(newDisplay);
        });
        return () => sub.unsubscribe();
    }, []);

    if (!display) {
        return <></>
    }

    const PlayerSideHint = () => <View style={styles.hintContainer}>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>To score a point,</Text>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>send the ball this way.</Text>
        <Image source={require('./assets/arrow.png')} style={{
            resizeMode: 'center',
            height: 32,
            tintColor: theme.colors.text,
            marginTop: 16,
            transform: [{ scaleX: leftSide ? 1 : -1 }]
        }} />
    </View>

    const ScoreChangesHint = () => <View style={styles.hintContainer}>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>+1 when your turn starts.</Text>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>+1 when you score the ball.</Text>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>-1 when you place a piece.</Text>
    </View>

    const MultiplePawnsHint = () => <View style={styles.hintContainer}>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>As long as you have score,</Text>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>you can place many pieces.</Text>
    </View>

    const FullBoardHint = () => <View style={styles.hintContainer}>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>When the board is full,</Text>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>the ball will keep going</Text>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>until {gameState.game.gameBoard.yMax + 1} spaces are available.</Text>
    </View>

    const MatchPointHint = () => <View style={styles.hintContainer}>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>Reach a score of {gameState.game.targetScore}</Text>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>to get to match point.</Text>
        <Text style={{ ...styles.hintText, color: theme.colors.text }}>Score one more ball to win!</Text>
    </View>

    const hints = [
        PlayerSideHint,
        ScoreChangesHint,
        MultiplePawnsHint,
        FullBoardHint,
        MatchPointHint,
    ];
    const Hint = hints[hintIndex];

    const dampenedBounceAnim = Animated.add(0.6, Animated.multiply(0.4, bounceAnim));

    return <View style={{
        position: 'absolute',
        width: gridSize,
        height: '100%',
        alignSelf: 'center',
        zIndex: 1,
        backgroundColor: theme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    }}>
        <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 14, marginVertical: 12 }}>{hintIndex + 1} of {hints.length}</Text>
        <Hint />
        <Pressable
            style={{ ...styles.button, backgroundColor: theme.colors.background, borderColor: theme.colors.text }}
            onPress={() => setHintIndex((hintIndex + 1) % hints.length)}>
            <Animated.Text style={{
                ...styles.buttonText,
                color: theme.colors.text,
                transform: [{ scale: dampenedBounceAnim }]
            }}>Next hint</Animated.Text>
        </Pressable>
        <Pressable
            style={{ ...styles.button, backgroundColor: theme.colors.background, borderColor: theme.colors.text }}
            onPress={() => tutorialDisplay.next(false)}>
            <Animated.Text style={{
                ...styles.buttonText,
                color: theme.colors.text,
                transform: [{ scale: dampenedBounceAnim }]
            }}>Back to game</Animated.Text>
        </Pressable>
    </View>
}

const styles = StyleSheet.create({
    hintContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    hintText: {
        fontSize: 18,
        textAlign: 'center',
        alignSelf: 'center',
        textAlignVertical: 'center',
        fontWeight: 'bold',
        paddingVertical: 8,
    },
    button: {
        borderWidth: 2,
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginBottom: 24,
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlignVertical: 'center',
        textAlign: 'center',
    }
});

export default HintOverlay;
