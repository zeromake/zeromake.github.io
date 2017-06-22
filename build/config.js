const fetch = require('node-fetch')
const path = require('path')
module.exports = {
    generateConfig: {
        baseUrl: 'http://127.0.0.1:8089',
        docsPath: path.resolve(__dirname, '../docs'),
        urls: function (baseUrl) {
            const beforeUrl = '/api/posts.json'
            const staticUrls = [beforeUrl]
            const renderUrls = ['']
            return fetch(`${baseUrl}${beforeUrl}`)
            .then(res => res.json())
            .then(data => {
                for (let i = 0, len = data.length; i < len; i++) {
                    const element = data[i]
                    renderUrls.push('pages/' + encodeURI(element.filename)) + '.html'
                    const file_name = '/api/pages/' + encodeURI(element.filename) + '.json'
                    staticUrls.push(file_name)
                }
                return Promise.resolve({
                    staticUrls,
                    renderUrls
                })
            })
        }
    }
}