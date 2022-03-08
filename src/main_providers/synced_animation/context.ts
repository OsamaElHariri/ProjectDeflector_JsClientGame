import { createContext, useContext } from 'react'
import { Animated } from 'react-native'

export const SyncedAnimationContext = createContext<Animated.Value>(new Animated.Value(0))

export function useSyncedAnimation() {
    return useContext(SyncedAnimationContext)
}