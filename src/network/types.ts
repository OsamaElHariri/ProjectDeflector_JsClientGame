import { Deflection, MatchPointPlayers, PlayerVariants } from "../game/types"
import { Pawn, ScoreBoard } from "../types/types"

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
}

interface WsAddPawn {
    event: 'pawn'
    payload: AddPawnResponse
}

export interface EndTurnResponse {
    scoreBoard: ScoreBoard,
    variants: PlayerVariants,
    playerTurn: string,
    allDeflections: Deflection[][],
    winner: string,
    matchPointPlayers: MatchPointPlayers,
    deflections: Deflection[],
}

interface WsEndTurn {
    event: 'turn'
    payload: EndTurnResponse
}

export interface ShuffleResponse {
    hasPeek: boolean,
    variants: PlayerVariants,
    newPawn: Pawn
    deflections: Deflection[]
}

interface WsShuffle {
    event: 'shuffle'
    payload: ShuffleResponse
}

export interface PeekResponse {
    newPawn: Pawn
    deflections: Deflection[]
}

interface WsPeek {
    event: 'peek'
    payload: PeekResponse
}

export type GameWsEvent = WsMatchFound | WsAddPawn | WsEndTurn | WsShuffle | WsPeek