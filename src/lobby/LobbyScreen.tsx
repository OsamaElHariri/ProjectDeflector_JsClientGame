import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    Button,
    Text,
    View,
} from 'react-native';
import GameService from '../game/gameService';
import { usePlayer } from '../main_providers/player_provider';
import { AppNavigation } from '../types/uiTypes';

const LobbyScreen = () => {
    const player = usePlayer();
    const nav = useNavigation<AppNavigation>()
    return (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'stretch', position: 'relative', height: '100%' }}>
            <View style={{ flex: 1, backgroundColor: 'red' }}>
                <Text>Main Lobby</Text>
            </View>
            <Button
                onPress={() => {
                    if (!player) return;
                    GameService.findSolo()
                    nav.replace('AwaitingGame')
                }}
                title="Practice Game"
            />
        </View>
    );
};

export default LobbyScreen;
