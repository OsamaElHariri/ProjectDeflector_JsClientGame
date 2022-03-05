import { createContext, useContext } from 'react'
import { BehaviorSubject } from 'rxjs'
import { AddPawnResponse, EndTurnResponse, PeekResponse, ShuffleResponse } from '../../network/types'
import { Pawn } from '../../types/types'
import { DeflectionProcessing, GameState } from '../types'

export interface GameStateUpdate {
    updatePawns: (pawns: Pawn[][]) => void
    updateDeflectionProcessing: (deflectionProcessing: DeflectionProcessing) => void
    onEndTurn: (res: EndTurnResponse) => void
    onAddPawn: (res: AddPawnResponse) => void
    onShuffle: (res: ShuffleResponse) => void
    onPeek: (res: PeekResponse) => void
    onCancelPeek: () => void
}

export const GameStateContext = createContext<{ stateSubject: BehaviorSubject<GameState>, updateState: GameStateUpdate }>({} as any)

export function useGameState() {
    return useContext(GameStateContext)
}