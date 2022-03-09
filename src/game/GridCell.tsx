import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Pressable,
    View,
} from 'react-native';
import { BehaviorSubject } from 'rxjs';
import { LONG_PRESS_DELAY } from '../constants';
import PressIndicator from '../gesture_feedback/PressIndicator';
import { usePlayer } from '../main_providers/player_provider';
import { GestureState } from '../types/uiTypes';
import { shouldUpdate } from './diffWatcher';
import GameService from './gameService';
import { useGameState } from './game_state_provider';
import PawnVisual from './PawnVisual';
import Spinner from './Spinner';
import { GameState } from './types';

interface Props {
    rowIdx: number
    colIdx: number
    durability: Animated.Value
    scaleAnim: Animated.Value
}

const GridCell = ({ rowIdx, colIdx, durability, scaleAnim }: Props) => {
    const theme = useTheme();
    const player = usePlayer();
    const networkKey = `grid_cell_${rowIdx}_${colIdx}`;

    const gestureHandler = useRef<BehaviorSubject<GestureState>>(new BehaviorSubject<GestureState>({
        isEnabled: true,
        isHeld: false,
        isLongPressTriggered: false,
        isPressTriggered: false,
    }));

    const { stateSubject, networkRequestStatus, updateState } = useGameState();

    const getCellPawn = ({ game: { gameBoard: { pawns } } }: GameState) => {
        let pawn = pawns[rowIdx][colIdx];
        let isPreview = false;
        if (pawn.name === '' && stateSubject.value.previewPawn) {
            const previewPos = stateSubject.value.previewPawn.position;
            if (previewPos.x === colIdx && previewPos.y === rowIdx) {
                isPreview = true;
                pawn = stateSubject.value.previewPawn;
            }
        }
        return { isPreview, pawn };
    }
    const { pawn, isPreview } = getCellPawn(stateSubject.value);


    const [state, setState] = useState({
        networkState: networkRequestStatus.subject.value[networkKey],
        playerTurn: stateSubject.value.game.playerTurn,
        isProcessingDeflections: stateSubject.value.deflectionProcessing.isActive,
        isPreview: isPreview,
        durability: pawn.durability,
        variant: pawn.name
    });

    const rows = stateSubject.value.game.gameBoard.xMax + 1;
    const cols = stateSubject.value.game.gameBoard.yMax + 1;

    useEffect(() => {
        const sub = stateSubject.subscribe(gameState => {
            const { pawn, isPreview } = getCellPawn(gameState);
            const newState = {
                ...state,
                isPreview,
                playerTurn: gameState.game.playerTurn,
                isProcessingDeflections: gameState.deflectionProcessing.isActive,
                durability: pawn.durability,
                variant: pawn.name,

            };
            if (shouldUpdate(newState, state)) {
                durability.setValue(pawn.durability);
                setState(newState);
            }
        });

        return () => sub.unsubscribe();
    }, [state]);

    useEffect(() => {
        const sub = networkRequestStatus.subject.subscribe(statuses => {
            if (statuses[networkKey] !== state.networkState) {
                setState({
                    ...state,
                    networkState: statuses[networkKey]
                });
            }
        });
        return () => sub.unsubscribe();
    }, [state.networkState]);

    useEffect(() => {
        if (pawn.name === '' && state.playerTurn === player?.id && !state.isProcessingDeflections) {
            gestureHandler.current.next({
                ...gestureHandler.current.value,
                isEnabled: true
            });
        } else {
            gestureHandler.current.next({
                ...gestureHandler.current.value,
                isEnabled: false
            });

        }
    }, [state.playerTurn, state.isProcessingDeflections])

    const addPawn = async () => {
        if (state.networkState === 'LOADING') return;
        networkRequestStatus.update(networkKey, 'LOADING');

        const res = await (new GameService).addPawn({
            gameId: stateSubject.value.game.gameId,
            playerSide: stateSubject.value.game.playerTurn,
            x: colIdx,
            y: rowIdx,
        }).catch(err => {
            networkRequestStatus.update(networkKey, 'ERROR');
        });
        if (!res) return;
        networkRequestStatus.update(networkKey, 'NONE');

        updateState.onAddPawn(res);
    }

    const peek = async () => {
        if (state.networkState === 'LOADING') return;
        networkRequestStatus.update(networkKey, 'LOADING');

        const res = await (new GameService).peek({
            gameId: stateSubject.value.game.gameId,
            playerSide: stateSubject.value.game.playerTurn,
            x: colIdx,
            y: rowIdx,
        }).catch(err => {
            networkRequestStatus.update(networkKey, 'ERROR');
        });
        if (!res) return;
        networkRequestStatus.update(networkKey, 'NONE');

        updateState.onPeek(res);
    }

    const onLongPress = () => {
        gestureHandler.current.next({
            ...gestureHandler.current.value,
            isHeld: false,
            isEnabled: false,
            isPressTriggered: false,
            isLongPressTriggered: true
        });
        addPawn();
    }

    const onPress = () => {
        gestureHandler.current.next({
            ...gestureHandler.current.value,
            isHeld: false,
            isPressTriggered: true,
            isLongPressTriggered: false
        });
        peek();
    }

    const onPressIn = () => {
        gestureHandler.current.next({
            ...gestureHandler.current.value,
            isHeld: true,
            isLongPressTriggered: false,
            isPressTriggered: false
        });
    }

    const onPressOut = () => {
        if (!gestureHandler.current.value.isHeld) return;
        gestureHandler.current.next({
            ...gestureHandler.current.value,
            isHeld: false,
        });
    }

    const gridBorder = 2;

    const canPress = pawn.name === '';
    const canLongPress = pawn.name === '' || isPreview;
    let color = stateSubject.value.game.colors[pawn.playerOwner];

    return <View style={{
        borderColor: theme.colors.text,
        borderTopWidth: rowIdx === 0 ? gridBorder * 2 : gridBorder,
        borderLeftWidth: colIdx === 0 ? gridBorder * 2 : gridBorder,
        borderBottomWidth: rowIdx === rows - 1 ? gridBorder * 2 : gridBorder,
        borderRightWidth: colIdx === cols - 1 ? gridBorder * 2 : gridBorder,
    }}>
        <View style={{ position: 'absolute', width: 18, height: 18, right: 10, top: 10 }}>
            {state.networkState === 'LOADING' ? <Spinner /> : null}
        </View>
        <Pressable
            style={{ width: '100%', height: '100%' }}
            delayLongPress={LONG_PRESS_DELAY}
            onPress={canPress ? (() => onPress()) : undefined}
            onLongPress={canLongPress ? (() => onLongPress()) : undefined}
            onPressIn={() => onPressIn()}
            onPressOut={() => onPressOut()}
        >
            <View pointerEvents='none' style={{ position: 'absolute', width: '100%', height: '100%', transform: [{ scale: 0.7 }] }}>
                <PressIndicator gestureStateObservable={gestureHandler.current} />
            </View>
            <Animated.View style={{ opacity: isPreview ? 0.4 : 1, transform: [{ scale: scaleAnim }] }}>
                <PawnVisual durability={durability} variant={pawn.name} color={color}></PawnVisual>
            </Animated.View>
        </Pressable>
    </View>
}

export default GridCell;
