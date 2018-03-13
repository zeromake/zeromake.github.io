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
const router = require('./api.js')
const { generateConfig, port } = require('./config')

// 

process.on('unhandledRejection', (reason, promise) => {
    console.error(reason, promise)
})

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
const template = fs.readFileSync(resolve('../src/index.template.html'), 'utf-8')
const bundle = require('../dist/vue-ssr-server-bundle.json')
const clientManifest = require('../dist/vue-ssr-client-manifest.json')
let renderer = createRenderer(bundle, {
    clientManifest
})

function render (url) {
    return new Promise (function (resolve, reject) {
        const s = Date.now()
        const handleError = err => {
            if (err.status == 302) {
                render(err.fullPath).then(resolve, reject)
            } else {
                reject(err)
            }
        }
        const context = {
            title: 'zeromake\'blog',
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

const generate = (config) => co(function * () {
    let urls = {}
    const docsPath = config.docsPath
    if (typeof config.urls === 'function') {
        urls  = yield config.urls(config.baseUrl)
    } else {
        urls = config.urls
    }
    for (let i = 0, len = urls.staticUrls.length; i < len; i++) {
        const url = urls.staticUrls[i]
        const decode = decodeURIComponent(url)
        const lastIndex = decode.lastIndexOf('/')
        const dirPath = decode.substring(0, lastIndex)
        if (!fs.existsSync(`${docsPath}${dirPath}`)) {
            yield fse.mkdirs(`${docsPath}${dirPath}`)
        }
        const res = yield fetch(`${config.baseUrl}${url}`).then(res => res.text())
        console.info('generate static file: ' + decode)
        yield fileSystem.writeFile(`${docsPath}${decode}`, res)
    }
    for (let i = 0, len = urls.renderUrls.length; i < len; i++) {
        const url = urls.renderUrls[i]
        const decode = url === '/' ? '' : decodeURIComponent(url)
        if (!fs.existsSync(`${docsPath}/${decode}`)) {
            yield fse.mkdirs(`${docsPath}/${decode}`)
        }
        const html = yield render(url)
        const minHtml = minify(html, minifyOpt)
        console.info('generate render: ' + decode)
        yield fileSystem.writeFile(`${docsPath}/${decode}/index.html`, minHtml)
    }
    yield fse.copy(resolve('../dist/'), `${docsPath}/dist`)
    yield fse.move(`${docsPath}/dist/service-worker.js`, `${docsPath}/service-worker.js`)
    yield fse.copy(resolve('../public'), `${docsPath}/public`)
    yield fse.copy(resolve('../manifest.json'), `${docsPath}/manifest.json`)
    yield fse.copy(resolve('../baidu-verify-03770132C2.txt'), `${docsPath}/baidu-verify-03770132C2.txt`)
})
const listens = app.listen(port, '0.0.0.0', () => {
    console.log(`server started at localhost:${port}`)
    const s = Date.now()
    const closeFun = () => {
        console.log(`generate: ${Date.now() - s}ms`)
        listens.close(()=> {process.exit(0)})
    }
    generate(generateConfig).then(closeFun)
})
