import { Subject } from 'rxjs';
import { GameWsEvent } from './types';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export default class WsClient {
    private baseUrl = 'ws://192.168.2.141:8080';

    private client?: WebSocket;
    private eventSubject: Subject<GameWsEvent>;
    private sendSubject: Subject<any>;
    private connectionStatusSubject: Subject<ConnectionStatus>;
    private connectionStatus: ConnectionStatus = 'disconnected';


    constructor() {
        this.eventSubject = new Subject();
        this.sendSubject = new Subject();
        this.connectionStatusSubject = new Subject();
    }

    connect(playerId: string) {
        this.client = new WebSocket(this.baseUrl + '/realtime/ws/' + playerId);
        this.updateConnectionStatus('connecting');
        this.client.addEventListener('message', (evt) => {
            if (evt.data) {
                this.eventSubject.next(JSON.parse(evt.data));
            }
        });

        this.client.addEventListener('open', () => {
            this.updateConnectionStatus('connected');
            this.sendSubject.subscribe(data => {
                if (this.connectionStatus === 'connected') {
                    this.client?.send(JSON.stringify(data));
                }
            });
        });

        this.client.addEventListener('close', () => {
            this.updateConnectionStatus('disconnected');
        });
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