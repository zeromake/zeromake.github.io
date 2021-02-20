---
title: 给 caddy1 的代理支持跨域能力
date: 2021-02-20 18:18:00+08:00
tags:
  - caddy
  - go
  - cors
  - http
lastmod: 2021-02-20 18:18:00+08:00
categories:
  - caddy
  - go
slug: caddy_proxy_cors
draft: true
---

## 前言

- 最近 `gitalk` 的默认 `GitHub` 的 `access_token` 代理开始报 403 错误了。
- 可以看 [issues](https://github.com/Rob--W/cors-anywhere/issues/301) 了解具体原因。
- 那么我就在想能不能用我 `vps` 的自行部署一个呢，然后才发现我用的 `caddy1` 并没有代理并支持跨域的能力。

<!--more-->

## 一、caddy 的配置文件解析器

## 二、caddy 的插件编写

## 三、caddy 的 http.proxy 的插件修改支持跨域

## 四、caddy 的配置文件解析器的修复与修改
