import ApiClient from "../network/apiClient";

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
}