import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Text,
    View,
} from 'react-native';
import { useWsClient } from '../main_providers/ws_provider';
import { AppNavigation } from '../types/uiTypes';
import GameService from './gameService';

const AwaitingGameScreen = () => {
    const clientConnection = useWsClient();
    const nav = useNavigation<AppNavigation>();
    const [text, setText] = useState('Finding Match');

    useEffect(() => {
        if (!clientConnection?.client) return;

        const sub = clientConnection.client.events().subscribe(async (evt) => {
            if (evt.event === 'match_found') {
                setText('Loading game');
                const game = await (new GameService).getGame(evt.payload.id);
                nav.replace('Game', { game });
            }
        });

        return () => {
            sub.unsubscribe();
        };
    }, []);

    return (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'stretch', position: 'relative', height: '100%' }}>
            <View style={{ flex: 1, backgroundColor: 'red' }}>
                <Text>{text}</Text>
            </View>
        </View>
    );
};

export default AwaitingGameScreen;
