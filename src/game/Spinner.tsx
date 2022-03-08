import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';

import {
    Animated,
    Easing,
    Image,
} from 'react-native';

const Spinner = () => {
    const theme = useTheme();

    const rotateAnim = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.loop(
            Animated.timing(
                rotateAnim,
                {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true
                })
        ).start();
    }, [rotateAnim]);

    return <Animated.View style={{
        width: '100%',
        height: '100%',
        transform: [{ rotateZ: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }]
    }}>
        <Image source={require('./assets/loader.png')} style={{
            resizeMode: 'center',
            width: '100%',
            height: '100%',
            tintColor: theme.colors.text,
        }} />
    </Animated.View>
}

export default Spinner;
