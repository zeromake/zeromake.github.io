---
title: HTTP2协议解析
date: 2018-08-10 14:05:57+08:00
type: protocol
tags: [protocol, http2]
last_date: 2018-08-10 14:05:57+08:00
...

## 前言

- 最近工作都在做跟 `http2` 协议有关的东西，记录下协议的格式与资料。
- 下篇(~~这篇~~)文章中会简略的写出一个支持高并发的 `golang` 的 `http2` 转发器。

## 一、tcp 数据头特征

## 二、Frame 类型以及用途

## 三、Frame 格式解析

## 四、HTTP2 的第一次消息握手

## 五、普通的一次 HTTP2 请求过程

## 五、Frame.StreamID 是怎么完成 HTTP2 的多路复用功能

## 六、hpack 压缩 Header

## 七、分段 Header

## 八、HTTP2 中的 body 发送模式

