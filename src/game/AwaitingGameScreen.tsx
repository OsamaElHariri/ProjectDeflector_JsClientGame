import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import PlainOverlay from '../lobby/PlainOverlay';
import { useWsClient } from '../main_providers/ws_provider';
import { NetworkRequestStatus } from '../network/types';
import { AppNavigation } from '../types/uiTypes';
import GameService from './gameService';
import Spinner from './Spinner';

const AwaitingGameScreen = () => {
    const theme = useTheme();
    const clientConnection = useWsClient();
    const nav = useNavigation<AppNavigation>();
    const [networkStatus, setNetworkStatus] = useState<NetworkRequestStatus>('NONE');

    useEffect(() => {
        if (!clientConnection?.client) return;

        const sub = clientConnection.client.events().subscribe(async (evt) => {
            if (evt.event === 'match_found') {
                nav.replace('LoadingGame', { gameId: evt.payload.id });
            }
        });

        return () => {
            sub.unsubscribe();
        };
    }, []);

    const cancelFindGame = () => {
        setNetworkStatus('LOADING');
        GameService.cancelFindGame()
            .then(() => nav.replace('Lobby'))
            .catch(err => {
                setNetworkStatus('ERROR');
            });
    }

    return (
        <PlainOverlay>
            <Text style={{ fontWeight: 'bold', color: theme.colors.text, fontSize: 32 }}>Finding Match</Text>
            <View style={{ paddingTop: 40 }} />

            {networkStatus === 'LOADING'
                ? <View style={{ width: 24, height: 24 }}><Spinner /></View>
                : <Pressable
                    style={{ ...styles.button, backgroundColor: theme.colors.background, borderColor: theme.colors.text, borderWidth: 2 }}
                    onPress={cancelFindGame}>
                    <Text style={{
                        ...styles.buttonText,
                        color: theme.colors.text
                    }}>Cancel</Text>
                </Pressable>}
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
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default AwaitingGameScreen;
