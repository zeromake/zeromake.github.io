import { createApp } from './app.js'

const isDev = process.env.NODE_ENV !== 'production'

export default context => {
    return new Promise((resolve, reject) => {
        const s = isDev && Date.now()
        const { app, router, store } = createApp(context)
        const { url } = context
        const fullPath = router.resolve(url).route.fullPath
        if (fullPath !== url) {
            return reject({ status: 302, message: `"${fullPath}" !== "${url}"`, fullPath: fullPath })
        }
        router.push(url)
        router.onReady(() => {
            const matchedComponents = router.getMatchedComponents()
            if (!matchedComponents.length) {
                return reject({ code: 404 })
            }
            Promise.all(matchedComponents.map(({ asyncData }) => {
                return asyncData && asyncData({
                    store,
                    route: router.currentRoute
                })
            })).then(() => {
                isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`)
                context.state = store.state
                resolve(app)
            }).catch(reject)
        }, reject)
    })
}
