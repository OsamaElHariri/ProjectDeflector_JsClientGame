import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Image,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { usePlayer } from '../main_providers/player_provider';
import GameService from './gameService';
import { useGameState } from './game_state_provider';

interface Props {
    playerId: string
}

const WaitingDots = ({ color }: { color: string }) => {
    return <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <View style={{ ...styles.waitingDot, backgroundColor: color }}></View>
        <View style={{ ...styles.waitingDot, backgroundColor: color }}></View>
        <View style={{ ...styles.waitingDot, backgroundColor: color }}></View>
    </View>
}

type TurnTimerIconOption = 'CLOCK' | 'END' | 'CANCEL' | 'WAITING'
const TurnTimerIcon = ({ icon, dotColor }: { icon: TurnTimerIconOption, dotColor: string }) => {
    const theme = useTheme();
    if (icon === 'CLOCK') {
        return <Image source={require('./assets/stop_watch.png')} style={{
            resizeMode: 'contain',
            tintColor: theme.colors.background,
            width: '40%',
            height: 60,
        }} />
    } else if (icon === 'END') {
        return <View style={{ backgroundColor: '#73956F' + '99', width: '100%', padding: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: theme.colors.background }}>END {'\n'}TURN</Text>
        </View>
    } else if (icon === 'CANCEL') {
        return <View style={{ backgroundColor: theme.colors.text + '99', width: '100%', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Image source={require('./assets/cancel.png')} style={{
                resizeMode: 'center',
                tintColor: theme.colors.background,
                width: '100%',
                height: 30,
            }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: theme.colors.background, paddingTop: 4 }}>CANCEL</Text>
        </View>
    } else {
        return <WaitingDots color={dotColor} />
    }
}

const TurnTimer = ({ playerId }: Props) => {
    const theme = useTheme();
    const player = usePlayer();

    const { state, updateState } = useGameState();
    const { playerTurn, gameId } = state.game;

    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        scaleAnim.setValue(playerTurn === playerId ? 2 : 0)
        Animated.timing(
            scaleAnim,
            {
                toValue: 0,
                duration: 1000 * 10,
                easing: Easing.linear,
                useNativeDriver: true
            }
        ).start();
    }, [scaleAnim, playerTurn]);

    const endTurn = async () => {
        const res = await (new GameService).endTurn({
            gameId: gameId,
            playerSide: playerId,
        });

        const { allDeflections, ...gameUpdates } = res;
        const { game: { gameBoard: { pawns } } } = state;

        allDeflections.forEach(deflections => {
            deflections.forEach((deflection, i) => {
                if (i === 0) return;

                pawns[deflection.position.y][deflection.position.x].durability -= 1;
                deflection.events.forEach(event => {
                    if (event.name === 'DESTROY_PAWN') {
                        pawns[event.position.y][event.position.x].name = '';
                    }
                });
            });
        });

        updateState({
            ...state,
            allDeflections,
            game: {
                ...state.game,
                ...gameUpdates
            }
        });
    }

    const isCurrentPlayerTimer = playerId === player?.id;

    return (
        <TouchableWithoutFeedback onPress={playerTurn === playerId ? endTurn : undefined}>
            <View style={{ ...styles.turnTimerContainer, backgroundColor: isCurrentPlayerTimer ? '' : theme.colors.text }}>
                <View style={{ position: 'absolute', width: '100%', height: '100%', top: '50%' }}>
                    <Animated.View style={{ width: '100%', height: '100%', backgroundColor: '#73956F', transform: [{ scaleY: scaleAnim }] }} ></Animated.View>
                </View>
                <View style={styles.iconContainer}>
                    <TurnTimerIcon icon='WAITING' dotColor={isCurrentPlayerTimer ? theme.colors.text : theme.colors.background} />
                </View>
                <View style={{ ...styles.timerBorder, borderColor: theme.colors.text }} ></View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    turnTimerContainer: {
        overflow: 'hidden',
        marginTop: 16,
        width: '100%',
    },
    timerBorder: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderWidth: 4
    },
    iconContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    waitingDot: {
        width: 12,
        height: 12,
        marginHorizontal: 4,
        borderRadius: 100
    }
});

export default TurnTimer;