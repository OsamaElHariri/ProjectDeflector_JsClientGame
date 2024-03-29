export interface PlayerGameStats {
    games: number
    wins: number
    hasWonToday: boolean
    winStreak: number
    nextDay: number
}

export interface Player {
    id: string
    nickname: string
    color: string
    gameStats: PlayerGameStats
}

export interface Position {
    x: number
    y: number
}

export interface ScoreBoard { [playerId: string]: number }
export type PawnVariant = 'SLASH' | 'BACKSLASH' | ''

export interface Pawn {
    position: Position
    name: PawnVariant
    durability: number
    playerOwner: string
}

export interface GameBoard {
    id: string
    xMin: number
    xMax: number
    yMin: number
    yMax: number
    pawns: Pawn[][]
    turn: number
    scoreBoard: ScoreBoard
}