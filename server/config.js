const path = require('path')
const fetch = require('cross-fetch')

const alone = [
    'about',
    'resume',
    'plan'
]

module.exports = {
    port: 8089,
    postDir: path.resolve(__dirname, '../posts'),
    aloneDir: path.resolve(__dirname, '../alone'),
    generateConfig: {
        baseUrl: 'http://127.0.0.1:8089',
        docsPath: path.resolve(__dirname, '../docs'),
        urls(baseUrl) {
            const beforeUrl = '/api/posts.json'
            const staticUrls = [beforeUrl]
            const renderUrls = ['/']
            return fetch(`${baseUrl}${beforeUrl}`)
                .then(res => res.json())
                .then((listData) => {
                    const data = listData.posts
                    for (let i = 0, len = data.length; i < len; i++) {
                        const element = data[i]
                        renderUrls.push('/pages/' + element.filename)
                        const fileName = '/api/pages/' + element.filename + '.json'
                        staticUrls.push(fileName)
                    }
                    for (const a of alone) {
                        renderUrls.push('/' + a)
                        staticUrls.push('/api/' + a + '.json')
                    }
                    staticUrls.push('/api/atom.xml')
                    return Promise.resolve({
                        staticUrls,
                        renderUrls
                    })
                })
        }
    }
}
