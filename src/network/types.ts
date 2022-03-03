import { Deflection, MatchPointPlayers, PlayerVariants } from "../game/types"
import { Pawn, ScoreBoard } from "../types/types"

type WsMatchFound = {
    event: 'match_found'
    payload: {
        id: string
    }
}

export type AddPawnResponse = {
    scoreBoard: ScoreBoard,
    variants: PlayerVariants,
    newPawn: Pawn
    deflections: Deflection[]
}

type WsAddPawn = {
    event: 'pawn'
    payload: AddPawnResponse
}

export type EndTurnResponse = {
    scoreBoard: ScoreBoard,
    variants: PlayerVariants,
    playerTurn: string,
    allDeflections: Deflection[][],
    winner: string,
    matchPointPlayers: MatchPointPlayers,
    deflections: Deflection[],
}

type WsEndTurn = {
    event: 'turn'
    payload: EndTurnResponse
}

export type ShuffleResponse = {
    hasPeek: boolean,
    variants: PlayerVariants,
    newPawn: Pawn
    deflections: Deflection[]
}

type WsShuffle = {
    event: 'shuffle'
    payload: ShuffleResponse
}

export type PeekResponse = {
    newPawn: Pawn
    deflections: Deflection[]
}

type WsPeek = {
    event: 'peek'
    payload: PeekResponse
}

export type GameWsEvent = WsMatchFound | WsAddPawn | WsEndTurn | WsShuffle | WsPeek