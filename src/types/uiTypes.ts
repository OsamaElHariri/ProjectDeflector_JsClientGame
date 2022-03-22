import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Game } from "../game/types"
import { Player } from "./types"

export type GameNavigatorParamList = {
    Lobby: undefined
    AwaitingGame: undefined
    Game: { game: Game, players: { [playerId: string]: Player } }
    LoadingGame: { gameId: string, otherPlayer?: Player }
}

export type AppNavigation = NativeStackNavigationProp<GameNavigatorParamList>

export interface GestureState {
    isEnabled: boolean
    isHeld: boolean
    isLongPressTriggered: boolean
    isPressTriggered: boolean
}
