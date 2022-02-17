import WsClient, { ConnectionStatus } from "../../network/wsClient";

export interface WsClientState {
    connectionStatus: ConnectionStatus
}

export interface WsClientConnection {
    client: WsClient
    state: WsClientState
}