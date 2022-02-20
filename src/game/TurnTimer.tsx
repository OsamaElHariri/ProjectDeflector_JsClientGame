import React from 'react';
import {
    Image,
    StyleSheet,
    View,
} from 'react-native';

interface Props {
}

const TurnTimer = ({ }: Props) => {

    return (
        <View style={styles.turnTimerContainer}>
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
        borderColor: 'black',
        alignItems: 'center',
        backgroundColor: 'green',
    },
});

export default TurnTimer;