---
title: Starlark使用
date: 2020-06-11 15:53:00+08:00
type: go
tags: [go, python, script, vm, starlark]
last_date: 2020-06-11 15:53:00+08:00
private: true
---

## 前言

最近需要在 `Golang` 里嵌入一个脚本语言，现在对于 `Golang` 来说比较成熟的有 `python`, `javascript`, `lua` 的第三方作为内嵌脚本执行引擎。

其中我使用了 `starlark` 主要是大部分兼容 `python` 语法，并且比起其他的脚本实现它实际上是没有 `vm` 的更加的轻量。

<!--more-->

## 一、最小化运行

## 二、load 和 print 设置

## 三、module 注入

## 四、回调支持

## 五、抛出错误支持

## 六、第三方模块

## 参考

- [starlark官方仓库](https://github.com/google/starlark-go)
- [spec](https://github.com/google/starlark-go/blob/master/doc/spec.md)
- [starlib](https://github.com/qri-io/starlib)
