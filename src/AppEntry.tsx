import React from 'react';
import { PlayerProvider } from './main_providers/player_provider';
import { WsClientProvider } from './main_providers/ws_provider';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LobbyScreen from './lobby/LobbyScreen';
import GameScreen from './game/GameScreen';


const Stack = createNativeStackNavigator();

const AppEntry = () => {
    return (
        <PlayerProvider>
            <WsClientProvider>

                <NavigationContainer>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>

                        <Stack.Screen
                            name="Lobby"
                            component={LobbyScreen} />

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
