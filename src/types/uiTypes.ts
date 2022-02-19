import { NativeStackNavigationProp } from "@react-navigation/native-stack"

export type GameNavigatorParamList = {
    Lobby: undefined
    Game: { gameId: string }
}

export type AppNavigation = NativeStackNavigationProp<GameNavigatorParamList>