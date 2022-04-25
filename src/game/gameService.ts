import ApiClient from "../network/apiClient";
import { AddPawnResponse, EndTurnResponse, PeekResponse, ShuffleResponse } from "../network/types";
import { Pawn, PawnVariant } from "../types/types";
import { Deflection, Game } from "./types";

export default class GameService {

    static async findGame() {
        const res = await ApiClient.post(`/match/find`);
        const json = await res.json();

        return json;
    }

    static async touchQueue() {
        const res = await ApiClient.post(`/match/touch`);
        const json = await res.json();

        return json;
    }

    static async cancelFindGame() {
        const res = await ApiClient.post(`/match/cancel`);
        const json = await res.json();

        return json;
    }

    static async findSolo() {
        const res = await ApiClient.post(`/match/solo`);
        const json = await res.json();

        return json;
    }

    static async getOngoingGame(): Promise<string> {
        const res = await ApiClient.get(`/game/ongoing/game`);
        const json = await res.json();

        return json.gameId;
    }

    static async getGame(gameId: string): Promise<Game> {
        const res = await ApiClient.get(`/game/game/${gameId}`);
        const json: Game = await res.json();
        Object.keys(json.variants).forEach(playerId => {
            json.variants[playerId] = json.variants[playerId].map(v => v.toUpperCase() as PawnVariant);
        });
        return {
            ...json,
            deflections: json.deflections.map(this.parseDeflection),
            gameBoard: {
                ...json.gameBoard,
                pawns: json.gameBoard.pawns.map(pawnArray => pawnArray.map(this.parsePawn))
            }
        };
    }

    static async addPawn(req: { gameId: string, x: number, y: number }): Promise<AddPawnResponse> {
        const res = await ApiClient.post(`/game/pawn`, req);
        const json = await res.json();
        return this.parseAddPawnResponse(json);
    }

    static parseAddPawnResponse(json: any): AddPawnResponse {
        Object.keys(json.variants).forEach(playerId => {
            json.variants[playerId] = json.variants[playerId].map((v: string) => v.toUpperCase() as PawnVariant);
        });
        return {
            ...json,
            deflections: json.deflections.map(this.parseDeflection),
            newPawn: this.parsePawn(json.newPawn),
        };
    }

    static async expireTurn(req: { gameId: string, eventCount: number }): Promise<EndTurnResponse> {
        const res = await ApiClient.post(`/game/turn/expire`, req);
        const json = await res.json();
        return this.parseEndTurnResponse(json);
    }

    static async endTurn(req: { gameId: string }): Promise<EndTurnResponse> {
        const res = await ApiClient.post(`/game/turn`, req);
        const json = await res.json();
        return this.parseEndTurnResponse(json);
    }

    static parseEndTurnResponse(json: any): EndTurnResponse {
        Object.keys(json.variants).forEach(playerId => {
            json.variants[playerId] = json.variants[playerId].map((v: string) => v.toUpperCase() as PawnVariant);
        });
        return {
            ...json,
            deflections: json.deflections.map(this.parseDeflection),
            allDeflections: json.allDeflections.map(
                (deflections: any[]) => deflections.map(this.parseDeflection)
            )
        };
    }

    static async shuffle(req: { gameId: string, x: number, y: number, hasPeek: boolean }): Promise<ShuffleResponse> {
        const res = await ApiClient.post(`/game/shuffle`, req);
        const json = await res.json();
        return this.parseShuffleResponse(json);
    }

    static parseShuffleResponse(json: any): ShuffleResponse {
        Object.keys(json.variants).forEach(playerId => {
            json.variants[playerId] = json.variants[playerId].map((v: string) => v.toUpperCase() as PawnVariant);
        });
        return {
            ...json,
            newPawn: json.newPawn && this.parsePawn(json.newPawn),
            deflections: json.deflections?.map(this.parseDeflection)
        };
    }

    static async peek(req: { gameId: string, x: number, y: number }): Promise<PeekResponse> {
        const res = await ApiClient.post(`/game/peek`, req);
        const json = await res.json();
        return this.parsePeekResponse(json);
    }

    static parsePeekResponse(json: any): PeekResponse {
        return {
            ...json,
            newPawn: this.parsePawn(json.newPawn),
            deflections: json.deflections.map(this.parseDeflection)
        };
    }

    static parsePawn(pawn: any): Pawn {
        return {
            ...pawn,
            name: pawn.name.toUpperCase()
        }
    }

    static parseDeflection(deflection: any): Deflection {
        const directionMap: { [key: number]: string } = {
            0: 'UP',
            1: 'DOWN',
            2: 'LEFT',
            3: 'RIGHT',
        }
        return {
            ...deflection,
            events: deflection.events.map((evt: any) => ({ ...evt, name: evt.name.toUpperCase() })),
            toDirection: directionMap[deflection.toDirection]
        }
    }
}