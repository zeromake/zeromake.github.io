---
title: go 的自动反射 http rpc 调用
date: 2021-01-02 13:32:53+08:00
tags:
  - reflect
  - rpc
  - http
lastmod: 2021-01-02 13:32:53+08:00
categories:
  - go
slug: go-reflect-rpc
draft: true
---

## 前言

1. 很久没有写博文了，想了一下还是写一篇博文水一下吧。
2. 现在公司项目里使用反射自动注册 `http.HandlerFun` 这样能自动映射路由、参数、响应、以及不同的中间件调用。
3. 比较接近的开源项目有 [pingcap/fn](https://github.com/pingcap/fn) 也是使用反射去自动映射参数、响应、错误的。

## 一、反射映射各种自动化的原理

首先来个公司内部的自动 rpc 的一些示例和所做到的事，`pingcap/fn` 几乎相同但是属于弱化版，不带路由挂载。

``` go
type Instance struct {}

// POST /objects/delete
func (p *Instance) PostObjectsDelete(env *env.Env, args *DeleteArgs) (*DeleteResult, error) {
    // env 主要是声明改方法为需要认证，里面包含了 req 和 resp 的对象。
    // args 自动从 body 解析的结果，会根据结果类型自动映射例如 formdata json
    // 返回的结构体或者结构体指针会自动 json.Marshal 到响应里。
    // 错误也类似
    return nil, nil
}

// POST /objects/create
func (p *Instance) PostObjectsCreate(env *rpcutil.Env, args *CreateArgs) (*CreateResult, error) {
    // 不同的 env 包代表的不同的中间检查，rpcutil.Env 代表着无需认证。
    return nil, nil
}

func main() {
    var instance = &Instance{}
    // 声明路由前缀
    router := &restrpc.Router{
        PatternPrefix: "v1",
    }
    // 自动扫描所有方法，自动挂载 Get, Post, Put, Delete 开头的方法到路由上。
    mux := router.Register(instance)
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

以上的方式在 `java` 里比较常见，而且比起 `golang` 需要自行声明类型的方式切换 `java` 只需要一个注解就可以了。

然后我们描述一下以上的实现方式。

1. 获取到结构体指针，遍历结构体实现的方法，记录下方法名字来注册路由。
2. 对应于每个路由的方法调用，根据方法的类型反射解出结果和参数然后直接把 `request` 转换并实例化这些参数并调用。
3. 响应就更简单了，直接序列化到响应即可。


## 二、各类的反射实现的 http 映射对比表

> 准备了一份能找到的自动映射参数或着路由的库的功能对比表，有些功能则是我自己需要的。

| 功能 | 公司内部rpc | pingcap/fn | 说明 |
| ----|------------|------------|-----|
| body json 参数映射 | ✅ | ✅ | body 为 json 字符串的自动解析 |
| 其它格式的 body 参数映射 | ✅ | ❌ | body 为 xml form data 的自动解析 |
| url query 参数映射 | ✅ | ❌ | GET 的 url 参数 |
| 函数路由映射 | ✅ | ❌ | 自动的路由 handle 挂载 |
| 路由参数映射 | ✅ | ❌ | 常见的路由应用场景 /xxx/:id |
| 插件支持 | ❌ | ✅ | 只有 fn 有 handle 前的插件注入 |
| 根据不同参数切换逻辑 | ❌ | ✅ | 支持都不完善 |
| 中间件支持 | ❌ | ❌ | 主要是需要控制顺序 |
| 响应自定义 | ✅ | ✅ | 都支持不使用默认的响应方式 |
| 响应自定义复用 | ❌ | ❌ | 但是无法复用例如声明一个特殊格式来支持 |


## 三、核心库设计

为了让我自己的 rpc 自动映射库更加有扩展性，决定与先拆出一个核心库，功能如下。

1. 自动反射遍历所有方法，通过适配的接口器去做路由工作。
2. 中间件支持和参数中间件，响应中间件支持。




## 四、http, websocket 库设计

## 五、rpc 库设计

## 参考

