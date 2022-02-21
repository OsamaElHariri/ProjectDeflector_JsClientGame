import { createContext, useContext } from 'react'
import { GameState } from '../types'

export const GameStateContext = createContext<{ state: GameState, updateState: (state: GameState) => void }>({} as any)

export function useGameState() {
    return useContext(GameStateContext)
}