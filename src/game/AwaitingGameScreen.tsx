import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Text,
    View,
} from 'react-native';
import UserService from '../lobby/userService';
import { usePlayer } from '../main_providers/player_provider';
import { useWsClient } from '../main_providers/ws_provider';
import { AppNavigation } from '../types/uiTypes';
import GameService from './gameService';

const AwaitingGameScreen = () => {
    const player = usePlayer();
    const clientConnection = useWsClient();
    const nav = useNavigation<AppNavigation>();
    const [text, setText] = useState('Finding Match');

    useEffect(() => {
        if (!clientConnection?.client) return;

        const sub = clientConnection.client.events().subscribe(async (evt) => {
            if (evt.event === 'match_found') {
                setText('Loading game');
                const game = await GameService.getGame(evt.payload.id);

                if (player) {
                    game.colors[player.id] = player.color;
                }

                const otherPlayerId = game.playerIds.find(id => id !== player?.id);
                if (otherPlayerId) {
                    const otherPlayer = await UserService.getUser(otherPlayerId);
                    game.colors[otherPlayer.id] = otherPlayer.color;
                }

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
