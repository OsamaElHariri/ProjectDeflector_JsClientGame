import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    Button,
    Text,
    View,
} from 'react-native';
import { AppNavigation } from '../types/uiTypes';

const LobbyScreen = () => {
    const nav = useNavigation<AppNavigation>()
    return (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'stretch', position: 'relative', height: '100%' }}>
            <View style={{ flex: 1, backgroundColor: 'red' }}>
                <Text>Main Lobby</Text>
            </View>
            <Button
                onPress={() => {
                    console.log('You tapped the button!');
                    nav.replace('Game', { gameId: 'some game' })
                }}
                title="Press Me"
            />
        </View>
    );
};

export default LobbyScreen;
