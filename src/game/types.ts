import { GameBoard, Pawn, PawnVariant, Position } from "../types/types";

export type PlayerVariants = { [playerId: string]: PawnVariant[] }

export type MatchPointPlayers = { [playerId: string]: boolean }

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export interface Game {
    gameId: string
    playerIds: string[]
    gameBoard: GameBoard
    playerTurn: string
    variants: PlayerVariants
    targetScore: number
    matchPointPlayers: MatchPointPlayers
    colors: { [playerId: string]: string }
    deflections: Deflection[]
}

export interface DeflectionEvent {
    name: string
    position: Position
}

export interface Deflection {
    position: Position
    toDirection: Direction
    events: DeflectionEvent[]
}

export interface GameState {
    game: Game
    winner: string
    allDeflections: Deflection[][]
    deflectionPreview?: Deflection[]
    previewPawn?: Pawn
}