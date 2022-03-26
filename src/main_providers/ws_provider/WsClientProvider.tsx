import React, { ReactNode, useEffect, useState } from "react"
import WsClient from "../../network/wsClient";
import { usePlayer } from "../player_provider";
import { WsClientContext } from "./context"
import { WsClientConnection } from "./types";

interface Props {
    children: ReactNode
}

export function WsClientProvider({ children }: Props) {
    const { player } = usePlayer();
    const [connection, setConnection] = useState<WsClientConnection>();

    useEffect(() => {
        if (!player || connection?.client) return;

        const client = new WsClient;
        client.status().subscribe(status => {
            setConnection({
                client,
                state: {
                    connectionStatus: status
                }
            });
        });

        client.connect();
    }, [player]);

    return <WsClientContext.Provider value={connection} children={children} />
}