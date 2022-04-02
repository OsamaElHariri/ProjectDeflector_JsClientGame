import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import GameService from '../game/gameService';
import Spinner from '../game/Spinner';
import { usePlayer } from '../main_providers/player_provider';
import { useSyncedAnimation } from '../main_providers/synced_animation';
import { NetworkRequestStatus } from '../network/types';
import { AppNavigation } from '../types/uiTypes';
import TutorialScreen from './TutorialScreen';
import UserService from './userService';

interface ColorBoxProps {
    color: string
}

const ColorBox = ({ color }: ColorBoxProps) => {
    const theme = useTheme();
    const { player, updatePlayer } = usePlayer();
    const [networkState, setNetworkState] = useState<NetworkRequestStatus>('NONE');
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const { bounceAnim } = useSyncedAnimation();

    useEffect(() => {
        Animated.timing(
            scaleAnim,
            {
                toValue: player?.color === color ? 1 : 0.75,
                duration: 300,
                useNativeDriver: true,
            }
        ).start();
    }, [player?.color]);

    const onPress = async () => {
        if (!updatePlayer || !player || player?.color === color) return;

        if (networkState === 'LOADING') return;
        setNetworkState('LOADING');

        const updateResult = await UserService.updateUser({
            ...player,
            color,
        }).catch(err => {
            setNetworkState('ERROR');
        });
        if (!updateResult) return;
        setNetworkState('NONE');
        updatePlayer(updateResult);
    }

    const anim = Animated.add(
        Animated.multiply(bounceAnim, scaleAnim.interpolate({ inputRange: [0.75, 1], outputRange: [0.7, 0] })),
        Animated.multiply(scaleAnim, scaleAnim.interpolate({ inputRange: [0.75, 1], outputRange: [0, 1] }))
    );

    return <View style={{ width: 72, height: 72, borderColor: theme.colors.text, borderWidth: 4 }}>
        <Pressable onPress={onPress} style={{ width: '100%', height: '100%' }}>
            <Animated.View style={{ width: '100%', height: '100%', backgroundColor: color, transform: [{ scale: anim }] }} />
        </Pressable>
        <View style={{ position: 'absolute', width: 12, height: 12, right: 5, top: 5 }}>
            {networkState === 'LOADING' ? <Spinner /> : null}
        </View>
    </View>
}

interface ColorChoiceProps {
    colors: string[]
}

const ColorChoice = ({ colors }: ColorChoiceProps) => {
    return <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'stretch' }}>
        <View style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <ColorBox color={colors[0]} />
            <ColorBox color={colors[1]} />
        </View>
        <View style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <ColorBox color={colors[2]} />
            <ColorBox color={colors[3]} />
        </View>
    </View>
}

const LobbyScreen = () => {
    const theme = useTheme();
    const { player } = usePlayer();
    const nav = useNavigation<AppNavigation>()
    const { bounceAnim, restartAnim } = useSyncedAnimation();
    const isMounted = useRef(true);
    const [checkingOngoingGame, setCheckingOngoingGame] = useState(true);

    const maxTutorialScreen = 2;
    const [tutorialScreen, setTutorialScreen] = useState(0);
    const setTutorialScreenClamped = (value: number) => {
        setTutorialScreen(Math.min(maxTutorialScreen, Math.max(0, value)));
    }

    const [colors, setColors] = useState<string[]>([]);

    useEffect(() => {
        const getColors = async () => {
            const colorResult = await UserService.getColorChoice()
                .catch(err => undefined);
            if (!colorResult || !isMounted.current) return;
            setColors(colorResult.colors)
        }
        getColors();
    }, []);

    useEffect(() => {
        const checkingOngoingGame = async () => {
            const ongoingGameId = await GameService.getOngoingGame()
                .catch(err => undefined);
            if (!isMounted.current) return;
            if (ongoingGameId) {
                nav.navigate('LoadingGame', { gameId: ongoingGameId });
            } else {
                setCheckingOngoingGame(false);
            }
        }
        checkingOngoingGame();
    }, []);

    useEffect(() => {
        restartAnim();
        () => { isMounted.current = false }
    });

    const onPlayPress = () => {
        if (!player || checkingOngoingGame) return;
        GameService.findGame()
        nav.replace('AwaitingGame')
    }

    const onSoloPress = () => {
        if (!player) return;
        GameService.findSolo()
        nav.replace('AwaitingGame')
    }

    const dampenedBounceAnim = Animated.add(0.5, Animated.multiply(0.5, bounceAnim));

    const MainLobbyScreen = () => <>
        <Text style={{ fontWeight: 'bold', fontSize: 28, color: theme.colors.text }}>
            Hello {player?.nickname}, what color would you like to go for today?
        </Text>
        <View style={{ paddingTop: 12 }}></View>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.colors.text }}>
                You are currently rocking this color
            </Text>
            <View style={{ paddingLeft: 8 }}></View>
            <View style={{ width: 20, height: 20, borderWidth: 2, borderColor: theme.colors.text, backgroundColor: player?.color }} />
        </View>
        {
            colors.length > 0 && player
                ? <ColorChoice colors={colors} />
                : <View style={{ flex: 1, width: 40, height: 40, justifyContent: 'center', alignSelf: 'center' }}>
                    <Spinner />
                </View>
        }
    </>

    const SidePanel = () => {
        if (player?.gameStats.games === 0) {
            return <View style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' }}>
                <Pressable
                    style={{ ...styles.button, backgroundColor: theme.colors.background, borderColor: theme.colors.text, borderWidth: 2, opacity: tutorialScreen === maxTutorialScreen ? 0 : 1 }}
                    onPress={() => setTutorialScreenClamped(tutorialScreen + 1)}>
                    <Animated.Text style={{
                        ...styles.buttonText,
                        fontSize: 14,
                        color: theme.colors.text,
                        transform: [{ scale: dampenedBounceAnim }]
                    }}>Next tip</Animated.Text>
                </Pressable>
                <View style={{ paddingTop: 24 }}></View>
                <Pressable
                    style={{ ...styles.button, backgroundColor: theme.colors.background, borderColor: theme.colors.text, borderWidth: 2, opacity: tutorialScreen === 0 ? 0 : 1 }}
                    onPress={() => setTutorialScreenClamped(tutorialScreen - 1)}>
                    <Animated.Text style={{
                        ...styles.buttonText,
                        fontSize: 14,
                        color: theme.colors.text,
                        transform: [{ scale: dampenedBounceAnim }]
                    }}>Previous tip</Animated.Text>
                </Pressable>
            </View>
        } else {
            return <></>
        }
    }

    return (
        <View style={{ backgroundColor: theme.colors.background, ...styles.lobbyContainer }}>
            <View style={{ flex: 1, display: 'flex' }}>
                {player?.gameStats.games === 0
                    ? <TutorialScreen tutorialScreen={tutorialScreen} />
                    : <MainLobbyScreen />}
            </View>
            <View style={styles.buttonPanel}>
                <View style={{ flex: 1, width: '100%' }}>
                    <SidePanel />
                </View>
                <Pressable
                    style={{ ...styles.button, backgroundColor: player?.color, borderColor: theme.colors.text }}
                    onPress={onPlayPress}>
                    {checkingOngoingGame
                        ? <View style={{ marginVertical: 8, width: 32, height: 32, alignSelf: 'center' }}><Spinner /></View>
                        : <Animated.Text style={{
                            ...styles.buttonText,
                            fontSize: 32,
                            color: theme.colors.background,
                            transform: [{ scale: dampenedBounceAnim }]
                        }}>Play</Animated.Text>
                    }
                </Pressable>
                <View style={{ paddingTop: 24 }}></View>
                <Pressable
                    style={{ ...styles.button, backgroundColor: theme.colors.background, borderColor: theme.colors.text, borderWidth: 2 }}
                    onPress={onSoloPress}>
                    <Animated.Text style={{
                        ...styles.buttonText,
                        fontSize: 14,
                        color: theme.colors.text,
                        transform: [{ scale: dampenedBounceAnim }]
                    }}>Practice</Animated.Text>
                </Pressable>
                <View style={{ paddingTop: 24 }}></View>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    lobbyContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
        position: 'relative',
        height: '100%',
        padding: 24,
    },
    buttonPanel: {
        minWidth: 160,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    button: {
        width: '100%',
        borderWidth: 4,
        padding: 8,
    },
    buttonText: {
        fontWeight: 'bold',
        textAlignVertical: 'center',
        textAlign: 'center',
    }
});

export default LobbyScreen;
