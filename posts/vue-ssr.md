title: vue-ssr
date: 2017-2-18 13:17:25
tags: [vue, ssr]
last_date: 2017-2-19 18:17:25

[TOC]
## 前言
自从前端技术栈换到 `mvvm` 之类的以后网站的源码查看就只会有一些js了，对于用户是没什么问题但是却对 `seo` 有很大的问题。

因为百度之类的爬虫不会执行js来渲染所以无法得到内容。大部分主流的`mvvm`框架都有了 `ssr(Server Side Rendering)` 意为服务端渲染。
~~不是手游的ssr，好像暴露了什么~~

## 一.ssr的技术选择
- [vue-server-renderer](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer)

> vue官方的服务端渲染包

- [nuxt](https://github.com/nuxt/nuxt.js)

> 使用官方 `vue-server-renderer` 包装后的脚手架工具，极大的简化了 `ssr` 的搭建；

> 但是不仅仅保含 `ssr` 包括了现有的大部分的 `vue` 栈，快速简化了 `vue` 栈项目的搭建；

> 如果不是有特殊需求，直接使用 `nuxt` ，以便节省时间特别是不会英文的童鞋 `nuxt` 官方文档还带支持中文。

## 二.初始化项目
``` shell
yarn init
# node项目初始化
yarn add axios compression cross-env es6-promise \
express lru-cache serialize-javascript vue vue-router \
vuex vuex-router-sync
# 安装运行时包根据顺序解释
# 1.axios - http 请求工具
# 2.compression - express 的 gzip 中间组件
# 3.cross-env - 跨平台环境变量设置工具
# 4.es6-promise - ie9 的 promise 支持
# 5.express - node web 框架
# 6.lru-cache - js 的 lru 缓存
# 7.serialize-javascript - js 对象序列化为 js 代码
# 8.vue - 这个不用说了吧
# 9.vue-router - vue 的前端路由通过 ssr 后有后端路由效果
# 10.vuex - vue 的状态管理工具 ssr 中前后端同步
# 11.vuex-router-sync - 路由同步工具

yarn add autoprefixer buble buble-loader css-loader \
url-loader html-webpack-plugin rimraf stylus \
stylus-loader sw-precache-webpack-plugin vue-loader \
vue-template-compiler webpack webpack-dev-middleware \
webpack-hot-middleware extract-text-webpack-plugin@2.0.0-rc3 --dev
# 开发&&打包时包
# 1.autiprefixer - css 前缀自动生成
# 2.buble - babel 的类似工具以后更换看看会不会有什么影响
# 3.buble-loader - 同上
# 4.css-loader - css 加载器
# 5.url-loader - file-loader 的包装，图片可以以base64导入
# 6.html-webpack-plugin - html 的资源加载生成
# 7.rimraf - 跨平台的删除工具
# 8.stylus - stylus 加载器类似 sass 但是个人不喜欢用 sass 所以用 stylus
# 9.stylus-loader - 同上
# 10.sw-precache-webpack - service-worker 支持
# 11.vue-loader - vue 文件加载器
# 12.vue-template-compiler - template to render
# 13.webpack - 模块打包工具
# 14.webpack-dev-middleware - 监听文件改动
# 15.webpack-hot-middleware - 热更新
# 16.extract-text-webpack-plugin - 独立生成css
```

## 三.项目结构
``` yaml
│  package.json
│  server.js                # server-render
│  yarn.lock
│
├─build
│      setup-dev-server.js      # dev 的热生成
│      vue-loader.config.js     # 独立出 vue-loader 配置以便根据环境改变
│      webpack.base.config.js   # 基础 webpack 配置
│      webpack.client.config.js # 打包 client 的配置
│      webpack.server.config.js # 打包 server 的配置
│
├─public                        # 一些静态资源
└─src
    │  app.js                   # 整合 router,filters,vuex 的入口文件
    │  App.vue                  # 顶级 vue 组件
    │  client-entry.js          # client 的入口文件
    │  index.template.html      # html 模板
    │  server-entry.js          # server 的入口文件
    │
    ├─components
    │      Item.vue             # 抽取出List中的每个项
    │      ItemList.vue         # List 的 vue 组件
    │      Spinner.vue          # 加载提示
    │
    ├─filters
    │      index.js             # filters
    │
    ├─router
    │      index.js             # router config
    │
    ├─store
    │      api.js               # 数据请求方式
    │      create-api-client.js # client 数据请求对象的设置
    │      create-api-server.js # server 数据请求对象的设置
    │      index.js             # vuex 的各种配置
    │
    └─views
            CreateListView.js   # 包装 component 支持 preFetch
```

## 四.部分代码分析
> 我将根据依赖关系来一个个说明,npm包不说明

### 1. server.js(就说点重点代码)
> require: ['build/setup-dev-server.js']
``` javascript
// [L16-L48]
let indexHTML
let renderer
if (isProd) {
    // 生产环境直接读取build生成的文件
    renderer = createRenderer(fs.readFileSync(resolve('./dist/server-bundle.js'), 'utf-8'))
    indexHTML = parseIndex(fs.readFileSync(resolve('./dist/index.html'), 'utf-8'))
} else {
    // 开发环境下使用dev-server来通过回调把生成在内存中的文件赋值
    require('./build/setup-dev-server')(app, {
        bundleUpdated: bundle => {
            renderer = createRenderer(bundle)
        },
        indexUpdated: index => {
            indexHTML = parseIndex(index)
        }
    })
}
// 不论生产还是开发环境把server-bundle.js设置到vue-server-renderer获得Renderer装换器对象
function createRenderer (bundle) {
    return require('vue-server-renderer').createBundleRenderer(bundle, {
        cache: require('lru-cache')({
            max: 1000,
            maxAge: 1000 * 60 * 15
        })
    })
}
// 通过目标预设的字符串分割出头部和尾部
function parseIndex (template) {
    const contentMarker = '<!-- APP -->'
    const i = template.indexOf(contentMarker)
    return {
        head: template.slice(0, i),
        tail: template.slice(i + contentMarker.length)
    }
}// [L60-L78]
// 模拟api 
app.use('/api/topstories.json', serve('./public/api/topstories.json'))
app.use('/api/newstories.json', serve('./public/api/newstories.json'))
// 模拟了/api/item/xx.json的接口
app.get('/api/item/:id.json', (req, res, next) => {
    const id = req.params.id
    const time = parseInt(Math.random()*(1487396700-1400000000+1)+1400000000)
    const item = {
        by: "zero" + id,
        descendants: 0,
        id: id,
        score: id - 13664000,
        time: time,
        title: `测试Item:${id} - ${time}`,
        type: 'story',
        url: `/api/item/${id}.json`
    }res.json(item)
})
// [L81-L116]
app.get('*', (req, res) => {
    // 防止异步的renderer对象还未生成
    if (!renderer) {
        return res.end('waiting for compilation.. refresh in a moment.')
    }
    // set header
    res.setHeader("Context-Type", "text/html")
    res.setHeader("Server", serverInfo)
    // 记录时间
    const s = Date.now()
    const context = { url: req.url }
    // 为renderToStream方法传入url，renderToStream会根据url寻找vue-router
    const renderStream = renderer.renderToStream(context)
    // 注册data之前事件把index.html的头部写入res
    renderStream.once('data', () => {
        res.write(indexHTML.head)
    })
    // 注册data中事件直接把ssr的html写出
    renderStream.on('data', chunk => {
        res.write(chunk)
    })
    // 注册end事件把已经挂载到context的vuex的State，
    // 通过`serialize-javascript`序列化成js字面量。
    // 其中挂载到window.__INSTAL_STATE__
    // 并且返回index.html尾部并结束这个请求
    // 最后输出这次ssr的时间
    renderStream.on('end', () => {
        if (context.initialState) {
            res.write(
                `<script>window.__INSTAL_STATE__=${
                    serialize(context.initialState)
                }</script>`
            )
        }
        res.end(indexHTML.tail)
        console.log(`whole request: ${Date.now() - s}ms`)
    })
    // 错误事件
    renderStream.on('error', err => {
        if (err && err.code === '404') {
            res.status(404).end('404 | Page Not Found')
            return
        }
        res.status(500).end('Internal Error 500')
        console.error(`error during render : ${req.url}`)
        console.error(err)
    })
})
```
### 2. build/setup-dev-server.js
> require: ['build/webpack.client.config.js','build/webpack.server.config.js']
``` javascript
// [L24-L37]
    // 在client-webpack转换完成时获取devMiddleware的fileSystem。
    // 读取生成的index.html并通过传入的opt的回调设置到server.js里
    clientCompiler.plugin('done', () => {
        const fs = devMiddleware.fileSystem
        const filePath = path.join(clientConfig.output.path, 'index.html')
        fs.stat(filePath, (err, stats) => {
            if (stats && stats.isFile()){
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    opts.indexUpdated(data)
                })
            } else {
                console.error(err)
            }
        })
    })
// [L41-L52]
    // 通过memory-fs创建一个内存文件系统对象
    const mfs = new MFS()
    const outputPath = path.join(serverConfig.output.path, serverConfig.output.filename)
    // 把server-webpack生成的文件重定向到内存中
    serverCompiler.outputFileSystem = mfs
    // 设置文件重新编译监听并通过opt的回调设置到server.js
    serverCompiler.watch({}, (err, stats) => {
        if (err) throw err
        stats = stats.toJson()
        stats.errors.forEach(err => console.error(err))
        stats.warnings.forEach(err => console.warn(err))
        mfs.readFile(outputPath, 'utf-8', (err, data) => {
            opts.bundleUpdated(data)
        })
    })
```
### 3. build/webpack.base.config.js
> require: ['build/vue-loader.config.js'] 
>
> 因为其它webpack配置都依赖这个所以就先说这个
> 
> 其中build/vue-loader.config.js并没有什么对ssr有关的内容就不说明了
> 
> 然后这个配置文件就是很普通的webpack2配置文件满地都是就不说了代码
> 
> entry 默认是client, 对vue-loader做了css插件引入配置对ssr没什么用

### 4. build/webpack.client.config.js
> require: ['build/vue-loader.config.js', 'build/webpack.base.config.js']
> webpack_require: ['src/cilent-entry.js']
> 
> 在resolve的alias设置好api为client的js导入
> 
> 设置好环境变量
> 
> 添加HtmlPlugin来生成index.html
> 
> 剩下的也和ssr无关
 
### 5. bulid/webpack.client.config.js
> require: ['build/webpack.base.config.js']
> webpack_require: ['src/server-entry.js']
``` javascript
module.exports = Object.assign({}, base, {
    // 生成后的运行环境在node
    target: 'node',
    // 关闭map
    devtool: false,
    // 替换到server-entry.js
    entry: './src/server-entry.js',
    // 设置输出文件名与模块导出为commonjs2
    output: Object.assign({}, base.output, {
        filename: 'server-bundle.js',
        libraryTarget: 'commonjs2'
    }),
    // api设置到server的api上
    resolve: {
        alias: Object.assign({}, base.resolve.alias, {
            'create-api': './create-api-server.js'
        })
    },
    // 不打包运行时依赖，后面这个文件在node中运行
    externals: Object.keys(require('../package.json').dependencies),
    // 设置环境变量
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"server"'
        })
    ]
})
```
### 6. src/client-entry.js
> webpack_require: ['src/app.js']
``` javascript
import 'es6-promise/auto'
import { app, store } from './app'
// 第一次进入页面时获取ssr的state替换上
if (window.__INSTAL_STATE__) {
    store.replaceState(window.__INSTAL_STATE__)
}
// 把app直接与ssr的html同步
app.$mount('#app')
// 生产环境优化使用sw缓存
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator){
    navigator.serviceWorker.register('/service-worker.js')
}
```

### 7. src/server-entry.js
> webpack-require: ['src/app.js']
``` javascript
import { app, router, store } from './app'
const isDev = process.env.NODE_ENV !== 'prodution'
// server.js的renderToStream方法会调用这里
export default context => {
    const s = isDev && Date.now()
    // 使用前端路由切换到请求的url
    router.push(context.url)
    // 并获取该路由的所有Component
    const matchedComponents = router.getMatchedComponents()
    // 没有Component说明没有路由匹配
    if (!matchedComponents.length) {
        return Promise.reject({ code: '404' })
    }
    // 使用Promise.all把所有的Component有异步preFetch方法执行
    return Promise.all(matchedComponents.map(component => {
        if (component.preFetch){
            return component.preFetch(store)
        }
    })).then(() => {
        isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`)
        // 把vuex的state设置到传入的context.initialState上
        context.initialState = store.state
        // 返回已经设置好state, router的app
        return app
    })
}
```

### 8. src/app.js
> webpack-require: ['src/App.vue', 'src/store/index.js', 'src/router/index.js']
``` javascript
const app = new Vue({
    router,
    store,
    // 把App.vue的所有对象属性设置到新的根vue上
    ...App
})
// 导出app,router,store给ssr使用
export { app, router, store }
```

### 9. src/store/index.js
> webpack-require: ['src/store/api.js']
> 没有什么有ssr有关的东西，只是api请求都在api.js

### 10. src/store/api.js
> webpack-require: ['src/store/create-api-(client|server).js']
``` javascript
// [L15-L29]
function fetch (child) {
    const cache = api.cachedItems
    // 优化可不做
    if (cache && cache.has(child)) {
        return Promise.resolve(cache.get(child))
    } else {
        // 获取api数据并设置最后更新时间
        return new Promise((resolve, reject) => {
            Axios.get(api.url + child + '.json').then(res => {
                const val = res.data
                if (val) val.__lastUpdate = Date.now()
                cache && cache.set(child, val)
                resolve(val)
            }).catch(reject)
        })
    }
}
// [L51-L75]
export function watchList (type, cb) {
    let first = true
    let isOn = true
    let timeoutId = null
    const handler = res => {
        cb(res.data)
    }
    // 创建一个无限的定时循环来请求数据
    function watchTimeout() {
        if (first) {
            first = false
        } else {
            Axios.get(`${api.url}${type}stories.json`).then(handler)
        }
        if (isOn){
            timeoutId = setTimeout(watchTimeout, 1000 * 60 * 15)
        }
    }
    watchTimeout()
    // 返回一个结束无限定时循环的函数
    return () => {
        isOn = false
        if (timeoutId){
            clearTimeout(timeoutId)
        }
    }
}
```

### 11. src/views/CreateListView.js
> webpack-require: ['src/components/ItemList.vue']
> src/router/index.js没有什么有和ssr有关的直接来到这里
```
// 导出的方法通过参数来重新包装component,
// preFetch则是保证ssr时component的data里数据已经完成异步获取。
// 如果没有preFetch而是通过vue的生命周期来异步设置则data不会有ssr效果
export function createListView (type) {
    return {
        name: `${type}-stories-view`,
        preFetch (store) {
            return store.dispatch('FETCH_LIST_DATA', { type })
        },
        render (h) {
            return h(ItemList, { props: { type } })
        }
    }
}
```

### 12. src/components/ItemList.vue
``` javascript
// [L60-L30]
    // 在判断root已经挂载说明是路由跳转重新调用loadItems
    beforeMount () {
        if (this.$root._isMounted) {
            this.loadItems(this.page)
        }
// [L80-L94]
        // 触发vuex设置的动作来请求数据
        loadItems (to=this.page, from=-1) {
            this.loading = true
            this.$store.dispatch('FETCH_LIST_DATA', {
                type: this.type
            }).then(() => {
                if (this.page < 0 || this.page > this.maxPage) {
                    this.$router.replace(`/${this.type}/1`)
                    return
                }
                this.transition = from === -1 ? null : to > from ? 'slide-left' : 'slide-right'
                this.displayedPage = to 
                this.displayedItems = this.$store.getters.activeItems
                this.loading = false
            })
        },
```
## 五.文字流程说明
- node server.js : 设置路由所有请求通过ssr生成器
- server.js -> setup-dev-server.js : dev时生成index.html和server-bundle.js
- setup-dev-server.js -> (server|client)-entry.js : 通过webpack对入口文件生成
- client-entry.js : 挂载ssr的vuex的state
- server-entry.js : 通过url来preFetch设置vuex的state
- component: 需要有preFetch来获取异步数据

## 六.源码
[源码这里](https://github.com/zeromake/my-vue-hackernews/tree/ssr-demo)

