import React, { ReactNode, useEffect, useRef, useState } from "react"
import { BehaviorSubject, Subscription } from "rxjs";
import { GameStateUpdate } from ".";
import { useWsClient } from "../../main_providers/ws_provider";
import { NetworkRequestStatus } from "../../network/types";
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

    const gameStateSubject = useRef(new BehaviorSubject<GameState>({
        game,
        allDeflections: [],
        winner: '',
        deflectionProcessing: {
            isActive: false,
            allDeflectionsIndex: 0,
        }
    }));
    const statusesSubject = useRef(new BehaviorSubject<{ [key: string]: NetworkRequestStatus }>({}));

    const gameStateUpdate: GameStateUpdate = {
        onEndTurn: (res) => {
            const { allDeflections, winner, ...gameUpdates } = res;
            const { scoreBoard, ...remainingUpdates } = gameUpdates;

            gameStateSubject.current.next({
                ...gameStateSubject.current.value,
                winner,
                allDeflections,
                previewPawn: undefined,
                deflectionPreview: undefined,
                currentTurnDeflections: res.deflections,
                game: {
                    ...gameStateSubject.current.value.game,
                    ...remainingUpdates,
                    availableShuffles: res.availableShuffles,
                    gameBoard: {
                        ...gameStateSubject.current.value.game.gameBoard,
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
            gameStateSubject.current.value.game.gameBoard.pawns[y][x] = res.newPawn;
            gameStateSubject.current.next({
                ...gameStateSubject.current.value,
                previewPawn: undefined,
                deflectionPreview: undefined,
                currentTurnDeflections: res.deflections,
                game: {
                    ...gameStateSubject.current.value.game,
                    variants: res.variants,
                    gameBoard: {
                        ...gameStateSubject.current.value.game.gameBoard,
                        scoreBoard: res.scoreBoard,
                        pawns: [...gameStateSubject.current.value.game.gameBoard.pawns]
                    }
                },
            });
        },

        onShuffle: (res) => {
            gameStateSubject.current.next({
                ...gameStateSubject.current.value,
                game: {
                    ...gameStateSubject.current.value.game,
                    availableShuffles: res.availableShuffles,
                    variants: res.variants
                }
            });
        },

        onPeek: (res) => {
            gameStateSubject.current.next({
                ...gameStateSubject.current.value,
                deflectionPreview: res.deflections,
                previewPawn: res.newPawn
            });
        },

        updatePawns: (pawns) => {
            gameStateSubject.current.next({
                ...gameStateSubject.current.value,
                game: {
                    ...gameStateSubject.current.value.game,
                    gameBoard: {
                        ...gameStateSubject.current.value.game.gameBoard,
                        pawns
                    }
                }
            });
        },
        updateDeflectionProcessing: (deflectionProcessing) => {
            gameStateSubject.current.next({
                ...gameStateSubject.current.value,
                deflectionProcessing
            });
        },

        onCancelPeek: () => {
            gameStateSubject.current.next({
                ...gameStateSubject.current.value,
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
                gameStateUpdate.onEndTurn(GameService.parseEndTurnResponse(event.payload));
            } else if (event.event === 'pawn') {
                gameStateUpdate.onAddPawn(GameService.parseAddPawnResponse(event.payload));
            } else if (event.event === 'shuffle') {
                gameStateUpdate.onShuffle(GameService.parseShuffleResponse(event.payload));
            } else if (event.event === 'peek') {
                gameStateUpdate.onPeek(GameService.parsePeekResponse(event.payload));
            } */
        });

        return () => clientSub.current?.unsubscribe();
    }, [clientState])

    const updateNetworkStatus = (networkKey: string, status: NetworkRequestStatus) => {
        statusesSubject.current.next({
            ...statusesSubject.current.value,
            [networkKey]: status
        });
    }

    const contextVal = {
        stateSubject: gameStateSubject.current,
        updateState: gameStateUpdate,
        networkRequestStatus: {
            subject: statusesSubject.current,
            update: updateNetworkStatus
        }
    }

    return <GameStateContext.Provider value={contextVal} children={children} />
}