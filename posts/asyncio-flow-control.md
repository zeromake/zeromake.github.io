---
title: asyncio的流量控制
date: 2018-05-23 15:58:00+08:00
type: asyncio
tags: [asyncio, python3]
last_date: 2018-05-23 15:58:00+08:00
...

## 前言

- 最近在研究 `asyncio` ，了解到对 `socket` 的操作以后发现读取数据与写入数据有着完全的不同。
- 然后发现了 `asyncio` 有着一套 `Flow control callbacks` 来控制读取写入。


## 一、发送数据的流量控制



## 参考

1. [asyncio-protocol](https://docs.python.org/3/library/asyncio-protocol.htm)
2. [asyncio-stream](https://docs.python.org/3/library/asyncio-stream.html)
3. [uvicorn](https://github.com/encode/uvicorn)
4. [sanic](https://github.com/channelcat/sanic)
5. [quart](https://gitlab.com/pgjones/quart)
