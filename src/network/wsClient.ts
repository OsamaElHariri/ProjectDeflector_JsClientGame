import { Subject, Subscription } from 'rxjs';
import ApiClient from './apiClient';
import { GameWsEvent } from './types';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export default class WsClient {
    private baseUrl = 'ws://192.168.2.141:8080';

    private client?: WebSocket;
    private eventSubject: Subject<GameWsEvent>;
    private sendSubject: Subject<any>;
    private connectionStatusSubject: Subject<ConnectionStatus>;
    private connectionStatus: ConnectionStatus = 'disconnected';

    private maxSilenceTimeout = 15000;
    private initialReconnectionTimeout = 500;
    private reconnectionTimeout = 0;


    constructor() {
        this.reconnectionTimeout = this.initialReconnectionTimeout;
        this.eventSubject = new Subject();
        this.sendSubject = new Subject();
        this.connectionStatusSubject = new Subject();
    }

    connect() {
        const client = new WebSocket(this.baseUrl + '/realtime/ws', undefined, {
            headers: {
                'Authorization': `Bearer ${ApiClient.accessToken}`,
            }
        });

        let shouldAttemptToReconnect = true;
        const attemptReconnect = () => {
            if (!shouldAttemptToReconnect) return;
            shouldAttemptToReconnect = false;
            setTimeout(() => this.connect(), this.reconnectionTimeout);
        };

        this.client = client;
        this.updateConnectionStatus('connecting');

        let sendSubscription: Subscription | undefined;
        const onOpen = () => {
            this.reconnectionTimeout = this.initialReconnectionTimeout;
            this.updateConnectionStatus('connected');

            sendSubscription = this.sendSubject.subscribe(data => {
                if (this.connectionStatus === 'connected') {
                    this.client?.send(JSON.stringify(data));
                }
            });
        };
        client.addEventListener('open', onOpen);

        let closed = false;
        let lastMsgTime = new Date().getTime();

        const onClose = () => {
            closed = true;
            lastMsgTime = 0;
            this.updateConnectionStatus('disconnected');
            attemptReconnect();
        };
        client.addEventListener('close', onClose);

        const onMessage = (evt: WebSocketMessageEvent) => {
            lastMsgTime = new Date().getTime();
            if (evt.data) {
                this.eventSubject.next(JSON.parse(evt.data));
            }
        }
        client.addEventListener('message', onMessage);

        const interval = setInterval(() => {
            const msgDiff = new Date().getTime() - lastMsgTime;

            if (msgDiff > this.maxSilenceTimeout) {
                this.reconnectionTimeout = Math.min(this.maxSilenceTimeout, this.reconnectionTimeout * 2);
                clearInterval(interval);
                client.removeEventListener('open', onOpen);
                client.removeEventListener('message', onMessage);
                client.removeEventListener('close', onClose);

                sendSubscription?.unsubscribe();
                client.close();
                attemptReconnect();
            } else if (!closed) {
                this.send({
                    relay: '/realtime/status'
                });
            }
        }, 5000);
    }

    private updateConnectionStatus(status: ConnectionStatus) {
        this.connectionStatus = status;
        this.connectionStatusSubject.next(status);
    }

    status() {
        return this.connectionStatusSubject;
    }

    events() {
        return this.eventSubject;
    }

    send(data: any) {
        if (!this.client) throw new Error('WS Client is not connected');
        this.sendSubject.next(data);
    }
}