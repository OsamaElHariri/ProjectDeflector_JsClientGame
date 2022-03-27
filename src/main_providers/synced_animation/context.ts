import { createContext, useContext } from 'react'
import { Animated } from 'react-native'

export const SyncedAnimationContext = createContext<{ bounceAnim: Animated.Value, restartAnim: Function }>({
    bounceAnim: new Animated.Value(0),
    restartAnim: () => { },
})

export function useSyncedAnimation() {
    return useContext(SyncedAnimationContext)
}