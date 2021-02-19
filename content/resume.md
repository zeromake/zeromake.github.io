---
title: 简历
date: 2019-05-04T05:54:22.000Z
lastmod: 2020-03-30T12:24:26.000Z
categories:
  - resume
slug: resume
draft: false
---

## 联系方式

-   Email：fly-zero@hotmail.com
-   微信：afly390
-   qq： 390720046
-   手机：15606050092

## 个人信息

-   林建辉/男/1993
-   大专/漳州职业技术学院
-   工作年限：5 年
-   技术博客：[https://blog.zeromake.com](https://blog.zeromake.com)
-   Github：[https://github.com/zeromake](https://github.com/zeromake)

-   期望职位: Golang 后端开发

## 工作经历


### 上海零米信息技术有限公司 （ 2020 年 6 月 ~ 至今 ）

主要工作为后端云平台 sdk 接入，使用 `go`；基于平台添加应用，例如多云运维管理。

#### 工作流引擎

1. opsmind 平台的核心功能，通过该引擎可以把各种功能通过工作流组件的方式暴露给平台，平台可以通过这些功能组件构建不同的逻辑。
2. 主要的工作流能力有，网络请求，远程服务器脚本执行，内嵌 js 脚本执行逻辑，以及一些逻辑，流程控制的功能。
3. 我的工作主要是对工作流引擎进行 bug 修复，修复了一些工作流的锁组件无法被取消，工作流引擎重启恢复的一些问题。
4. 还有就是各种工作流组件编写，例如各种云平台的接口操作，一些 oa 接口的封装。

#### 多云运维管理

1. 基于以上的工作流引擎加自研的存储引擎做云平台的统一管理平台，用于混合云管理，实现对资源的纳管操作、服务器的脚本任务执行、运维流程的编排、权限控制。
2. 主要负责工单系统的功能添加与修复，例如工单支持更多的功能：ssh 执行脚本。
3. 还有就是各个云平台的 sdk 接入和暴露到该平台提供给用户进行操作。

#### 配置管理数据库

1. 基于以上的工作流引擎加自研的存储引擎做的动态数据建模系统，通过编写工作流来生成工作流的方式来生成每个数据模型的操作工作流。
2. 通过前端更加友好的方式来为数据建立模型，设置数据的字段类型，搜索，动态的增加删除字段，快捷的更改数据模型。
3. 也能够管理数据的查看方式，构建不同的视图到对应的导航和页面。

### 稿定（厦门）科技有限公司（ 2018 年 9 月 ~ 2019 年 10 月 ）

在该公司的主要工作语言为 `NodeJs`，主要业务为后台与站点后端逻辑。

#### 稿定设计

1. 负责稿定设计的用户数据系统和内容管理系统的后端功能添加与维护。
2. 用户系统的新模块后端数据库与接口设计和后台管理界面。
3. 统计用户数据的脚本，查看统计数据的后台。
4. 内容管理系统的新版本迭代。

#### 设计工坊

1. 该项目用于产出模板到稿定设计开放给用户使用。
2. 负责后端数据库设计，接口逻辑编写。
3. 最近上的一个比较大的内容为接入了权限系统，把接口和导航转到了内部的权限系统上。

### 厦门点触科技股份有限公司 ( 2016 年 3 月 ~ 2018 年 8 月 )

在该公司的主要工作编程语言为 `Go`, `Python` 主要业务为高并发微服务，后台后端逻辑开发。

#### HTTP2 转发器

1. 这是一个服务网格里的一个内部模块，用于解析 `HTTP2` 和转发并负载均衡。
2. `HTTP2` 的解析与转发全部由我负责。
3. 熟系 `HTTP2` 协议并写出一个高效的解析器。
4. 保证 `HTTP2` 的多路复用功能。
5. 这个模块可以为服务网格添加对 `HTTP2` 的流量观察，以及流量分配。
6. 从零开始写的解析器比起之前使用 `golang` 内部的模块实行性能高上不少，也能支持 `grpc` 了。
7. 更加了解了 `golang` 的特性，了解了 `HTTP2` 协议。

#### 推送服务

1. 为公司的手机网络游戏提供游戏内推送，高性能高并发需要。
2. 这个是交接过来的，由我进行了维护与新功能添加。
3. 接手后修复了各种神奇的 `BUG`。
4. 对 `Golang` 的特性有了更深的理解。
5. 对 `TCP` 协议有了更深的理解。
6. 对分布式服务有了更深的理解。

## 开源项目

### zero-reader

- git 地址：[https://code.aliyun.com/zero-reader](https://code.aliyun.com/zero-reader)
- 制作理由：总结 `web` 开发的各个知识点，不让自己离职的空档期脱离编写代码的手感，并且希望有一个网页在线阅读书籍的服务，省去我需要多端同步。

### docker-debug

-   github 地址: [https://github.com/zeromake/docker-debug](https://github.com/zeromake/docker-debug)
-   制作理由: 在本地开发时时常发现很多的 `docker` 镜像服务缺少很多命令行工具，通过查阅得知可以把一个新容器和旧容器共享达到使用新容器的工具管理旧容器，然后就写了这个 `docker-debug` 的 `cli` 工具。

### 技术文章

-   go-spring 使用学习：[https://blog.zeromake.com/pages/go-spring-learn](https://blog.zeromake.com/pages/go-spring-learn)
-   (翻译)Go 高性能研讨讲座：[https://blog.zeromake.com/pages/high-performance-go-workshop](https://blog.zeromake.com/pages/high-performance-go-workshop)
-   sequelize 的一些陷阱：[https://blog.zeromake.com/pages/sequelize-trap](https://blog.zeromake.com/pages/sequelize-trap)
-   docker 容器调试新姿势：[https://blog.zeromake.com/pages/docker-debug](https://blog.zeromake.com/pages/docker-debug)

## 技能清单

-   Web 开发: Golang
-   Web 框架: gin/go-spring
-   前端框架: Vue
-   数据库相关: MySQL/PgSQL/SQLite
-   版本管理、文档和自动化部署工具: Svn/Git/Gitlab-ci
