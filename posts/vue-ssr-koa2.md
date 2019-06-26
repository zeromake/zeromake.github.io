---

title: vue-ssr-koa2
date: 2017-2-19 18:36:25+08:00
type: vue
tags: [vue, ssr, koa2]
last_date: 2017-2-19 18:17:25+08:00
...

## 前言

-   在之前的[vue-ssr](http://blog.zeromake.com/pages/vue-ssr)中我是使用 express 来做 ssr 服务器+api 服务器。
-   但是有些时候可能我希望换一个 web 框架。
-   所以就有了这篇闲的慌系类。
-   vue-ssr 中使用 koa2 来替代 express

<!--more-->

## 一.更换依赖包

1. 删掉 express 及它的中间组件 ['compression', 'express', 'serve-favicon']
2. 添加 koa2 及它的一些中间组件 ['koa2', 'koa-router@7.x', 'koa-send']

## 二.修改 server.js

-   [git 修改日志](https://github.com/zeromake/my-vue-hackernews/commit/30a6ae819daee46e0fbddafdb61f7b246a11da50)
-   [git 地址](https://github.com/zeromake/my-vue-hackernews/blob/ssr-demo-koa2/server.js)
-   require: ['./build/serve']

```javascript
// [L3-L5] 替换引入的包
const Koa = require('koa2')
const KoaRuoter = require('koa-router')
const KoaServe = require('./build/serve')
// /build/serve.js 这个是我手写的一个静态文件挂载中间组件

// [L14-L17] 声明创建app和路由对象
const app = new Koa()
const router = new KoaRuoter()
// dev下因为使用原express中间组件，
// 一定要在设置setup-dev-server之前设置api路由。
// 包括普通的静态json文件
const api_router = new KoaRuoter()

// [L20-L44] 更改 serve 函数以便支持koa2，替换原有serve使用的地方
const serve = (url, path, cache) => KoaServe(url, {
    root: resolve(path),
    maxAge: cache && isProd ? 60 * 60 * 24 * 30 : 0
})

// 模拟api
app.use(serve('/api/topstories.json', './public/api/topstories.json'))
app.use(serve('/api/newstories.json', './public/api/newstories.json'))
// 修改为koa支持
api_router.get('/api/item/:id.json', (ctx, next) => {
    const id = ctx.params.id
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

    }
    ctx.body = item
})
app.use(api_router.routes()).use(api_router.allowedMethods())

// [L89-L132]  ssr的处理转换换为koa2
// 原express 调用res.end会通知express结束,
// koa2则需要使用返回一个Promise来达到异步
router.get('*', (ctx, next) => {
    if (!renderer) {
        return ctx.body ='waiting for compilation.. refresh in a moment.'
    }
    ctx.set("Context-Type", "text/html")
    ctx.set("Server", serverInfo)
    const s = Date.now()
    const context = { url: ctx.url }
    const renderStream = renderer.renderToStream(context)
    const res = ctx.res
    return new Promise(function(resolve){
        renderStream.once('data', () => {
            // 不设置这个会默认404
            res.statusCode = 200
            res.write(indexHTML.head)
        })
        renderStream.on('data', chunk => {
            res.write(chunk)
        })
        renderStream.on('end', () => {
            if (context.initialState) {
                res.write(
                    `<script>window.__INSTAL_STATE__=${
                        serialize(context.initialState)
                    }</script>`
                )
            }
            res.end(indexHTML.tail)
            resolve() // 通知koa2异步操作已经结束
            console.log(`whole request: ${Date.now() - s}ms`)
        })
        renderStream.on('error', err => {
            if (err && err.code === '404') {
                res.statusCode = 404
                res.end('404 | Page Not Found')
                resolve() // 通知koa2异步操作已经结束
                return
            }
            res.statusCode = 500
            res.end('Internal Error 500')
            resolve() // 通知koa2异步操作已经结束
            console.error(`error during render : ${ctx.url}`)
            console.error(err)
        })
// [L134] 注册路由
app.use(router.routes()).use(router.allowedMethods())
```

## 三.手写一个用于 koa2 静态文件中间组件 build/serve.js

-   [git 地址](https://github.com/zeromake/my-vue-hackernews/blob/ssr-demo-koa2/build/serve.js)
-   代码不多就都解释下

```javascript
"use strict";
// 使用 koa-send 模块来发送文件
const send = require("koa-send");
// 导出一个参数为url-path + koa-send-opt的函数
module.exports = function serve(path, opt) {
    // 设置了参数后返回一个标准koa2中间组件方法
    return function(ctx, next) {
        const pathUrl = ctx.path;
        // 只有匹配了path且请求方法为 get,head 才进行发送文件
        if (
            (ctx.method == "HEAD" || ctx.method == "GET") &&
            pathUrl.startsWith(path)
        ) {
            let newOpt = null;
            let newPath = null;
            // 处理 path = pathUrl 且结尾不为/的特殊情况
            if (pathUrl === path) {
                if (!path.endsWith("/")) {
                    // 去除root路径中的path文件
                    // 但为未处理url的文件名与真实文件名不同
                    const newRoot = opt.root.slice(0, -path.length);
                    newOpt = Object.assign({}, opt, { root: newRoot });
                    newPath = pathUrl;
                }
            } else {
                // 去除多余的url
                newPath = pathUrl.slice(path.length);
            }
            // 通过 koa-send 发送
            return send(ctx, newPath || "/", newOpt || opt);
        }
        return next();
    };
};
```

## 四.使用现成的 npm 包来修改 build/setup-dev-server.js

-   [git 地址](https://github.com/zeromake/my-vue-hackernews/blob/ssr-demo-koa2/build/setup-dev-server.js)
-   安装`npm i koa2-webpack-middleware-zm -D`

```javascript
// [L6]
const {
    koaDevMiddleware,
    koaHotMiddleware
} = require("koa2-webpack-middleware-zm");
// [L25]
app.use(koaDevMiddleware(devMiddleware));
// [L39-L40]
const expressHotMiddleware = require("webpack-hot-middleware")(clientCompiler);
app.use(koaHotMiddleware(expressHotMiddleware));
```

-   是不是发觉特别简单好吧其实这个 npm 包是我自己写的
-   在下一篇博文再介绍吧，这篇博文代码还是太多

## 五.下篇博文预告

1. 修改博文书写方式，尽量放片段代码加图片文字来说明
2. 代码量多的部分使用 github 的 url 来引用
3. 下篇博文应该是 npm 包制作及 github 集成测试。还有 koa 的中间组件

## 六.源码

[源码在这里](https://github.com/zeromake/my-vue-hackernews/tree/ssr-demo-koa2)
