import Svg, { Text, TSpan } from "react-native-svg";
import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Image,
    StyleSheet,
    View,
} from 'react-native';


const Clock = ({ color }: { color: string }) => (
    <Image source={require('./assets/stop_watch.png')} style={{
        resizeMode: 'contain',
        tintColor: color,
        width: '40%',
        height: 60,
    }} />
)

const EndTurn = ({ fillColor, borderColor }: { fillColor: string, borderColor: string }) => (
    <View style={{ height: 60, width: '100%' }}>
        <Svg height='100%' width='100%' viewBox='0 0 60 60'>
            <Text
                y={'-10'}
                textAnchor='middle'
                stroke={borderColor}
                strokeWidth="2"
                fill={fillColor}
                fontSize="28"
                fontWeight='bold'
                letterSpacing={2}
            >
                <TSpan x='30' dy='1.1em'>END</TSpan>
                <TSpan x='30' dy='1.1em'>TURN</TSpan>
            </Text>
        </Svg>
    </View>
)

const Cancel = ({ textFillColor, textBorderColor }: { textFillColor: string, textBorderColor: string }) => (
    <View style={{ width: '100%', height: '100%', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '100%' }}>
            <Image source={require('./assets/cancel.png')} style={{
                position: 'absolute',
                resizeMode: 'center',
                tintColor: textBorderColor,
                width: '100%',
                height: 40,
                transform: [{ scale: 0.98 }]
            }} />
            <Image source={require('./assets/cancel_border.png')} style={{
                resizeMode: 'center',
                tintColor: textFillColor,
                width: '100%',
                height: 40,
            }} />
        </View>
        <View style={{ height: 40, width: '100%' }}>
            <Svg height='100%' width='100%' viewBox='0 0 50 50'>
                <Text
                    x={'26'}
                    y={'34'}
                    textAnchor='middle'
                    stroke={textBorderColor}
                    strokeWidth="2"
                    fill={textFillColor}
                    fontSize="28"
                    fontWeight='bold'
                    letterSpacing={2}
                >
                    CANCEL
                </Text>
            </Svg>
        </View>
    </View>
)

const WaitingDots = ({ color }: { color: string }) => {
    return <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <View style={{ ...styles.waitingDot, backgroundColor: color }}></View>
        <View style={{ ...styles.waitingDot, backgroundColor: color }}></View>
        <View style={{ ...styles.waitingDot, backgroundColor: color }}></View>
    </View>
}

export type TurnTimerIconOption = 'CLOCK' | 'END' | 'CANCEL' | 'WAITING'
const TurnTimerIcon = ({ icon, dotColor, playerColor }: { icon: TurnTimerIconOption, dotColor: string, playerColor: string }) => {
    const theme = useTheme();

    const clockAnim = useRef(new Animated.Value(0)).current;
    const endAnim = useRef(new Animated.Value(0)).current;
    const cancelAnim = useRef(new Animated.Value(0)).current;
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
            cancelAnim,
            icon === 'CANCEL' ? showValues : hideValues
        ).start()
        Animated.spring(
            waitingAnim,
            icon === 'WAITING' ? showValues : hideValues
        ).start()
    }, [icon, clockAnim, endAnim, cancelAnim, waitingAnim]);

    return <View style={{ width: '100%', height: '100%' }}>
        <Animated.View style={{ ...styles.iconPosition, transform: [{ scale: clockAnim }] }}>
            <Clock color={theme.colors.background} />
        </Animated.View>
        <Animated.View style={{ ...styles.iconPosition, transform: [{ scale: endAnim }] }}>
            <EndTurn fillColor={theme.colors.background} borderColor={playerColor} />
        </Animated.View>
        <Animated.View style={{ ...styles.iconPosition, transform: [{ scale: cancelAnim }] }}>
            <Cancel textBorderColor={theme.colors.text} textFillColor={theme.colors.background} />
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