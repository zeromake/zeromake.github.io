import fetch from 'cross-fetch'

export function createAPI ({ config, version }) {
    return {
        // url: 'https://hacker-news.firebaseio.com/v0/'
        url: '/api/',
        '$get': function (url) {
            return fetch(url).then(resp => resp.json());
        },
        '$post': function (url, data) {
            return fetch('/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(data)
            }).then(resp => resp.json());
        }
    }
}
