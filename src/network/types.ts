import { AvailableShuffles, Deflection, MatchPointPlayers, PlayerVariants, PostDeflectionPartialGameBoard } from "../game/types"
import { Pawn, ScoreBoard } from "../types/types"

export type NetworkRequestStatus = 'NONE' | 'LOADING' | 'ERROR'

interface WsMatchFound {
    event: 'match_found'
    payload: {
        id: string
    }
}

export interface AddPawnResponse {
    scoreBoard: ScoreBoard,
    variants: PlayerVariants,
    newPawn: Pawn
    deflections: Deflection[]
    postDeflectionPartialGameBoard: PostDeflectionPartialGameBoard
    eventCount: number
    previousEventCount: number
}

interface WsAddPawn {
    event: 'pawn'
    payload: AddPawnResponse
}

export interface EndTurnResponse {
    scoreBoard: ScoreBoard
    variants: PlayerVariants
    playerTurn: string
    allDeflections: Deflection[][]
    allPostDeflectionPartialGameBoards: PostDeflectionPartialGameBoard[]
    winner: string
    matchPointPlayers: MatchPointPlayers
    availableShuffles: AvailableShuffles
    deflections: Deflection[]
    postDeflectionPartialGameBoard: PostDeflectionPartialGameBoard
    lastTurnEndTime: number
    eventCount: number
    previousEventCount: number
}

interface WsEndTurn {
    event: 'turn'
    payload: EndTurnResponse
}

export interface ShuffleResponse {
    hasPeek: boolean
    variants: PlayerVariants
    newPawn: Pawn
    deflections: Deflection[]
    availableShuffles: AvailableShuffles
    eventCount: number
    previousEventCount: number
}

interface WsShuffle {
    event: 'shuffle'
    payload: ShuffleResponse
}

export interface PeekResponse {
    newPawn: Pawn
    deflections: Deflection[]
    postDeflectionPartialGameBoard: PostDeflectionPartialGameBoard
    eventCount: number
    previousEventCount: number
}

interface WsPeek {
    event: 'peek'
    payload: PeekResponse
}

export type GameWsEvent = WsMatchFound | WsAddPawn | WsEndTurn | WsShuffle | WsPeek