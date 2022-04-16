import React from 'react';
import { PlayerProvider } from './main_providers/player_provider';
import { WsClientProvider } from './main_providers/ws_provider';

import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LobbyScreen from './lobby/LobbyScreen';
import GameScreen from './game/GameScreen';
import AwaitingGameScreen from './game/AwaitingGameScreen';
import { SyncedAnimationProvider } from './main_providers/synced_animation';
import LoadingGameScreen from './game/LoadingGameScreen';
import WinnerOverlay from './game/WinnerOverlay';
import { AudioProvider } from './main_providers/audio_provider';

export const GameTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: '#E5D4CE',
        text: '#212121',
    },
};

const Stack = createNativeStackNavigator();

const AppEntry = () => {
    return (
        <SyncedAnimationProvider>
            <PlayerProvider>
                <WsClientProvider>
                    <AudioProvider>

                        <NavigationContainer theme={GameTheme}>
                            <Stack.Navigator screenOptions={{ headerShown: false }}>

                                <Stack.Screen
                                    name="Lobby"
                                    component={LobbyScreen} />

                                <Stack.Screen
                                    name="AwaitingGame"
                                    component={AwaitingGameScreen} />

                                <Stack.Screen
                                    name="LoadingGame"
                                    component={LoadingGameScreen} />

                                <Stack.Screen
                                    name="Game"
                                    component={GameScreen} />

                                <Stack.Screen
                                    name="Winner"
                                    component={WinnerOverlay} />

                            </Stack.Navigator>

                        </NavigationContainer>
                    </AudioProvider>
                </WsClientProvider>
            </PlayerProvider>
        </SyncedAnimationProvider>
    );
};

export default AppEntry;
