import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
    Text,
} from 'react-native';
import PlainOverlay from '../lobby/PlainOverlay';
import { useWsClient } from '../main_providers/ws_provider';
import { AppNavigation } from '../types/uiTypes';

const AwaitingGameScreen = () => {
    const theme = useTheme();
    const clientConnection = useWsClient();
    const nav = useNavigation<AppNavigation>();

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

    return (
        <PlainOverlay>
            <Text style={{ fontWeight: 'bold', color: theme.colors.text, fontSize: 32 }}>Finding Match</Text>
        </PlainOverlay>
    );
};

export default AwaitingGameScreen;
