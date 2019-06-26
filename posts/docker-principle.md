---

title: docker 原理
date: 2019-06-26 10:21:06+08:00
type: docker
tags: [docker, principle, linux]
last_date: 2019-06-26 10:21:06+08:00
...

## 一、前言

-   前段时间使用 `docker` 的 `api` 制作了一个 [docker-debug](https://github.com/zeromake/docker-debug)。
-   其中了解不少 `docker` 的实现原理，这次希望能书写一份比较完整的 `docker` 原理实现用来整理知识和备忘。

<!--more-->

## 二、docker 为什么只能在 linux 上使用

## 三、进程和 ipc 隔离原理

## 四、文件系统隔离原理

## 五、网络隔离原理

## 六、资源限制原理

## 七、后语

-   以上只是 `docker` 做到环境隔离和资源控制的原理。
-   要真正的作为一个 `docker` 必不可少的还有我们经常见到的 `docker image`。
-   但是感觉当前文章已经足够长，考虑放到下一篇博文去。
