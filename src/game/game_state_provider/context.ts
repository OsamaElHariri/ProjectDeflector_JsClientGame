import { createContext, useContext } from 'react'
import { BehaviorSubject } from 'rxjs'
import { AddPawnResponse, EndTurnResponse, NetworkRequestStatus, PeekResponse, ShuffleResponse } from '../../network/types'
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

interface NetworkRequestStatusHolder {
    subject: BehaviorSubject<{ [key: string]: NetworkRequestStatus }>
    update: (networkKey: string, status: NetworkRequestStatus) => void
}

export const GameStateContext = createContext<{
    stateSubject: BehaviorSubject<GameState>,
    updateState: GameStateUpdate,
    networkRequestStatus: NetworkRequestStatusHolder
}>({} as any)

export function useGameState() {
    return useContext(GameStateContext)
}