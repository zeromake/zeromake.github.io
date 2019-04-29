---
title: vue-ssr-static-blog
date: 2017-06-01 14:37:39+08:00
type: vue
tags: [vue, static, blog, ssr]
last_date: 2017-06-22 14:37:39+08:00
...

## 前言
- 自上次博文又快过去一个月了，感觉之前想写的东西现在写了也没什么意义。
- 这回来说下我博客改造成`vue`服务端渲染并且生成静态`html`
- 这样就可以放到github-pages上了。
<!--more-->
## 一、基础框架
我使用的模板来自官方[demo](https://github.com/vuejs/vue-hackernews-2.0)的[修改版](https://github.com/zeromake/my-vue-hackernews)，vue-hackernews自带很多功能，比如`pwa`。
我的修改版只是把`express`换成了`koa`,并且添加了一个生成静态页面的功能。

## 二、blog数据api化
### 1. 思路
我的`blog`之前是用的`hexo`的格式写的`markdown`具体格式是
```
title: vue-ssr-static-blog
date: 2017-06-01 14:37:39//yaml object
//通过一个空白换行进行分割
[TOC]//markdown
```
所以正常方式就是按行分割，并按顺序遍历在遇到一个空白行时之前的就是`yaml`之后的就是`markdown`正文。
### 2.代码实现
``` javascript
// node require
const readline = require('readline')
const path = require('path')
const fs = require('fs')
// npm require
const yaml = require('js-yaml')
/**
* 读取yaml,markdown的混合文件
* @param {String} fileDir - 文件夹
* @param {String} fileName - 文件名
* @param {Number} end - 文件读取截断(可选)
* @returns {Promise.resolve(Object{yaml, markdown})} 返回一个Promise对象
*/
const readMarkdown = function (fileDir, fileName, end) {
    return new Promise(function (resolve, reject) {
        let isYaml = true
        let yamlData = ''
        let markdownData = ''
        const option = end ? { start: 0, end: end } : undefined
        const file = path.join(fileDir, fileName)
        // 设置文件读取截断
        const readableStream = fs.createReadStream(file, option)
        const read = readline.createInterface({ input: readableStream })
        read.on('line', function (line) {
            if (isYaml) {
                if (line === '') {
                    isYaml = false
                    return
                }
                yamlData += line + '\n'
            } else {
                markdownData += line + '\n'
            }
        })
        read.on('close', () => {
            // 把yaml字符串转换为yaml对象
            const yamlObj = yaml.safeLoad(yamlData)
            yamlObj['filename'] = fileName.substring(0, fileName.lastIndexOf('.'))
            resolve({ yaml: yamlObj, markdown: end ? null : markdownData })
        })
    })
}
```
### 3. 单篇blog的api实现
``` javascript
// npm require
const marked = require('marked-zm')
const hljs = require('highlight.js')

router.get('/api/pages/:page.json', convert(function * (ctx, next) {
    const page = ctx.params.page
    if (fs.existsSync(path.join(postDir, page + '.md'))) {
        const { yaml, markdown } = yield readMarkdown(postDir, page + '.md')
        const pageBody = markdown && marked(markdown)
        yaml['body'] = pageBody
        ctx.body = yaml
    } else {
        ctx.status = 404
        ctx.body = '404|Not Blog Page'
    }
}))
```
### 4.所有blog的yaml数据api化
``` javascript
// npm require
const pify = require('pify')

router.get('/api/posts.json', convert(function * (ctx, next) {
    const files = yield pify(fs.readdir)(postDir)
    const yamls = yield Promise.all(files.filter(filename => {
        if (filename.indexOf('.md') > 0) {
            return true
        }
    }).map(filename =>
        readMarkdown(postDir, filename, 300)
            .then(({ yaml }) => Promise.resolve(yaml))
    ))
    yamls.sort((a, b) => b.date - a.date)
    ctx.body = yamls
    // yield pify(fs.readdir)(postDir)
}))
```
## 三、把api整合到server.js
注意上面的api都是注册在路由中间件上所以我只要把路由导出到server.js上即可。
api.js
``` javascript
const KoaRuoter = require('koa-router')

const router = new KoaRuoter()
// ... set api

module.exports = router
```
server.js
``` javascript
const router = require('./api.js')
// ... require
const app = new Koa()
// ... render function
router.get('*', isProd ? render: (ctx, next) => {
    return readyPromise.then(() => render(ctx, next))
})
app.use(router.routes()).use(router.allowedMethods())
```
这样就整合完毕。

## 四、src下的router, store, api修改

### router修改
暂时只有两个页面。
- posts
``` javascript
{ path: '/', component: postsView }
```
- pages
``` javascript
{ path: '/pages/:page', component: () => import('../views/Page') }
```
- scrollBehavior
``` javascript
scrollBehavior: (to, from) => {
    // 排除pages页下的锚点跳转
    if (to.path.indexOf('/pages/') === 0) {
        return
    }
    return { y: 0 }
}
```
### store
- state
``` javascript
{
    activeType: null, // 当前页的类型
    itemsPerPage: 20,
    items: [], // posts页的list_data
    page: {}, // page页的data
    activePage: null // 当前page页的name
}
```
- actions
``` javascript
import {
    fetchPostsByType,
    fetchPage
} from '../api'
export default {
    // 获取post列表数据
    FETCH_LIST_DATA: ({ commit, dispatch, state }, { type }) => {
        commit('SET_ACTIVE_TYPE', { type })
        return fetchPostsByType(type)
            .then(items => commit('SET_ITEMS', { type, items }))
    },
    // 获取博文页数据
    FETCH_PAGE_DATA: ({ commit, state }, { page }) => {
        commit('SET_ACTIVE_PAGE', { page })
        const now = Date.now()
        const activePage = state.page[page]
        if (!activePage || (now - activePage.__lastUpdated > 1000 * 180)) {
            return fetchPage(page)
                .then(pageData => commit('SET_PAGE', { page, pageData }))
        }
    }
}
```
- mutations
``` javascript
import Vue from 'vue'
export default {
    // 设置当前活动list页类型
    SET_ACTIVE_TYPE: (state, { type }) => {
        state.activeType = type
    },
    // 设置list页数据
    SET_ITEMS: (state, { items }) => {
        state.items = items
    },
    // 设置博文数据
    SET_PAGE: (state, { page, pageData }) => {
        Vue.set(state.page, page, pageData)
    },
    // 设置当前活动的博文页id
    SET_ACTIVE_PAGE: (state, { page }) => {
        state.activePage = page
    }
}
```
- getters
```javascript
export default {
    // getters 大多在缓存时使用
    // 获取活动list页数据
    activeItems (state, getters) {
        return state.items
    },
    // 获取活动博文页数据
    activePage (state) {
        return state.page[state.activePage]
    }
}
```
### api 修改
- api-server
``` javascript
// server的api请求工具换成node-fetch并提供统一接口api.$get,api.$post
import fetch from 'node-fetch'
const api = {
    // ...
    '$get': function (url) {
        return fetch(url).then(res => res.json())
    },
    '$post': function (url, data) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
    }
}
```
- api-client
``` javascript
// 提供和client一样的接口
import Axios from 'axios'
const api = {
    // ....
    '$get': function (url) {
        return Axios.get(url).then(res => Promise.resolve(res.data))
    },
    '$post': function (url, data) {
        return Axios.post(url, data).then(res => Promise.resolve(res.data))
    }
}
```

## 五、components 修改

这个就不写详细了普通的vue路由组件而已
记得使用vuex里的数据并且判断如果不是server渲染时
要手动去请求数据设置到vuex上。
``` javascript
export default {
    // ...
    // server时的预获取函数支持Promise对象返回
    asyncData({ store, route }){
        return new Promise()
    },
    // 设置标题
    title(){
        return '标题'
    }
}
```
## 六、静态html及api生成
- build/generate.js
``` javascript
const { generateConfig, port } = require('./config')

function render (url) {
    return new Promise (function (resolve, reject) {
        const handleError = err => {
            // 重定向处理
            if (err.status == 302) {
                render(err.fullPath).then(resolve, reject)
            } else {
                reject(err)
            }
        }
    }
}
// 核心代码，通过co除去回调地狱
const generate = (config) => co(function * () {
    let urls = {}
    const docsPath = config.docsPath
    if (typeof config.urls === 'function') {
        // 执行配置里的urls函数获取该静态化的url
        urls  = yield config.urls(config.baseUrl)
    } else {
        urls = config.urls
    }
    // http静态文件(api)生成
    for (let i = 0, len = urls.staticUrls.length; i < len; i++) {
        const url = urls.staticUrls[i]
        // 处理中文
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
    // ssr html 生成
    for (let i = 0, len = urls.renderUrls.length; i < len; i++) {
        const url = urls.renderUrls[i]
        // 处理中文和/ url处理
        const decode = url === '/' ? '' : decodeURIComponent(url)
        if (!fs.existsSync(`${docsPath}/${decode}`)) {
            yield fse.mkdirs(`${docsPath}/${decode}`)
        }
        const html = yield render(url)
        const minHtml = minify(html, minifyOpt)
        console.info('generate render: ' + decode)
        yield fileSystem.writeFile(`${docsPath}/${decode}/index.html`, minHtml)
    }
    // 生成的vue代码拷贝和静态文件拷贝
    yield fse.copy(resolve('../dist'), `${docsPath}/dist`)
    yield fse.move(`${docsPath}/dist/service-worker.js`, `${docsPath}/service-worker.js`)
    yield fse.copy(resolve('../public'), `${docsPath}/public`)
    yield fse.copy(resolve('../manifest.json'), `${docsPath}/manifest.json`)
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
```
- build/config.js
``` javascript
const fetch = require('node-fetch')
const path = require('path')
module.exports = {
    port: 8089,
    postDir: path.resolve(__dirname, '../posts'),
    generateConfig: {
        baseUrl: 'http://127.0.0.1:8089',
        docsPath: path.resolve(__dirname, '../docs'),
        urls: function (baseUrl) {
            const beforeUrl = '/api/posts.json'
            const staticUrls = [beforeUrl]
            const renderUrls = ['/']
            return fetch(`${baseUrl}${beforeUrl}`)
            .then(res => res.json())
            .then(data => {
                for (let i = 0, len = data.length; i < len; i++) {
                    const element = data[i]
                    renderUrls.push('/pages/' + element.filename)
                    const file_name = '/api/pages/' + element.filename + '.json'
                    staticUrls.push(file_name)
                }
                return Promise.resolve({
                    staticUrls,
                    renderUrls
                })
            })
        }
    }
}
```
## 六、gitment评论
- src/client-entry.js
``` javascript
import Gitment from 'gitment'
import 'gitment/style/default.css'

Vue.prototype.$gitment = Gitment
```
- src/views/Page.vue
``` javascript
export default {
    mounted() {
        const page = this.$route.params.page
        if (this.$gitment) {
            const gitment = new this.$gitment({
                id: page, // 可选。默认为 location.href
                owner: 'zeromake',
                repo: 'zeromake.github.io',
                oauth: {
                    'client_id': '6f4e103c0af2b0629e01',
                    'client_secret': '22f0c21510acbdda03c9067ee3aa2aee0c805c9f'
                }
            })
            gitment.render('container')
        }
    }
}
```
注意如果使用了`vuex-router-sync`静态化后会发生`location.search`和`location.hash`丢失。
因为`window.__INITIAL_STATE__`里的路由信息被静态化后是固定的。
1. 去掉`vuex-router-sync`
2. 手动补全
``` javascript
if (window.__INITIAL_STATE__) {
    let url = location.pathname
    if (location.search) url += location.search
    if (location.hash) url += location.hash
    const nowRoute = router.match(url)
    window.__INITIAL_STATE__.route.query = nowRoute.query
    window.__INITIAL_STATE__.route.hash = nowRoute.hash
    store.replaceState(window.__INITIAL_STATE__)
}
```
## 后记
1. 代码：[vue-ssr-blog](https://github.com/zeromake/zeromake.github.io)
2. 拖了一个月才把这篇博文写完，感觉已经没救了。
3. 然后说下请千万不要学我用`vue-ssr`来做静态博客，实在是意义不大。
4. 下一篇没有想好写什么，要不写下`Promise`，`co`实现？
