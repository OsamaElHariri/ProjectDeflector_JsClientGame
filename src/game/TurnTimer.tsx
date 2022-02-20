import { useTheme } from '@react-navigation/native';
import React from 'react';
import {
    Image,
    StyleSheet,
    View,
} from 'react-native';

interface Props {
}

const TurnTimer = ({ }: Props) => {
    const theme = useTheme();
    return (
        <View style={{ ...styles.turnTimerContainer, borderColor: theme.colors.text }}>
            <View style={{ width: '40%' }}>
                <Image source={require('./assets/stop_watch.png')} style={{
                    resizeMode: 'contain',
                    width: '100%',
                    height: '100%',
                }} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    turnTimerContainer: {
        marginTop: 16,
        borderWidth: 4,
        alignItems: 'center',
        backgroundColor: '#73956F',
    },
});

export default TurnTimer;