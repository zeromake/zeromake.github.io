---
title: docker容器调试新姿势
date: 2019-03-22 12:32:21+08:00
type: docker
tags: [docker, debug, go]
last_date: 2019-03-22 12:32:21+08:00
...

## 一、前言

1. 我在平时工作中经常使用 `docker` 来创建自己的开发环境，比如 `mysql`, `redis` 之类的。
2. 有些时候需要把现有的容器里的服务配置进行变更，`docker exec` 进入容器后发现很多基础命令工具(vim, nano)都没有，这让我很苦恼。
3. 再后来看到 [@github/aylei](https://github.com/aylei) 的 [kubectl-debug](https://github.com/aylei/kubectl-debug) 发现了容器之间可以共享各种资源。
4. 但是 `kubectl-debug` 只能够提供给 `kubernetes` 进行使用，所以我这边模仿了 `kubectl-debug` 写了一个 [docker-debug](https://github.com/zeromake/docker-debug)。

## 二、原理和方案

**docker内置的资源共享**
在 [ContainerCreate](https://docs.docker.com/engine/api/v1.39/#operation/ContainerCreate) api文档中我们可以找到
`HostConfig` 下有 `NetworkMode`, `UsernsMode`, `IpcMode`, `PidMode`。

只要根据文档格式设置即可在新的容器中共享 `network`, `user`, `ipc`, `pid` 这些资源。

**文件系统共享**
`docker` 从宿主机挂载的目录文件可以直接继承设置到新的容器创建配置中即可使用。

在 [Docker核心技术与实现原理](https://draveness.me/docker) 这篇博文中我了解到对于最终运行中的容器是有一个通过 `UnionFS` 在文件系统提供一个合并的目录，然后再挂载到容器中的。

在这个基础上我去 `/var/lib/docker/overlay2` 下找到了很多hash目录经过检查发现就是我想要的合成目录，但是这个时候却发现不知道如何找到对应容器的最终合成目录，找了一下发现 `docker inspect` 能够打出容器的各种信息。
``` json
{
    "GraphDriver": {
        "Data": {
            "LowerDir": "...",
            "MergedDir": "/var/lib/docker/overlay2/dd1a974cf3c1c43fe43598987664e6c9fb17f5872afd280254132bd036051ea7/merged",
            "UpperDir": "/var/lib/docker/overlay2/dd1a974cf3c1c43fe43598987664e6c9fb17f5872afd280254132bd036051ea7/diff",
            "WorkDir": "/var/lib/docker/overlay2/dd1a974cf3c1c43fe43598987664e6c9fb17f5872afd280254132bd036051ea7/work"
        }
    }
}
```
发现了 `GraphDriver.Data.MergedDir` 正好指向最终的合成目录，直接像挂载宿主机目录一样即可挂载到新的容器当中。

## 三、代码和实现


