import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import PlainOverlay from '../lobby/PlainOverlay';
import { useAudio } from '../main_providers/audio_provider';
import { usePlayer } from '../main_providers/player_provider';
import { useSyncedAnimation } from '../main_providers/synced_animation';
import { useWsClient } from '../main_providers/ws_provider';
import { NetworkRequestStatus } from '../network/types';
import { AppNavigation } from '../types/uiTypes';
import GameService from './gameService';
import Spinner from './Spinner';

const AwaitingGameScreen = () => {
    const theme = useTheme();
    const audio = useAudio();
    const { bounceAnim, restartAnim } = useSyncedAnimation();
    const clientConnection = useWsClient();
    const nav = useNavigation<AppNavigation>();
    const { player } = usePlayer();
    const [networkStatus, setNetworkStatus] = useState<NetworkRequestStatus>('NONE');
    const isMounted = useRef(true);
    const longWaitScaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        restartAnim();
        if (!clientConnection?.client) return;

        const sub = clientConnection.client.events().subscribe(async (evt) => {
            if (evt.event === 'match_found') {
                nav.replace('LoadingGame', { gameId: evt.payload.id });
            }
        });

        const touchQueueInterval = setInterval(() => {
            if (!isMounted.current) return;
            GameService.touchQueue().catch(() => undefined);
        }, 10000);

        setTimeout(() => {
            if (!isMounted.current) return;
            Animated.timing(longWaitScaleAnim,
                {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.elastic(2),
                    useNativeDriver: true,
                }
            ).start();
        }, 7000);

        return () => {
            isMounted.current = false;
            sub.unsubscribe();
            clearInterval(touchQueueInterval);
        };
    }, []);

    const cancelFindGame = () => {
        setNetworkStatus('LOADING');
        audio.play('cancel');
        GameService.cancelFindGame()
            .then(() => nav.replace('Lobby'))
            .catch(err => {
                setNetworkStatus('ERROR');
            });
    }

    const shareGame = () => {
        Share.share({
            message: "Let's play some Hit Bounce\nhttps://play.google.com/store/apps/details?id=com.hitbounce.game",
        }).catch(() => undefined);
    }

    const dampenedBounceAnim = Animated.add(0.5, Animated.multiply(0.5, bounceAnim));
    const InviteFriend = () => <View style={{ alignItems: 'center' }}>
        <Text style={{ color: theme.colors.text, textAlign: 'center', fontSize: 20, width: '75%' }}>
            Wow... It looks like everyone else is still asleep. That's alright, you can invite your own friends to play!
        </Text>
        <View style={{ paddingTop: 20 }} />
        <Pressable
            style={{ ...styles.button, backgroundColor: player?.color, borderColor: theme.colors.text, borderWidth: 2 }}
            onPress={shareGame}>
            <Animated.Text style={{
                ...styles.buttonText,
                fontWeight: 'bold',
                color: theme.colors.background,
                transform: [{ scale: dampenedBounceAnim }],
            }}>
                Invite Friend
            </Animated.Text>
        </Pressable>
    </View>

    const veryDampenedBounceAnim = Animated.add(0.7, Animated.multiply(0.3, bounceAnim));
    return (
        <PlainOverlay>
            <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: 28 }}>Finding Match</Text>
                <View style={{ paddingTop: 20 }} />

                {networkStatus === 'LOADING'
                    ? <View style={{ width: 24, height: 24 }}><Spinner /></View>
                    : <Pressable
                        style={{ ...styles.button, backgroundColor: theme.colors.background, borderColor: theme.colors.text, borderWidth: 2 }}
                        onPress={cancelFindGame}>
                        <Animated.Text style={{
                            ...styles.buttonText,
                            color: theme.colors.text,
                            transform: [{ scale: veryDampenedBounceAnim }],
                        }}>Cancel</Animated.Text>
                    </Pressable>}
            </View>

            <Animated.View style={{
                flex: 1,
                transform: [{ scale: longWaitScaleAnim }],
            }}>
                <InviteFriend />
            </Animated.View>

        </PlainOverlay >
    );
};

const styles = StyleSheet.create({
    button: {
        borderWidth: 4,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 16,
    }
});

export default AwaitingGameScreen;
