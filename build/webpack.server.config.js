const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const BuildConfig = require('./webpack.base.config')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

module.exports = merge(BuildConfig(false), {
    target: 'node',
    devtool: 'source-map',
    entry: './src/server-entry.js',
    output: {
        filename: 'server-bundle.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        alias: {
            'create-api': './create-api-server.js'
        }
    },
    externals: nodeExternals({
        whitelist: [/\.(css|stylus|styl)$/]
    }),
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"server"'
        }),
        new VueSSRServerPlugin()
    ]
})
