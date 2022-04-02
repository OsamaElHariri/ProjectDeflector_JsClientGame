import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiClient from "../network/apiClient";
import { Player } from "../types/types";

export default class UserService {

    static async getLocalUuid(): Promise<string | null> {
        const uuid = await AsyncStorage.getItem('uuid');
        return uuid;
    }

    static async storeLocalUuid(uuid: string): Promise<string> {
        await AsyncStorage.setItem('uuid', uuid);
        return uuid;
    }

    static async createNewUser(): Promise<{
        uuid: string
        user: Player
    }> {
        const res = await ApiClient.post(`/users/public/user`);
        const json = await res.json();

        return json;
    }

    static async getAccessToken(uuid: string): Promise<string> {
        const res = await ApiClient.post(`/users/public/access`, {
            uuid
        });
        const json = await res.json();
        return json.token;
    }

    static async getCurrentUser(): Promise<Player> {
        const res = await ApiClient.get(`/users/user`);
        const json = await res.json();
        return json.user;
    }

    static async getUser(playerId: string): Promise<Player> {
        const res = await ApiClient.get(`/users/user/${playerId}`);
        const json = await res.json();
        return json.user;
    }

    static async updateUser(player: Player): Promise<Player> {
        const res = await ApiClient.put(`/users/user`, player);
        const json = await res.json();
        return json.user;
    }

    static async getColorChoice(): Promise<{ colors: string[] }> {
        const res = await ApiClient.get(`/users/colors`);
        const json = await res.json();
        return json;
    }

    static async refreshStats(): Promise<{}> {
        const res = await ApiClient.post(`/game/stats/game`);
        const json = await res.json();
        return json;
    }
}