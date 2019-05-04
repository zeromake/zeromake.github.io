---
title: 简历
date: 2019-05-04 13:54:22+08:00
type: resume
last_date: 2019-05-04 13:54:22+08:00
...

# 联系方式

- Email：fly-zero@hotmail.com
- 微信：afly390
- qq： 390720046

# 个人信息

- 林建辉/男/1993
- 大专/漳州职业技术学院
- 工作年限：3年
- 技术博客：https://blog.zeromake.com
- Github：https://github.com/zeromake

- 期望职位: Python，Golang，Node 后端开发
- 期望薪资：税前月薪20k~25k，特别喜欢的公司可例外
- 期望城市：厦门

# 工作经历

## 稿定（厦门）科技有限公司（ 2018年9月 ~ 至今 ）

### 稿定设计

1. 负责稿定设计的用户数据系统和内容管理系统的后端功能添加与维护。
2. 用户系统的新模块后端数据库与接口设计和后台管理界面。
3. 统计用户数据的脚本，查看统计数据的后台。
4. 内容管理系统的新版本迭代。

## 厦门点触科技股份有限公司 ( 2016年3月 ~ 2018年8月 )

### HTTP2 转发器
1. 这是一个服务网格里的一个内部模块，用于解析 `HTTP2` 和转发并负载均衡。
2. `HTTP2` 的解析与转发全部由我负责。
3. 熟系 `HTTP2` 协议并写出一个高效的解析器。
4. 保证 `HTTP2` 的多路复用功能。
5. 这个模块可以为服务网格添加对 `HTTP2` 的流量观察，以及流量分配。
6. 从零开始写的解析器比起之前使用 `golang` 内部的模块实行性能高上不少，也能支持 `grpc` 了。
7. 更加了解了 `golang` 的特性，了解了 `HTTP2` 协议。

### 推送服务
1. 为公司的手机网络游戏提供游戏内推送，高性能高并发需要。
2. 这个是交接过来的，由我进行了维护与新功能添加。
3. 接手后修复了各种神奇的 `BUG`。
4. 对 `Golang` 的特性有了更深的理解。
5. 对 `TCP` 协议有了更深的理解。
6. 对分布式服务有了更深的理解。

### 任务调度
1. 用于各个服务间的分布式的任务调度，保证每个服务的节点可用性
2. 这个项目交接而来，进行维护与新功能添加。
3. 期间修复了顺序一致性任务的并发问题，`zk` 的监听重复问题。
4. 学习了 `cgo` 在 `windows` 上的编译，`zmq4` 的编译。
5. 初步学习了 `Golang` 语法以及独有的语言特性。

# 开源项目

## docker-debug
- github 地址: [https://github.com/zeromake/docker-debug](https://github.com/zeromake/docker-debug)
- 制作理由: 在本地开发时时常发现很多的 `docker` 镜像服务缺少很多命令行工具，通过查阅得知可以把一个新容器和旧容器共享达到使用新容器的工具管理旧容器，然后就写了这个 `docker-debug` 的 `cli` 工具。

## zreact
- github 地址: [https://github.com/zeromake/zreact](https://github.com/zeromake/zreact)
- 制作理由:为了理解 `preact` 使用 `ts` 抄写了一遍 `preact`，并加上了新功能。

## aiosqlite3
- github 地址: [https://github.com/zeromake/aiosqlite3](https://github.com/zeromake/aiosqlite3)
- 制作理由:对 `python3` 的 `asyncio` 的包装保证与其它数据库操作 `api` 一样。

## restful_model
- github 地址: [restful_model](https://github.com/zeromake/restful_model)
- 制作理由:简化数据库操作，向后端工程化更加的迈进一步。

## 技术文章
- [使用 vue-ssr 制作一个静态博客](https://segmentfault.com/a/1190000010045339)
- [preact 源码解读](https://segmentfault.com/a/1190000010337622)

# 技能清单
- Web 开发: Python/Golang/Node
- Web 框架: Flask/Sanic/Koa/gin
- 前端框架: React/Vue
- 前端工具: webpack/sass
- 数据库相关: MySQL/PgSQL/SQLite
- 版本管理、文档和自动化部署工具: Svn/Git/Pipenv
- 单元测试: pytest/jest
