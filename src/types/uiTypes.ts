import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Game } from "../game/types"

export type GameNavigatorParamList = {
    Lobby: undefined
    AwaitingGame: undefined
    Game: { game: Game }
}

export type AppNavigation = NativeStackNavigationProp<GameNavigatorParamList>

export type GestureState = {
    isEnabled: boolean
    isHeld: boolean
    isLongPressTriggered: boolean
    isPressTriggered: boolean
}
