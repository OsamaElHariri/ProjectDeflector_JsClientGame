import React, { ReactNode, useEffect, useRef, useState } from "react"
import { Subscription } from "rxjs";
import { GameStateUpdate } from ".";
import { useWsClient } from "../../main_providers/ws_provider";
import GameService from "../gameService";
import { Game, GameState } from "../types";
import { GameStateContext } from "./context"

interface Props {
    children: ReactNode
    game: Game
}

export function GameStateProvider({ children, game }: Props) {
    const clientState = useWsClient();
    const clientSub = useRef<Subscription>();
    const [currentState, setCurrentState] = useState<GameState>({
        game,
        allDeflections: [],
        winner: '',
        deflectionProcessing: {
            isActive: false,
            allDeflectionsIndex: 0,
        }
    });

    const gameStateUpdate: GameStateUpdate = {
        onEndTurn: (res) => {
            const { allDeflections, winner, ...gameUpdates } = res;
            const { scoreBoard, ...remainingUpdates } = gameUpdates;

            setCurrentState({
                ...currentState,
                winner,
                allDeflections,
                previewPawn: undefined,
                deflectionPreview: undefined,
                currentTurnDeflections: res.deflections,
                game: {
                    ...currentState.game,
                    ...remainingUpdates,
                    gameBoard: {
                        ...currentState.game.gameBoard,
                        scoreBoard
                    }
                },
                deflectionProcessing: {
                    isActive: true,
                    allDeflectionsIndex: 0
                }
            });
        },

        onAddPawn: (res) => {
            const x = res.newPawn.position.x;
            const y = res.newPawn.position.y;
            currentState.game.gameBoard.pawns[y][x] = res.newPawn;
            setCurrentState({
                ...currentState,
                previewPawn: undefined,
                deflectionPreview: undefined,
                currentTurnDeflections: res.deflections,
                game: {
                    ...currentState.game,
                    variants: res.variants,
                    gameBoard: {
                        ...currentState.game.gameBoard,
                        scoreBoard: res.scoreBoard,
                        pawns: [...currentState.game.gameBoard.pawns]
                    }
                },
            });
        },

        onShuffle: (res) => {
            setCurrentState({
                ...currentState,
                game: {
                    ...currentState.game,
                    variants: res.variants
                }
            });
        },

        onPeek: (res) => {
            setCurrentState({
                ...currentState,
                deflectionPreview: res.deflections,
                previewPawn: res.newPawn
            });
        },

        updatePawns: (pawns) => {
            setCurrentState({
                ...currentState,
                game: {
                    ...currentState.game,
                    gameBoard: {
                        ...currentState.game.gameBoard,
                        pawns
                    }
                }
            });
        },
        updateDeflectionProcessing: (deflectionProcessing) => {
            setCurrentState({
                ...currentState,
                deflectionProcessing
            });
        },

        onCancelPeek: () => {
            setCurrentState({
                ...currentState,
                previewPawn: undefined,
                deflectionPreview: undefined,
            });
        },
    }

    useEffect(() => {
        if (!clientState || clientSub.current) return;
        clientSub.current = clientState.client.events().subscribe(event => {
            // TODO enable these after fixing WS connection issues
            // and after disabling sending WS event to current player
            /* if (event.event === 'turn') {
                gameStateUpdate.onEndTurn(new GameService().parseEndTurnResponse(event.payload));
            } else if (event.event === 'pawn') {
                gameStateUpdate.onAddPawn(new GameService().parseAddPawnResponse(event.payload));
            } else if (event.event === 'shuffle') {
                gameStateUpdate.onShuffle(new GameService().parseShuffleResponse(event.payload));
            } else if (event.event === 'peek') {
                gameStateUpdate.onPeek(new GameService().parsePeekResponse(event.payload));
            } */
        });

        return () => clientSub.current?.unsubscribe();
    }, [clientState])

    const contextVal = {
        state: currentState,
        updateState: gameStateUpdate
    }

    return <GameStateContext.Provider value={contextVal} children={children} />
}