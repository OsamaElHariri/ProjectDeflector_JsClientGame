import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Image,
    StyleSheet,
    View,
    Text
} from 'react-native';


const Clock = ({ color }: { color: string }) => (
    <Image source={require('./assets/stop_watch.png')} style={{
        resizeMode: 'contain',
        tintColor: color,
        width: '40%',
        height: 60,
    }} />
)

const EndTurn = ({ color }: { color: string }) => (
    <View style={{ height: 60, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: color }}>Shoot</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: color }}>Ball</Text>
    </View>
)

const WaitingDots = ({ color }: { color: string }) => {
    return <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <View style={{ ...styles.waitingDot, backgroundColor: color }}></View>
        <View style={{ ...styles.waitingDot, backgroundColor: color }}></View>
        <View style={{ ...styles.waitingDot, backgroundColor: color }}></View>
    </View>
}

export type TurnTimerIconOption = 'CLOCK' | 'END' | 'WAITING'
const TurnTimerIcon = ({ icon, dotColor, mainColor }: { icon: TurnTimerIconOption, dotColor: string, mainColor: string }) => {
    const theme = useTheme();

    const clockAnim = useRef(new Animated.Value(0)).current;
    const endAnim = useRef(new Animated.Value(0)).current;
    const waitingAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const hideValues = {
            toValue: 0,
            speed: 25,
            bounciness: 5,
            useNativeDriver: true
        };
        const showValues = {
            toValue: 1,
            speed: 20,
            bounciness: 15,
            useNativeDriver: true
        };

        Animated.spring(
            clockAnim,
            icon === 'CLOCK' ? showValues : hideValues
        ).start()
        Animated.spring(
            endAnim,
            icon === 'END' ? showValues : hideValues
        ).start()
        Animated.spring(
            waitingAnim,
            icon === 'WAITING' ? showValues : hideValues
        ).start()
    }, [icon, clockAnim, endAnim, waitingAnim]);

    return <View style={{ width: '100%', height: '100%' }}>
        <Animated.View style={{ ...styles.iconPosition, transform: [{ scale: clockAnim }] }}>
            <Clock color={theme.colors.background} />
        </Animated.View>
        <Animated.View style={{ ...styles.iconPosition, transform: [{ scale: endAnim }] }}>
            <EndTurn color={mainColor} />
        </Animated.View>
        <Animated.View style={{ ...styles.iconPosition, transform: [{ scale: waitingAnim }] }}>
            <WaitingDots color={dotColor} />
        </Animated.View>
    </View>
}

const styles = StyleSheet.create({
    iconPosition: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    waitingDot: {
        width: 12,
        height: 12,
        marginHorizontal: 4,
        borderRadius: 100
    }
});

export default TurnTimerIcon;