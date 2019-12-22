---
title: 简历
date: 2019-05-04 13:54:22+08:00
type: resume
last_date: 2019-10-25 09:46:22+08:00
---

## 联系方式

-   Email：fly-zero@hotmail.com
-   微信：afly390
-   qq： 390720046

## 个人信息

-   林建辉/男/1993
-   大专/漳州职业技术学院
-   工作年限：3 年
-   技术博客：https://blog.zeromake.com
-   Github：https://github.com/zeromake

-   期望职位: Golang，Node 后端开发
-   期望薪资：月薪 20k~25k

## 工作经历

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

#### 任务调度

1. 用于各个服务间的分布式的任务调度，保证每个服务的节点可用性
2. 这个项目交接而来，进行维护与新功能添加。
3. 期间修复了顺序一致性任务的并发问题，`zk` 的监听重复问题。
4. 学习了 `cgo` 在 `windows` 上的编译，`zmq4` 的编译。
5. 初步学习了 `Golang` 语法以及独有的语言特性。

## 开源项目

### docker-debug

-   github 地址: [https://github.com/zeromake/docker-debug](https://github.com/zeromake/docker-debug)
-   制作理由: 在本地开发时时常发现很多的 `docker` 镜像服务缺少很多命令行工具，通过查阅得知可以把一个新容器和旧容器共享达到使用新容器的工具管理旧容器，然后就写了这个 `docker-debug` 的 `cli` 工具。

### zreact

-   github 地址: [https://github.com/zeromake/zreact](https://github.com/zeromake/zreact)
-   制作理由:为了理解 `preact` 使用 `ts` 抄写了一遍 `preact`，并加上了新功能。

### 技术文章

-   go-spring 使用学习：[https://blog.zeromake.com/pages/go-spring-learn](https://blog.zeromake.com/pages/go-spring-learn)
-   (翻译)Go 高性能研讨讲座：[https://blog.zeromake.com/pages/high-performance-go-workshop](https://blog.zeromake.com/pages/high-performance-go-workshop)
-   sequelize 的一些陷阱：[https://blog.zeromake.com/pages/sequelize-trap]https://blog.zeromake.com/pages/sequelize-trap)
-   docker 容器调试新姿势：[https://blog.zeromake.com/pages/docker-debug](https://blog.zeromake.com/pages/docker-debug)

## 技能清单

-   Web 开发: Golang/Node
-   Web 框架: gin/go-spring/koa
-   前端框架: Vue
-   前端工具: webpack/sass
-   数据库相关: MySQL/PgSQL/SQLite
-   版本管理、文档和自动化部署工具: Svn/Git/Gitlab-ci
-   单元测试: pytest/jest
