export default class ApiClient {

    static BASE_DOMAIN = '192.168.2.141';
    static BASE_PORT = '8080';

    private static baseUrl = `http://${this.BASE_DOMAIN}:${this.BASE_PORT}`;

    static accessToken = "";

    static get(urlPath: string, params: { [key: string]: any } = {}) {
        let urlEncoded = urlPath;

        Object.keys(params).forEach((key, idx) => {
            if (idx === 0) urlEncoded += '?';
            urlEncoded += `${key}=${params[key]}`;
        })

        return fetch(this.baseUrl + urlEncoded, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
            }
        })
    }

    static put(urlPath: string, body: { [key: string]: any } = {}) {
        return fetch(this.baseUrl + urlPath, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify(body)
        })
    }

    static post(urlPath: string, body: { [key: string]: any } = {}) {
        return fetch(this.baseUrl + urlPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify(body)
        })
    }
}