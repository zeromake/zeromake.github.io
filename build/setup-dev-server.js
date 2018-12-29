const path = require('path')
const webpack = require('webpack')
const MFS = require('memory-fs')
const clientConfig = require('./webpack.client.config')
const serverConfig = require('./webpack.server.config')
const chokidar = require('chokidar')
const { koaDevMiddleware, koaHotMiddleware } = require('koa-webpack-middleware-zm')

const readFile = (fs, file) => {
    try {
        return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf8')
    } catch (err) {}
}

module.exports = function setupDevServer (app, cb) {
    let bundle
    let clientManifest
    let resolve
    let resolved = false
    const readyPromise = new Promise(r => { resolve = r })
    const ready = (...args) => {
        resolve()
        cb(...args)
    }

    clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
    clientConfig.output.filename = '[name].js'
    clientConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
// , (err, stats) => {
//         console.log('!>watch')
//         if (stats && stats.compilation && (stats.compilation.errors || stats.compilation.warnings) && (stats.compilation.errors.length > 0 || stats.compilation.warnings.length > 0)) {
//             console.log(require('format-webpack-stats-errors-warnings')(stats, path.resolve(__dirname, '../')))
//         }
//         console.log('!>compiler')
//     })
    // dev middlemare
    const clientCompiler = webpack(clientConfig);
    const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
        publicPath: clientConfig.output.publicPath,
        stats: {
            colors: true,
            chunks: false
        }
    })
    app.use(koaDevMiddleware(devMiddleware))
    clientCompiler.hooks.done.tapPromise('ssr done', (stats) => {
        console.log('!>watch')
        if (stats && stats.compilation && (stats.compilation.errors || stats.compilation.warnings) && (stats.compilation.errors.length > 0 || stats.compilation.warnings.length > 0)) {
            console.error(require('format-webpack-stats-errors-warnings')(stats, path.resolve(__dirname, '../')))
        }
        console.log('!>compiler')
        if(stats.hasErrors()) {
            return Promise.resolve();
        }
        const fs = devMiddleware.fileSystem
        clientManifest = JSON.parse(readFile(fs, 'vue-ssr-client-manifest.json'))
        if (bundle) {
            ready(bundle, { clientManifest })
        }
        return Promise.resolve();
    });
    // devMiddleware.waitUntilValid((stats) => {
    //     const fs = devMiddleware.fileSystem
    //     console.log('!>watch')
    //     if (stats && stats.compilation && (stats.compilation.errors || stats.compilation.warnings) && (stats.compilation.errors.length > 0 || stats.compilation.warnings.length > 0)) {
    //         console.log(require('format-webpack-stats-errors-warnings')(stats, path.resolve(__dirname, '../')))
    //     }
    //     console.log('!>compiler')
    //     if(stats.hasErrors()) {
    //         return Promise.resolve();
    //     }
    //     clientManifest = JSON.parse(readFile(fs, 'vue-ssr-client-manifest.json'))
    //     if (bundle) {
    //         ready(bundle, { clientManifest })
    //     }
    //     return Promise.resolve();
    // })
    const expressHotMiddleware = require('webpack-hot-middleware')(clientCompiler, {
        heartbeat: 5000,
        noInfo: true,
        quiet: true,
    })
    app.use(koaHotMiddleware(expressHotMiddleware))

    const serverCompiler = webpack(serverConfig)
    const mfs = new MFS()
    serverCompiler.outputFileSystem = mfs
    serverCompiler.watch({}, (err, stats) => {
        if (err) throw err
        stats = stats.toJson()
        bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json'))
        if (clientManifest) {
            ready(bundle, { clientManifest })
        }
    })
    return readyPromise
}
