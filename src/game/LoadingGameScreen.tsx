import { RouteProp, useNavigation, useTheme } from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
    Text,
} from 'react-native';
import PlainOverlay from '../lobby/PlainOverlay';
import UserService from '../lobby/userService';
import { usePlayer } from '../main_providers/player_provider';
import { Player } from '../types/types';
import { AppNavigation } from '../types/uiTypes';
import GameService from './gameService';

interface Props {
    route: RouteProp<{ params: { gameId: string, otherPlayer?: Player } }, 'params'>
}

const LoadingGameScreen = ({ route: { params: { gameId, otherPlayer } } }: Props) => {
    const theme = useTheme();
    const { player } = usePlayer();
    const nav = useNavigation<AppNavigation>();

    useEffect(() => {
        const getGame = async () => {
            const game = await GameService.getGame(gameId);
            const players: { [playerId: string]: Player } = {}

            if (player) {
                players[player.id] = player;
            }

            const otherPlayerId = game.playerIds.find(id => id !== player?.id);
            if (otherPlayerId) {
                const otherPlayerResult = otherPlayer || await UserService.getUser(otherPlayerId);
                players[otherPlayerResult.id] = otherPlayerResult;
            }

            nav.replace('Game', { game, players });
        }
        getGame();
    }, []);

    return (
        <PlainOverlay>
            <Text style={{ fontWeight: 'bold', color: theme.colors.text, fontSize: 32 }}>Loading Game...</Text>
        </PlainOverlay>
    );
};

export default LoadingGameScreen;
