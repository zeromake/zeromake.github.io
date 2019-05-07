---
title: 为koa定制webpack的中间件
date: 2017-03-01 21:33:04+08:00
type: middleware
tags: [node, js, npm]
last_date: 2017-03-05 12:26:04+08:00
...

## 前言
- 在前面的对`vue-ssr`改造为`koa`的`web`框架，我使用了一个第三方npm库。
- 包名为 ~~`koa2-webpack-middleware-zm`~~ 已迁移到`koa-webpack-middleware-zm`。
- 这个包是我自己因为ssr的特殊需求`github`上并没有合适的包。
- 所以自行参考了[koa-webpack-middleware](ttps://github.com/leecade/koa-webpack-middleware)后写出的包。
- 并且修复原有包的一些 bug。
- 这篇博文我将写以下内容

> - koa 中间件的编写。
> - 把`webpack-dev-middleware`这种`express`中间件改造为一个`koa`中间件。

<!--more-->

## 一. koa与express的普通中间件区别。
- npm 包安装
``` shell
npm i koa express -D
```
- koa和express的基本模板。
koa只能用new的方式创建
``` javascript
// koa
const Koa = require('koa')
// ... use code
const KoaApp = new Koa()
KoaApp.listen(8000)
```
express可以用方法调用或new的方式创建
``` javascript
// express
const Express = require('express')
// ... use code
const ExpressApp = Express()
ExpressApp.listen(8080)
```
- 两者的hello。
koa:
``` javascript
// use code
KoaApp.use(function(ctx, next){
    ctx.body = 'hello koa'
})
```
express:
``` javascript
// use code
ExpressApp.use(function(req, res, next){
    res.end('hello exress')
})
```

- express 中间件运行逻辑

> 1. 中间件为一个方法接受 req,res,next 三个参数。
> 2. 中间可以执行任何方法包括异步方法。
> 3. 最后一定要通过`res.end`或者`next`来通知结束这个中间件方法。
> 4. 如果没有执行`res.end`或者`next`访问会一直卡着不动直到超时。
> 5. 并且在这之后的中间件也会没法执行到。

- koa 的中间件运行逻辑

> 1. 中间件为一个方法或者其它，这里就讲方法的，接受`ctx,next`两个参数。
> 2. 方法中可以执行任何同步方法。可以使用返回一个`Promise`来做异步。
> 3. 中间件通过方法结束时的返回来判断是否进入下一个中间件。
> 4. 返回一个`Promise`对象koa会等待异步通知完成。then中可以返回next()来跳转到下一个中间件。
> 5. 相同如果`Promise`没有异步通知也会卡住。

## 二. 异步中间件的区别

- express 异步中间件
``` javascript
ExpressApp.use(function(req, res, next){
    setTimeout(function(){
        res.end('测试')
    }, 0)
})
```
express 的异步就是最普通的回调

- koa 异步中间件
``` javascript
KoaApp.use(function(ctx, next){
    return new Promise(function(resolve, reject) {
        if (ctx.path === '/'){
            ctx.body = 'hello koa'
            resolve()
        } else {
            reject()
        }
    }).catch(next)
})

```
koa 的异步通过`Promise`来做这里我`then`不写代表`resolve`不切换到下一个中间件。
`catch`直接绑定`next`，用`reject`来通知跳转到下一个中间件。

## 三. 修改一个express中间件到koa
- hello-test.js
``` javascript
module.exports = function(req, res, next){
    setTimeout(function(){
        if (req.path === '/'){
            res.end('测试')
        }else{
            next()
        }
    }, 0)
}
```
- express 使用
``` javascript
const test = require('./hello-test.js')
ExpressApp.use(test)
```
- 修改到 koa 使用
``` javascript
const test = require('./hello-test.js')
KoaApp.use(function (ctx, next){
    const res = ctx.res
    const req = ctx.req
    const end = res.end
    return new Promise(function(resolve, reject) {
        res.end = function () {
            end.apply(this, arguments)
            resolve()
        }
        test(res, req, reject)
    }).catch(next)
})
```
通过修改原有的`res.end`运行`resolve`通知`Promise`结束,
修改`next`用`reject`替代通知`Promise`调用`next`。

## 四. 修改express注意事项
1. 原有的`express`组件是通过回调来通知结束的。不要直接`await`或者`yield`一个组件。它们又不是返回一个`Promise`对象。
``` javascript
const test = require('./hello-test.js')
KoaApp.use(function *(next){
    const res = this.res
    const req = this.req
    // 这种写法会导致后面注册的中间件都失效。
    yield test(res, req, next)
})
KoaApp.use(async function (ctx, next){
    const res = ctx.res
    const req = ctx.req
    // 这种写法会导致后面注册的中间件都失效。
    await test(res, req, next)
})

```
2. 只有在`catch`或者是`then`中返回`next()`才能跳转到下一个组件。

## 五. 改造webpack-dev-middleware的例子
[devMiddleware.js](https://github.com/zeromake/koa-webpack-middleware-zm/blob/master/lib/devMiddleware.js)
``` javascript
function koaDevMiddleware(expressDevMiddleware) {
    return function middleware(ctx, next) {
        return new Promise((resolve) => {
            expressDevMiddleware(ctx.req, {
                end: (content) => {
                    ctx.body = content;
                    resolve(false);
                },
                setHeader: (name, value) => {
                    ctx.set(name, value);
                },
            }, () => {
                resolve(true);
            });
        }).then((err) => {
            if (err) { return next(); }
            return null;
        });
    };
}
module.exports = koaDevMiddleware;
```
这是昨天最新的代码当时没想着用`reject`来通知`next`后面大概要改成这样。

## 六. 改造webpack-hot-middleware的例子
[hotMiddleware.js](https://github.com/zeromake/koa-webpack-middleware-zm/blob/master/lib/hotMiddleware.js)
``` javascript
function koaHotMiddleware(expressHotMiddleware) {
    return function middleware(ctx, next) {
        return new Promise((resolve) => {
            expressHotMiddleware(ctx.req, ctx.res, resolve);
        }).then(next);
    };
}
module.exports = koaHotMiddleware;
```
## 七. 例子源码
1. [koa-webpack-middleware-zm](https://github.com/zeromake/koa-webpack-middleware-zm)
2. 欢迎star，issues，fork, pr
3. 下篇写这些内容

> - 在`npm`上发布你的包以共享给其他人使用。
> - 添加测试用例
> - 添加`travis-ci`自动集成测试.
