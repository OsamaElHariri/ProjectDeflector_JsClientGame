import { createContext, useContext } from 'react'
import { AddPawnResponse, EndTurnResponse, PeekResponse, ShuffleResponse } from '../../network/types'
import { GameState } from '../types'

export interface GameStateUpdate {
    onEndTurn: (res: EndTurnResponse) => void
    onAddPawn: (res: AddPawnResponse) => void
    onShuffle: (res: ShuffleResponse) => void
    onPeek: (res: PeekResponse) => void
    onCancelPeek: () => void
}

export const GameStateContext = createContext<{ state: GameState, updateState: GameStateUpdate }>({} as any)

export function useGameState() {
    return useContext(GameStateContext)
}