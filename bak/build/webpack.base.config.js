const path = require('path')
const vueConfig = require('./vue-loader.config')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const MiniCssExtractPlugin = require("@zeromake/mini-css-extract-plugin");

const isProd = process.env.NODE_ENV === 'production'

module.exports = function BuildConfig(isExtract) {

function buildCss(use) {
    if (isExtract) {
        return [
            MiniCssExtractPlugin.loader,
            ...use
        ]
    }
    return [
        {
            loader: "vue-style-loader"
        },
        ...use
    ]
}

return {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : '#inline-source-map',
    output: {
        path: path.resolve(__dirname, '../dist'),
        publicPath: '/dist/',
        filename: '[name]-[chunkhash].js'
    },
    stats: 'errors-only',
    resolve: {
        alias: {
            'public': path.resolve(__dirname, '../public'),
            'components': path.resolve(__dirname, '../src/components')
        },
        extensions: ['.js', '.vue']
    },
    module: {
        noParse: /es6-promise\.js$/,
        rules: [
            {
                enforce: 'pre',
                use: 'eslint-loader',
                test: /\.(js|vue)$/,
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                    options: vueConfig
                }
            },
            {
                test: /\.m?js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: 'img/[name].[hash:7].[ext]'
                    }
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: 'fonts/[name].[hash:7].[ext]'
                    }
                }
            },
            {
                test: /\.css$/,
                use: buildCss(['css-loader'])
            },
            // {
            //     test: /\.scss$/,
            //     use: buildCss(['css-loader', 'sass-loader'])
            // },
            {
                test: /\.styl(us)?$/,
                use: buildCss(['css-loader', 'stylus-loader'])
            },
            {
                test: /\.json/,
                use: 'json-loader'
            }
        ]
    },
    performance: {
        maxEntrypointSize: 300000,
        hints: isProd ? 'warning' : false
    },
    plugins: isProd
        ? [
            // new webpack.optimize.UglifyJsPlugin({
            //     compress: { warnings: false }
            // }),
            // new webpack.optimize.ModuleConcatenationPlugin(),
            new MiniCssExtractPlugin({
                filename: 'common.[chunkhash].css',
            }),
            new VueLoaderPlugin(),
        ]
        : [
            new VueLoaderPlugin(),
            new FriendlyErrorsPlugin(),
            new MiniCssExtractPlugin({
                filename: 'common.[chunkhash].css',
            })
        ]
}

}

