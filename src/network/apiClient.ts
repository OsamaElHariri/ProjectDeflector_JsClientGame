export default class ApiClient {

    private static baseUrl = 'http://192.168.2.141:8080';

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