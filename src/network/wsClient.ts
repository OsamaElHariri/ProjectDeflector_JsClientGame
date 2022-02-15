import { Subject } from 'rxjs';

export default class WsClient {
    private baseUrl = 'ws://192.168.2.141:8080';

    private client: WebSocket;
    private eventSubject: Subject<any>;
    private sendSubject: Subject<any>;


    constructor(playerId: string) {
        this.client = new WebSocket(this.baseUrl + '/realtime/ws/' + playerId);
        this.eventSubject = new Subject();
        this.sendSubject = new Subject();

        this.client.addEventListener('message', (evt) => {
            if (evt.data) {
                this.eventSubject.next(JSON.parse(evt.data));
            }
        });


        this.client.addEventListener('open', () => {
            this.sendSubject.subscribe(data => {
                this.client.send(JSON.stringify(data));
            })
        });
    }

    events() {
        return this.eventSubject;
    }

    send(data: any) {
        this.sendSubject.next(data);
    }

}