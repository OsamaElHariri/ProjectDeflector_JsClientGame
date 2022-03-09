import React, { ReactNode } from "react"
import { Player } from "../../types/types"
import { PlayerContext } from "./context"

interface Props {
    children: ReactNode
}

export function PlayerProvider({ children }: Props) {

    const player = {
        id: '12abc12',
    } as Player;

    return <PlayerContext.Provider value={player} children={children} />
}