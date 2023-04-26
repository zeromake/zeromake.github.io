---
title: electron 做仅 asar 文件自动更新
date: 2023-04-26 16:10:12 +08:00
tags:
  - electron
  - javascript
  - updater
  - asar
lastmod: 2023-04-26 16:10:12 +08:00
categories:
  - electron
  - javascript
slug: electron-auto-updater-asar
draft: true
---

## 前言

最近公司需要使用 electron 制作一些 gui 工具提供给内部使用，制作完成后发现更新比较繁琐，使用 `electron-updater` 做全量又没有必要，最后选择了仅做 asar 文件自动更新。

<!--more-->

## 一、打包 asar 文件和版本信息生成

## 二、挂载更新文件到内网

## 三、electron 的更新流程

## 四、electron 的下载文件，并支持 gzip 解压

## 五、electron win32 和其它平台的 asar 文件替换处理

## 六、electron 替换触发点

## 后语

仅 `asar` 文件更新，作为一个比较合适的 `electron` 更新方案，但是却被社区大多数人所拒绝，我找到的开源代码均已不可使用，这里把我所用的方案和代码分享给大家。

## 参考

- [electron-asar-hot-updater](https://github.com/yansenlei/electron-asar-hot-updater/blob/master/README-CN.md): 第三方依赖比较复杂，还需要依赖一个 `.net` 编译的 exe。
- [electron-asar-autoupdate](https://github.com/Milesssssss/electron-asar-autoupdate): 年久失修 vbs 脚本已经无法执行，下载文件比较粗暴，没有使用 Stream 不支持 gzip，我自己的 updater 代码结构参考这个。
