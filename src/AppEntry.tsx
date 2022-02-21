import React from 'react';
import { PlayerProvider } from './main_providers/player_provider';
import { WsClientProvider } from './main_providers/ws_provider';

import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LobbyScreen from './lobby/LobbyScreen';
import GameScreen from './game/GameScreen';
import AwaitingGameScreen from './game/AwaitingGameScreen';

const GameTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: '#E5D4CE',
        text: '#000000',
    },
};

const Stack = createNativeStackNavigator();

const AppEntry = () => {
    return (
        <PlayerProvider>
            <WsClientProvider>

                <NavigationContainer theme={GameTheme}>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>

                        <Stack.Screen
                            name="Lobby"
                            component={LobbyScreen} />

                        <Stack.Screen
                            name="AwaitingGame"
                            component={AwaitingGameScreen} />

                        <Stack.Screen
                            name="Game"
                            component={GameScreen} />

                    </Stack.Navigator>

                </NavigationContainer>

            </WsClientProvider>
        </PlayerProvider>
    );
};

export default AppEntry;
