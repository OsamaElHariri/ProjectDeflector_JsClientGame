import ApiClient from "../network/apiClient";
import { AddPawn } from "../network/types";
import { Pawn, PawnVariant, ScoreBoard } from "../types/types";
import { Deflection, Game, MatchPointPlayers, PlayerVariants } from "./types";

export default class GameService {

    async getColors(playerId: string) {
        const res = await (new ApiClient).get(`/game/colors/${playerId}`);
        const json = await res.json();

        return {
            colors: json.colors
        };
    }

    async postColor(playerId: string, color: string) {
        const res = await (new ApiClient).post(`/game/color`, {
            playerId,
            color
        });
        const json = await res.json();

        return {
            color: json.color
        };
    }

    async findSolo(playerId: string) {
        const res = await (new ApiClient).post(`/match/solo`, {
            playerId
        });
        const json = await res.json();

        return json;
    }

    async getGame(gameId: string): Promise<Game> {
        const res = await (new ApiClient).get(`/game/game/${gameId}`);
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

    async addPawn(req: { gameId: string, x: number, y: number, playerSide: string })
        : Promise<AddPawn> {

        const res = await (new ApiClient).post(`/game/pawn`, req);
        const json = await res.json();
        Object.keys(json.variants).forEach(playerId => {
            json.variants[playerId] = json.variants[playerId].map((v: string) => v.toUpperCase() as PawnVariant);
        });
        return {
            ...json,
            deflections: json.deflections.map(this.parseDeflection),
            newPawn: this.parsePawn(json.newPawn),
        };
    }

    async endTurn(req: { gameId: string, playerSide: string })
        : Promise<{
            scoreBoard: ScoreBoard,
            variants: PlayerVariants,
            playerTurn: string,
            allDeflections: Deflection[][],
            winner: string,
            matchPointPlayers: MatchPointPlayers,
            deflections: Deflection[],
        }> {

        const res = await (new ApiClient).post(`/game/turn`, req);
        const json = await res.json();
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

    async shuffle(req: { gameId: string, x: number, y: number, hasPeek: boolean, playerSide: string })
        : Promise<{
            hasPeek: boolean,
            variants: PlayerVariants,
            newPawn: Pawn
            deflections: Deflection[]
        }> {

        const res = await (new ApiClient).post(`/game/shuffle`, req);
        const json = await res.json();
        Object.keys(json.variants).forEach(playerId => {
            json.variants[playerId] = json.variants[playerId].map((v: string) => v.toUpperCase() as PawnVariant);
        });
        return {
            ...json,
            newPawn: json.newPawn && this.parsePawn(json.newPawn),
            deflections: json.deflections?.map(this.parseDeflection)
        };
    }

    async peek(req: { gameId: string, x: number, y: number, playerSide: string })
        : Promise<{
            newPawn: Pawn
            deflections: Deflection[]
        }> {

        const res = await (new ApiClient).post(`/game/peek`, req);
        const json = await res.json();
        return {
            ...json,
            newPawn: this.parsePawn(json.newPawn),
            deflections: json.deflections.map(this.parseDeflection)
        };
    }

    parsePawn(pawn: any): Pawn {
        return {
            ...pawn,
            name: pawn.name.toUpperCase()
        }
    }

    parseDeflection(deflection: any): Deflection {
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