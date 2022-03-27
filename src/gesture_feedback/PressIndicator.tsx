import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { BehaviorSubject } from 'rxjs';
import { useSyncedAnimation } from '../main_providers/synced_animation';
import { GestureState } from '../types/uiTypes';


interface Props {
    gestureStateObservable: BehaviorSubject<GestureState>
}

const PressIndicator = ({ gestureStateObservable }: Props) => {
    const theme = useTheme();
    const { bounceAnim } = useSyncedAnimation();

    const [currentState, setCurrentState] = useState<GestureState>(gestureStateObservable.value);
    useEffect(() => {
        const sub = gestureStateObservable.subscribe(setCurrentState);
        return () => {
            sub.unsubscribe();
        }
    }, []);

    const scaleEnabledAnim = useRef(new Animated.Value(currentState.isEnabled ? 1 : 0)).current;
    useEffect(() => {
        Animated.timing(
            scaleEnabledAnim,
            {
                toValue: currentState.isEnabled ? 1 : 0,
                duration: 200,
                useNativeDriver: true
            }
        ).start();
    }, [scaleEnabledAnim, currentState.isEnabled]);

    const scaleHeldAnim = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        if (!currentState.isHeld) return;

        Animated.sequence([
            Animated.timing(
                scaleHeldAnim,
                {
                    toValue: 0,
                    duration: 200,
                    easing: Easing.linear,
                    delay: 0,
                    useNativeDriver: true
                }
            ),
            Animated.timing(
                scaleHeldAnim,
                {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.elastic(2),
                    delay: 1000,
                    useNativeDriver: true
                }
            )
        ]).start()

    }, [scaleHeldAnim, currentState.isHeld]);

    const rippleAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const shouldRipple = currentState.isLongPressTriggered || currentState.isPressTriggered;
        if (!shouldRipple) return;

        Animated.sequence([
            Animated.timing(
                rippleAnim,
                {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.elastic(2),
                    useNativeDriver: true
                }
            ),
            Animated.timing(
                rippleAnim,
                {
                    toValue: 0,
                    duration: 200,
                    easing: Easing.out(Easing.linear),
                    useNativeDriver: true
                }
            )
        ]).start();
    }, [rippleAnim, currentState.isLongPressTriggered, currentState.isPressTriggered]);

    return (
        <>
            <Animated.View pointerEvents={'none'} style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transform: [{ scale: Animated.multiply(scaleEnabledAnim, scaleHeldAnim) }]
            }}>
                <Animated.View style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.colors.text + '15',
                    borderRadius: 100,
                    transform: [{ scale: bounceAnim }]
                }}>

                </Animated.View>
            </Animated.View>

            <Animated.View pointerEvents={'none'} style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: theme.colors.text + '15',
                borderRadius: 100,
                transform: [{ scale: rippleAnim }]
            }}>
            </Animated.View>
        </>
    );
};

export default PressIndicator;
