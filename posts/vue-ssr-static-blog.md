title: vue-ssr-static-blog
date: 2017-06-01 14:37:39
tags: [vue, static, blog, ssr]
last_date: 2017-06-01 14:37:39

[TOC]
## 前言
- 自上次博文又快过去一个月了，感觉之前想写的东西现在写了也没什么意义。
- 这回来说下我博客改造成`vue`服务端渲染并且生成静态`html`
- 这样就可以放到github-pages上了。
## 一、基础框架
我使用的模板来自官方[demo](https://github.com/vuejs/vue-hackernews-2.0)的[修改版](https://github.com/zeromake/my-vue-hackernews)，vue-hackernews自带很多功能，比如`pwa`。
我的修改版只是把`express`换成了`koa`,并且添加了一个生成静态页面的功能。

