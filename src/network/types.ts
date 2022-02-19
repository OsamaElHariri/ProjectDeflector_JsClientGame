import { PlayerVariants } from "../game/types"
import { Pawn, ScoreBoard } from "../types/types"

type WsMatchFound = {
    event: 'match_found'
    payload: {
        id: string
    }
}

export type AddPawn = {
    scoreBoard: ScoreBoard,
    variants: PlayerVariants,
    newPawn: Pawn
}

type WsAddPawn = {
    event: 'turn'
    payload: AddPawn
}

export type GameWsEvent = WsMatchFound | WsAddPawn