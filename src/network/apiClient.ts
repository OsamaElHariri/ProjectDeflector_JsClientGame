export default class ApiClient {

    private baseUrl = 'http://192.168.2.141:8080';

    get(urlPath: string, params: { [key: string]: any } = {}) {
        let urlEncoded = urlPath;

        Object.keys(params).forEach((key, idx) => {
            if (idx === 0) urlEncoded += '?';
            urlEncoded += `${key}=${params[key]}`;
        })

        return fetch(this.baseUrl + urlEncoded)
    }

    post(urlPath: string, body: { [key: string]: any } = {}) {
        return fetch(this.baseUrl + urlPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
    }
}