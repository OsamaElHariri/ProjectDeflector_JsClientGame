import { useNavigation } from "@react-navigation/native";
import React, { ReactNode, useEffect, useRef, useState } from "react"
import { BehaviorSubject, Subscription } from "rxjs";
import { GameStateUpdate } from ".";
import { usePlayer } from "../../main_providers/player_provider";
import { useWsClient } from "../../main_providers/ws_provider";
import { NetworkRequestStatus } from "../../network/types";
import { Player } from "../../types/types";
import { AppNavigation } from "../../types/uiTypes";
import GameService from "../gameService";
import { Game, GameState } from "../types";
import { GameStateContext } from "./context"

interface Props {
    children: ReactNode
    game: Game
    players: { [playerId: string]: Player }
}

interface EventCount {
    eventCount: number
    previousEventCount: number
}

export function GameStateProvider({ children, game, players }: Props) {
    const clientState = useWsClient();
    const { player } = usePlayer();
    const clientSub = useRef<Subscription>();
    const nav = useNavigation<AppNavigation>();
    const eventCount = useRef<EventCount>({
        eventCount: game.eventCount,
        previousEventCount: game.eventCount
    });
    const shouldReconnect = useRef(false);

    const reloadGame = () => {
        const otherPlayer = Object.values(players).find(p => p.id !== player?.id);
        nav.replace('LoadingGame', { gameId: game.gameId, otherPlayer: otherPlayer });
    }

    const checkEventCount = (counts: EventCount) => {
        // if this is a future event, it means some events were missed
        // reload the game
        if (counts.previousEventCount > eventCount.current.eventCount) {
            reloadGame();
            return false;
        }

        // if this is a past event, the game must have already been reloaded
        // skip this event
        if (counts.previousEventCount < eventCount.current.eventCount) {
            return true;
        }

        eventCount.current = { eventCount: counts.eventCount, previousEventCount: counts.previousEventCount };
        return true;
    }

    const gameStateSubject = useRef(new BehaviorSubject<GameState>({
        game,
        players,
        currentTurnDeflections: game.deflections,
        nextTurnPartialGameBoard: game.postDeflectionPartialGameBoard,
        allDeflections: [],
        allPostDeflectionPartialGameBoards: [],
        winner: '',
        deflectionProcessing: {
            isActive: false,
            allDeflectionsIndex: 0,
        }
    })).current;

    useEffect(() => {
        if ((game as any).winner) {
            nav.replace('Winner', { winner: (game as any).winner });
            return;
        }

        const interval = setInterval(() => {
            const turnEnd = gameStateSubject.value.game.lastTurnEndTime + gameStateSubject.value.game.timePerTurn;
            const hasEnded = Date.now() > turnEnd;
            if (hasEnded && !gameStateSubject.value.winner) {
                GameService.expireTurn({
                    gameId: game.gameId,
                    eventCount: eventCount.current.eventCount,
                }).catch(err => undefined);
            }
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const statusesSubject = useRef(new BehaviorSubject<{ [key: string]: NetworkRequestStatus }>({})).current;

    const gameStateUpdate: GameStateUpdate = {
        onEndTurn: (res) => {
            const valid = checkEventCount(res);
            if (!valid) return;

            const { allDeflections, allPostDeflectionPartialGameBoards, postDeflectionPartialGameBoard, winner, ...gameUpdates } = res;
            const { scoreBoard, ...remainingUpdates } = gameUpdates;

            gameStateSubject.next({
                ...gameStateSubject.value,
                winner,
                allDeflections,
                allPostDeflectionPartialGameBoards,
                previewPawn: undefined,
                deflectionPreview: undefined,
                postDeflectionPartialGameBoardPreview: undefined,
                currentTurnDeflections: res.deflections,
                nextTurnPartialGameBoard: res.postDeflectionPartialGameBoard,
                game: {
                    ...gameStateSubject.value.game,
                    ...remainingUpdates,
                    lastTurnEndTime: res.lastTurnEndTime,
                    availableShuffles: res.availableShuffles,
                    gameBoard: {
                        ...gameStateSubject.value.game.gameBoard,
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
            const valid = checkEventCount(res);
            if (!valid) return;

            const x = res.newPawn.position.x;
            const y = res.newPawn.position.y;
            gameStateSubject.value.game.gameBoard.pawns[y][x] = res.newPawn;
            gameStateSubject.next({
                ...gameStateSubject.value,
                previewPawn: undefined,
                deflectionPreview: undefined,
                postDeflectionPartialGameBoardPreview: undefined,
                currentTurnDeflections: res.deflections,
                nextTurnPartialGameBoard: res.postDeflectionPartialGameBoard,
                game: {
                    ...gameStateSubject.value.game,
                    variants: res.variants,
                    gameBoard: {
                        ...gameStateSubject.value.game.gameBoard,
                        scoreBoard: res.scoreBoard,
                        pawns: [...gameStateSubject.value.game.gameBoard.pawns]
                    }
                },
            });
        },

        onShuffle: (res) => {
            const valid = checkEventCount(res);
            if (!valid) return;

            gameStateSubject.next({
                ...gameStateSubject.value,
                game: {
                    ...gameStateSubject.value.game,
                    availableShuffles: res.availableShuffles,
                    variants: res.variants
                }
            });
        },

        onPeek: (res) => {
            const valid = checkEventCount(res);
            if (!valid) return;

            gameStateSubject.next({
                ...gameStateSubject.value,
                deflectionPreview: res.deflections,
                previewPawn: res.newPawn,
                postDeflectionPartialGameBoardPreview: res.postDeflectionPartialGameBoard
            });
        },

        updatePawns: (pawns) => {
            gameStateSubject.next({
                ...gameStateSubject.value,
                game: {
                    ...gameStateSubject.value.game,
                    gameBoard: {
                        ...gameStateSubject.value.game.gameBoard,
                        pawns
                    }
                }
            });
        },
        updateDeflectionProcessing: (deflectionProcessing) => {
            if (!deflectionProcessing.isActive && gameStateSubject.value.winner) {
                nav.replace('Winner', { winner: gameStateSubject.value.winner });
            } else {
                gameStateSubject.next({
                    ...gameStateSubject.value,
                    deflectionProcessing
                });
            }
        },

        onCancelPeek: () => {
            gameStateSubject.next({
                ...gameStateSubject.value,
                previewPawn: undefined,
                deflectionPreview: undefined,
                postDeflectionPartialGameBoardPreview: undefined,
            });
        },
    }

    useEffect(() => {
        if (!clientState || clientSub.current) return;
        clientSub.current = clientState.client.events().subscribe(event => {
            if (event.event === 'turn') {
                gameStateUpdate.onEndTurn(GameService.parseEndTurnResponse(event.payload));
            } else if (event.event === 'pawn') {
                gameStateUpdate.onAddPawn(GameService.parseAddPawnResponse(event.payload));
            } else if (event.event === 'shuffle') {
                gameStateUpdate.onShuffle(GameService.parseShuffleResponse(event.payload));
            } else if (event.event === 'peek') {
                gameStateUpdate.onPeek(GameService.parsePeekResponse(event.payload));
            }
        });

        return () => clientSub.current?.unsubscribe();
    }, [clientState])

    useEffect(() => {
        if (!clientState) return;
        if (clientState.state.connectionStatus !== 'connected') shouldReconnect.current = true;
        if (clientState.state.connectionStatus === 'connected' && shouldReconnect.current) {
            reloadGame();
        }
    }, [clientState?.state.connectionStatus])

    const updateNetworkStatus = (networkKey: string, status: NetworkRequestStatus) => {
        statusesSubject.next({
            ...statusesSubject.value,
            [networkKey]: status
        });
    }

    const contextVal = {
        stateSubject: gameStateSubject,
        updateState: gameStateUpdate,
        networkRequestStatus: {
            subject: statusesSubject,
            update: updateNetworkStatus
        }
    }

    return <GameStateContext.Provider value={contextVal} children={children} />
}