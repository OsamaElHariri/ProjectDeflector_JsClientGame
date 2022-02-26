import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { BehaviorSubject } from 'rxjs';
import { GestureState } from '../types/uiTypes';


interface Props {
    gestureStateObservable: BehaviorSubject<GestureState>
    bounceAnim: Animated.Value
}

const PressIndicator = ({ gestureStateObservable, bounceAnim }: Props) => {
    const theme = useTheme();

    const [currentState, setCurrentState] = useState<GestureState>(gestureStateObservable.value);
    useEffect(() => {
        const sub = gestureStateObservable.subscribe(setCurrentState);
        return () => {
            sub.unsubscribe();
        }
    }, []);

    if (!currentState.isEnabled) {
        return (<></>);
    }
    return (
        <Animated.View style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: theme.colors.text + '15',
            borderRadius: 100,
            transform: [{ scale: bounceAnim }]
        }}>
        </Animated.View>
    );
};

export default PressIndicator;
