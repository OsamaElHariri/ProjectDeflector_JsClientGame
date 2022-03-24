import React, { ReactNode, useEffect, useState } from "react"
import { Text } from "react-native";
import { GameTheme } from "../../AppEntry";
import PlainOverlay from "../../lobby/PlainOverlay";
import UserService from "../../lobby/userService";
import ApiClient from "../../network/apiClient";
import { Player } from "../../types/types"
import { PlayerContext } from "./context"

interface Props {
    children: ReactNode
}

export function PlayerProvider({ children }: Props) {

    const [playerState, setPlayerState] = useState<{
        player?: Player
        error?: string
    }>();

    useEffect(() => {
        const setup = async () => {
            let uuid = await UserService.getLocalUuid();
            if (!uuid) {
                const { uuid: newUuid } = await UserService.createNewUser();
                uuid = newUuid;
                await UserService.storeLocalUuid(uuid);
            }
            const token = await UserService.getAccessToken(uuid);
            ApiClient.accessToken = token;
            const user = await UserService.getCurrentUser();

            setPlayerState({
                player: user,
            });
        }

        (async () => {
            try {
                await setup()
            } catch (error) {
                setPlayerState({
                    error: "An Error!?!? You can go ahead and panic."
                });
            }
        })();
    }, [])

    if (playerState?.player) {
        return <PlayerContext.Provider value={playerState.player} children={children} />
    } else {
        return <PlainOverlay>
            <Text style={{ fontWeight: 'bold', color: GameTheme.colors.text, fontSize: 32 }}>{playerState?.error || 'Setting things up'}</Text>
        </PlainOverlay>
    }
}