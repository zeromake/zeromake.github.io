const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const BuildConfig = require('./webpack.base.config')
// const SWPrecachePlugin = require('sw-precache-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
// const UglifyJsPlugin = require("uglifyjs-webpack-plugin");


const config = merge(BuildConfig(true), {
    entry: {
        app: './src/client-entry.js'
    },
    resolve: {
        alias: {
            'create-api': './create-api-client.js'
        }
    },
    optimization: {
        runtimeChunk: {
            name: "manifest"
        },
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.(css|styl|stylus|scss|less)$/,
                    chunks: 'all',
                    enforce: true
                },
                vendors: {
                    test: /([\\/]node_modules[\\/].+\.)(js|vue|jsm)$/,
                    chunks: "all",
                    name: "vendor"
                }
            }
        },
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"client"',
            'process.env.DEBUG_API': '"true"'
        }),
        new VueSSRClientPlugin()
    ]
})
if (process.env.NODE_ENV === 'production'){
    const srcDir = path.resolve(__dirname, '../').replace(/\\/g, "\/")
    prefixMulti = {
        [srcDir]: ''
    }
    config.plugins.push(
        new WorkboxPlugin.GenerateSW({
            importWorkboxFrom: 'local',
            cacheId: 'ssr-blog',
            swDest: 'service-worker.js',
            skipWaiting: true,
            clientsClaim: true,
            globPatterns: ['**/*.{html,js,css,png,jpg,woff,woff2}'], // 匹配的文件
            globIgnores: ['service-wroker.js', '*.map', '*.json'], // 忽略的文件
            runtimeCaching: [
                {
                    urlPattern: /\.com\/$/,
                    handler: 'NetworkFirst'
                },
                {
                    urlPattern: /\.com\/pages\/[\w_-]+$/,
                    handler: 'NetworkFirst'
                }
            ]
        }),
        // new SWPrecachePlugin({
        //     cacheId: 'ssr-blog',
        //     filename: 'service-worker.js',
        //     minify: true,
        //     stripPrefixMulti: prefixMulti,
        //     dontCacheBustUrlsMatching: /./,
        //     staticFileGlobsIgnorePatterns: [/\.map$/, /\.json$/],
        //     runtimeCaching: [
        //         {
        //             urlPattern: '/',
        //             handler: 'networkFirst'
        //         },
        //         {
        //             urlPattern: '/pages/:page/',
        //             handler: 'networkFirst'
        //         }
        //     ]
        // })
    )
}
module.exports = config
