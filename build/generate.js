const fs = require('fs')
const fse = require('fs-extra')
const pify = require('pify')
const path = require('path')
const Koa = require('koa')
const { createBundleRenderer } = require('vue-server-renderer')
const LRU = require('lru-cache')
const fetch = require('node-fetch')
const router = require('./api.js')
const { generateConfig, port } = require('./config')

process.on('unhandledRejection', (reason, promise) => {
    console.error(reason, promise)
})

const fileSystem = {
    readFile: pify(fs.readFile),
    mkdir: pify(fs.mkdir),
    writeFile: pify(fs.writeFile),
    unlink: pify(fs.unlink)
}

const resolve = file => path.resolve(__dirname, file)
const isProd = process.env.NODE_ENV === 'production'
const app = new Koa()

function createRenderer (bundle, options) {
    return createBundleRenderer(
        bundle,
        Object.assign(options, {
            template,
            cache: new LRU({
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

async function generate(config) {
    let urls = {}
    const docsPath = config.docsPath
    if (typeof config.urls === 'function') {
        urls  = await config.urls(config.baseUrl)
    } else {
        urls = config.urls
    }
    for (let i = 0, len = urls.staticUrls.length; i < len; i++) {
        const url = urls.staticUrls[i]
        const decode = decodeURIComponent(url)
        const lastIndex = decode.lastIndexOf('/')
        const dirPath = decode.substring(0, lastIndex)
        if (!fs.existsSync(`${docsPath}${dirPath}`)) {
            await fse.mkdirs(`${docsPath}${dirPath}`)
        }
        const res = await fetch(`${config.baseUrl}${url}`).then(res => res.text())
        console.info('generate static file: ' + decode)
        await fileSystem.writeFile(`${docsPath}${decode}`, res)
    }
    for (let i = 0, len = urls.renderUrls.length; i < len; i++) {
        const url = urls.renderUrls[i]
        const decode = url === '/' ? '' : decodeURIComponent(url)
        if (!fs.existsSync(`${docsPath}/${decode}`)) {
            await fse.mkdirs(`${docsPath}/${decode}`)
        }
        let html = await render(url)
        console.info('generate render: ' + decode)
        await fileSystem.writeFile(`${docsPath}/${decode}/index.html`, html)
    }
    await fse.copy(resolve('../dist/'), `${docsPath}/dist`)
    await fse.move(`${docsPath}/dist/service-worker.js`, `${docsPath}/service-worker.js`)
    await fse.copy(resolve('../public'), `${docsPath}/public`)
    await fse.copy(resolve('../manifest.json'), `${docsPath}/manifest.json`)
    await fse.copy(resolve('../baidu-verify-03770132C2.txt'), `${docsPath}/baidu-verify-03770132C2.txt`)
    await fse.copy(resolve('../googled4005bfa29260c00.html'), `${docsPath}/googled4005bfa29260c00.html`)
}

const listens = app.listen(port, '0.0.0.0', () => {
    console.log(`server started at localhost:${port}`)
    const s = Date.now()
    const closeFun = () => {
        listens.close(()=> {
            console.log(`generate: ${Date.now() - s}ms`)
            process.exit(0)
        })
    }
    generate(generateConfig).then(closeFun)
})
