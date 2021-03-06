import LRU from 'lru-cache'
import fetch from 'cross-fetch'

const isProduction = process.env.NODE_ENV === 'production'
export function createAPI ({ config, version }) {
    let api
    if (process.__API__) {
        api = process.__API__
    } else {
        api = {
            // url: 'https://hacker-news.firebaseio.com/v0/',
            url: `${config.url}/api/`,
            onServer: true,
            cachedItems: new LRU({
                max: 1000,
                maxAge: isProduction ? 1000 * 60 * 15 : 100
            }),
            cachedIds: {},
            '$get': function (url) {
                return fetch(url).then(res => res.json())
            },
            '$post': function (url, data) {
                return fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: JSON.stringify(data)
                }).then(res => res.json())
            }
        }
        process.__API__ = api
    }
    return api
}
