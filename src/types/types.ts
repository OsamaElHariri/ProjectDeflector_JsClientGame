export interface Player {
    id: string
    color: string
}

export interface Position {
    x: number
    y: number
}

export type ScoreBoard =  { [playerId: string]: number }

export interface Pawn {
    position: Position
    name: string
    durability: number
    playerOwner: string
}

export interface GameBoard {
    id: string
    xMin: number
    xMax: number
    yMin: number
    yMax: number
    pawns: string
    turn: number
    scoreBoard: ScoreBoard
}