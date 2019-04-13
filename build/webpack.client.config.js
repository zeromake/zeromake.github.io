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

        // minimizer: [
        //     new UglifyJsPlugin({
        //         cache: true,
        //         parallel: true,
        //         sourceMap: true,
        //         uglifyOptions: {
        //             // 最紧凑的输出
        //             beautify: false,
        //             // 删除所有的注释
        //             comments: false,
        //             // mangle: {
        //             //     safari10: true
        //             // },
        //             compress: {
        //                 // 在UglifyJs删除没有用到的代码时不输出警告
        //                 warnings: false,
        //                 // 删除所有的 `console` 语句，可以兼容ie浏览器
        //                 drop_console: true,
        //                 // 内嵌定义了但是只用到一次的变量
        //                 collapse_vars: true,
        //                 // 提取出出现多次但是没有定义成变量去引用的静态值
        //                 reduce_vars: true,
        //                 // warnings: false,
        //             }
        //         }
        //     })
        // ],
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
            navigateFallback: '/',
            cacheId: 'ssr-blog',
            swDest: 'service-worker.js',
            skipWaiting: true,
            clientsClaim: true,
            globPatterns: ['**/*.{html,js,css,png.jpg}'], // 匹配的文件
            globIgnores: ['service-wroker.js', '*.map', '*.json'], // 忽略的文件
            runtimeCaching: [
                {
                    urlPattern: '/',
                    handler: 'networkFirst'
                },
                {
                    urlPattern: '/pages/:page/',
                    handler: 'networkFirst'
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
