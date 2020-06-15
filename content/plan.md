---
title: 计划
date: 2019-10-25T01:52:22.000Z
tags:
  - plan
lastmod: 2019-10-26T15:29:49.000Z
categories:
  - plan
slug: plan
draft: false
---

## 前言

- 最近刚好离职了，决定开始进行真正的项目化工程化做事，包括离职总结，书写简历，面试技巧和面试题整理。
- 这个页面专门用来展示需要做的事，先定义一些简单的 `ToDo` 吧。


## 一、离职那些事

- [x] 和公司争取 `n+1`。
- [x] 离职总结。
- [x] 简单的修改一下简历。
- [x] 到一些公司面试查看技术方向。
- [x] 根据以上的技术方向确定后面稳定方向，不要再因为业务性原因换语言了。
- [ ] 对自己的求职开启项目化工程化，并拆分各个子项目进行。

## 二、查漏补缺

- [x] [go-spring](https://github.com/go-spring/go-spring) 学习
- [x] Go 语言的性能测试，和各种性能测试工具的使用
- [ ] 数据库优化，索引创建（级联索引在各种情况下的效果）
- [ ] Go 1.4 到 1.13 的新版特性
- [x] Redis 数据结构
- [ ] 各种语言 GC 的特性
- [ ] 进程，线程，协程的各种语言的区别
- [x] 离开公司的理由
- [x] 为什么做程序员
- [x] 职业规划
- [x] 做哪个项目成就感最高
- [x] 如何适应变化
- [ ] hash 函数
- [ ] hash 表
- [x] 链表环查找
- [x] 链表中间节点查找
- [x] 用英文介绍之前做的项目
- [ ] 数据库主从复制
- [ ] Go channel 实现
- [ ] 微服务的服务发现
- [ ] 微服务的有状态服务(Redis)持久化
- [ ] Redis 除了常见的使用还有哪些能力
- [ ] 微服务如何排查问题
- [ ] 为什么选择 golang， 为什么又从动态语言切换到 golang
- [ ] 今后的目标学习定位 (云原生，分布式)
- [ ] 为什么从之前的公司离职
- [ ] 实现一个 `sync.Map`
- [ ] 之前工作服务的流量和瓶颈
- [x] 数据库引擎，一致性，锁
- [ ] 分布式选主方案
- [ ] 进程通信方式
- [ ] Golang `gc` 调优
- [ ] linux下的 `/proc` 目录
- [x] `map`, `slice` 实现和如何查找源代码
- [x] Go 线程协程调度模型(gpm)
    G: goroutine (协程)
    M: thread (线程)
    P: Processor (调度器) 数量来自 `GOMAXPROCS` 设置
- [ ] 如何给一个未加密的 `linux` 系统盘安装软件
- [x] `context.Context` 实现
    `Done() chan struct {}` 一个无缓存 `chan` 以关闭为信号来通知所有监听了该通道的方案。
    `context.TODO()` 的 `Done` 返回的是一个 `nil` 的 `chan` 对于 `nil` 的 `chan` 发送和接收都会一直阻塞。
- [x] http 断开信号的代理传递
    [connReader](https://github.com/golang/go/blob/release-branch.go1.14/src/net/http/server.go#L642-L798)
- [x] 如何检查一个 `api` 访问性能和稳定性
    参考 `Prometheus` 的 `Histogram` 和 `Summary` [如何利用Prometheus监控你的应用](https://www.cnblogs.com/YaoDD/p/11391316.html)
- [x] 二叉搜索树的排名查找
    ``` go
    type BinaryTree struct {
        value int
        left  *BinaryTree
        right *BinaryTree
    }

    // 查询该树的节点数量
    func size(node *BinaryTree) int {
        if node == nil {
            return 0
        }
        return 1 + size(node.left) + size(node.right)
    }

    func (p *BinaryTree) Rank(val int) (rank int) {
        if p == nil {
            // 说明没有找到
            rank = 1
        } else if val == p.value {
            // 匹配的排名为左树节点数量 +1
            rank = size(p.left) + 1
        } else if val > p.value {
            // 每次需要去右树查找就加上现有左树的数量
            rank = size(p.left) + p.right.Rank(val) + 1
        } else {
            // 递归到左树查找
            rank = p.left.Rank(val)
        }
        return
    }
    ```
