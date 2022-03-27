import React, { ReactNode, useEffect, useRef, useState } from "react"
import { Animated } from "react-native";
import { SyncedAnimationContext } from "./context";

interface Props {
    children: ReactNode
}

export function SyncedAnimationProvider({ children }: Props) {
    const bounceAnim = useRef(new Animated.Value(0.9)).current;

    const getAnimation = () => Animated.loop(
        Animated.sequence([
            Animated.spring(
                bounceAnim,
                {
                    toValue: 1.1,
                    speed: 2,
                    bounciness: 20,
                    useNativeDriver: true
                }
            ),
            Animated.spring(
                bounceAnim,
                {
                    toValue: 0.9,
                    speed: 10,
                    bounciness: 5,
                    useNativeDriver: true
                }
            ),
        ])
    );

    useEffect(() => {
        getAnimation().start();
    }, [bounceAnim]);

    const contextValue = {
        bounceAnim,
        restartAnim: () => getAnimation().start(),
    }

    return <SyncedAnimationContext.Provider value={contextValue} children={children} />
}