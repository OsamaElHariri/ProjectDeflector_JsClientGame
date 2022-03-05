import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
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
import GameService from './gameService';
import { useGameState } from './game_state_provider';
import PawnVisual from './PawnVisual';

interface Props {
    rowIdx: number
    colIdx: number
    bounceAnim: Animated.Value
}

const GridCell = ({ rowIdx, colIdx, bounceAnim }: Props) => {
    const theme = useTheme();
    const player = usePlayer();

    const gridBorder = 2;

    const { state, updateState } = useGameState();
    const rows = state.game.gameBoard.xMax + 1;
    const cols = state.game.gameBoard.yMax + 1;
    const gestureHandler = useRef<BehaviorSubject<GestureState>>(new BehaviorSubject<GestureState>({
        isEnabled: true,
        isHeld: false,
        isLongPressTriggered: false,
        isPressTriggered: false,
    }));

    useEffect(() => {
        if (pawn.name === '' && state.game.playerTurn === player?.id) {
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
    }, [state.game.playerTurn])

    let pawn = state.game.gameBoard.pawns[rowIdx][colIdx];
    let isPreview = false;
    if (pawn.name === '' && state.previewPawn) {
        const previewPos = state.previewPawn.position;
        if (previewPos.x === colIdx && previewPos.y === rowIdx) {
            isPreview = true;
            pawn = state.previewPawn;
        }
    }

    const addPawn = async () => {
        const res = await (new GameService).addPawn({
            gameId: state.game.gameId,
            playerSide: state.game.playerTurn,
            x: colIdx,
            y: rowIdx,
        });
        updateState.onAddPawn(res);
    }

    const peek = async () => {
        const res = await (new GameService).peek({
            gameId: state.game.gameId,
            playerSide: state.game.playerTurn,
            x: colIdx,
            y: rowIdx,
        });
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

    const canPress = pawn.name === '';
    const canLongPress = pawn.name === '' || isPreview;


    return <View style={{
        borderColor: theme.colors.text,
        borderTopWidth: rowIdx === 0 ? gridBorder * 2 : gridBorder,
        borderLeftWidth: colIdx === 0 ? gridBorder * 2 : gridBorder,
        borderBottomWidth: rowIdx === rows - 1 ? gridBorder * 2 : gridBorder,
        borderRightWidth: colIdx === cols - 1 ? gridBorder * 2 : gridBorder,
        flex: 1
    }}>
        <Pressable
            style={{ width: '100%', height: '100%' }}
            delayLongPress={LONG_PRESS_DELAY}
            onPress={canPress ? (() => onPress()) : undefined}
            onLongPress={canLongPress ? (() => onLongPress()) : undefined}
            onPressIn={() => onPressIn()}
            onPressOut={() => onPressOut()}
        >
            <PressIndicator gestureStateObservable={gestureHandler.current} bounceAnim={bounceAnim} />
            <View style={{ opacity: isPreview ? 0.4 : 1 }}>
                <PawnVisual durability={pawn.durability} variant={pawn.name}></PawnVisual>
            </View>
        </Pressable>
    </View>
}

export default GridCell;
