import React, { ReactNode, useState } from "react"
import { Game, GameState } from "../types";
import { GameStateContext } from "./context"

interface Props {
    children: ReactNode
    game: Game
}

export function GameStateProvider({ children, game }: Props) {

    const [currentState, setCurrentState] = useState<GameState>({
        game,
        allDeflections: [],
    });

    const updateState = (updatedState: GameState) => {
        setCurrentState(updatedState);
    }

    const contextVal = {
        state: currentState,
        updateState
    }

    return <GameStateContext.Provider value={contextVal} children={children} />
}