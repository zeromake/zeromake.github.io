const fs = require('fs')
const fse = require('fs-extra')
const co = require('co')
const pify = require('pify')
const path = require('path')
const Koa = require('koa')
const KoaRuoter = require('koa-router')
const { createBundleRenderer } = require('vue-server-renderer')
const LRU = require('lru-cache')
const fetch = require('node-fetch')
const { minify } = require('html-minifier')
const router = require('../api.js')

const fileSystem = {
    readFile: pify(fs.readFile),
    mkdir: pify(fs.mkdir),
    writeFile: pify(fs.writeFile),
    unlink: pify(fs.unlink)
}
const minifyOpt = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    decodeEntities: true,
    minifyCSS: true,
    minifyJS: true,
    processConditionalComments: true,
    removeAttributeQuotes: false,
    removeComments: false,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: false,
    removeStyleLinkTypeAttributes: false,
    removeTagWhitespace: false,
    sortAttributes: true,
    sortClassName: true,
    trimCustomFragments: true,
    useShortDoctype: true
}
const resolve = file => path.resolve(__dirname, file)

const isProd = process.env.NODE_ENV === 'production'

const app = new Koa()

const template = fs.readFileSync(resolve('../src/index.template.html'), 'utf-8')

function createRenderer (bundle, options) {
    return createBundleRenderer(
        bundle,
        Object.assign(options, {
            template,
            cache: LRU({
                max: 1000,
                maxAge: 1000 * 60 * 15
            }),
            basedir: resolve('./dist'),
            runInNewContext: false
        })
    )
}

let renderer
let readyPromise
if (isProd) {
    const bundle = require('../dist/vue-ssr-server-bundle.json')
    const clientManifest = require('../dist/vue-ssr-client-manifest.json')
    renderer = createRenderer(bundle, {
        clientManifest
    })
} else {
    readyPromise = require('./setup-dev-server')(app, (bundle, options) => {
        renderer = createRenderer(bundle, options)
    })
}


// 模拟api
// app.use(serve('/api/topstories.json', './api/topstories.json'))
// app.use(serve('/api/newstories.json', './api/newstories.json'))

function render (url) {
    return new Promise (function (resolve, reject) {
        const s = Date.now()
        const handleError = err => {
            console.log(err)
            reject()
        }
        const context = {
            title: 'Vue Ssr 2.3',
            url: url
        }
        renderer.renderToString(context, (err, html) => {
            if (err) {
                return handleError(err)
            }
            resolve(html)
            if (!isProd) {
                console.log(`whole request-${url}: ${Date.now() - s}ms`)
            }
        })
    })
}
app.use(router.routes()).use(router.allowedMethods())

const port = process.env.PORT || 8089
const docsPath = resolve('../docs')
const listens = app.listen(port, '0.0.0.0', () => {
    console.log(`server started at localhost:${port}`)

    const generate = () => co(function * () {
        const func = render
        const urls = [
            ''
        ]
        const staticUrls = [
            '/api/posts.json'
        ]
        for (let i = 0; i < staticUrls.length; i++) {
            const url = staticUrls[i]
            const lastIndex = url.lastIndexOf('/')
            const dirPath = url.substring(0, lastIndex)
            console.log(docsPath, dirPath)
            if (!fs.existsSync(`${docsPath}${dirPath}`)) {
                yield fse.mkdirs(`${docsPath}${dirPath}`)
            }
            if (!fs.existsSync(`${docsPath}/api/pages`)) {
                yield fse.mkdirs(`${docsPath}/api/pages`)
            }
            const res = yield fetch('http://127.0.0.1:8089'+ url).then(res => res.json())
            for (let i = 0, len = res.length; i < len; i++) {
                const element = res[i]
                urls.push('pages/' + encodeURI(element.filename))
                const file_name = '/api/pages/' + encodeURI(element.filename) + '.json'
                const new_url = 'http://127.0.0.1:8089' + file_name
                const jsonData = yield fetch(new_url).then(res => res.text())
                yield fileSystem.writeFile(`${docsPath}${file_name}`, jsonData)
            }
            yield fileSystem.writeFile(`${docsPath}${url}`, JSON.stringify(res))
        }
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i]
            console.log(url)
            console.log(docsPath)
            if (!fs.existsSync(`${docsPath}/${url}`)) {
                yield fse.mkdirs(`${docsPath}/${url}`)
            }
            const html = yield func(url)
            const minHtml = minify(html, minifyOpt)
            yield fileSystem.writeFile(`${docsPath}/${url}/index.html`, minHtml)
        }
        yield fse.copy(resolve('../dist'), `${docsPath}/dist`)
        yield fse.move(`${docsPath}/dist/service-worker.js`, `${docsPath}/service-worker.js`)
        yield fse.copy(resolve('../public'), `${docsPath}/public`)
        yield fse.copy(resolve('../manifest.json'), `${docsPath}/manifest.json`)
    })
    const s = Date.now()
    const closeFun = () => {
        console.log(`generate: ${Date.now() - s}ms`)
        listens.close(()=> {process.exit(0)})
    }
    if (isProd) {
        generate().then(closeFun)
    } else {
        readyPromise.then(generate).then(closeFun)
    }

})
