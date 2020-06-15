---
title: docker 容器调试新姿势
date: 2019-03-22T04:32:21.000Z
tags:
  - docker
  - debug
  - go
lastmod: 2019-05-28T13:32:28.000Z
categories:
  - docker
slug: docker-debug
draft: false
---

## 一、前言

1. 我在平时工作中经常使用 `docker` 来创建自己的开发环境，比如 `mysql`, `redis` 之类的。
2. 有些时候需要把现有的容器里的服务配置进行变更，`docker exec` 进入容器后发现很多基础命令工具(vim, nano)都没有，这让我很苦恼。
3. 再后来看到 [@github/aylei](https://github.com/aylei) 的 [kubectl-debug](https://github.com/aylei/kubectl-debug) 发现了容器之间可以共享各种资源。
4. 但是 `kubectl-debug` 只能够提供给 `kubernetes` 进行使用，所以我这边模仿了 `kubectl-debug` 写了一个 [docker-debug](https://github.com/zeromake/docker-debug)。

<!--more-->

## 二、原理和方案

**docker 内置的资源共享**
在 [ContainerCreate](https://docs.docker.com/engine/api/v1.39/#operation/ContainerCreate) api 文档中我们可以找到
`HostConfig` 下有 `NetworkMode`, `UsernsMode`, `IpcMode`, `PidMode`。

只要根据文档格式设置即可在新的容器中共享 `network`, `user`, `ipc`, `pid` 这些资源。

**文件系统共享**
`docker` 从宿主机挂载的目录文件可以直接继承设置到新的容器创建配置中即可使用。

在 [Docker 核心技术与实现原理](https://draveness.me/docker) 这篇博文中我了解到对于最终运行中的容器是有一个通过 `UnionFS` 在文件系统提供一个合并的目录，然后再挂载到容器中的。

在这个基础上我去 `/var/lib/docker/overlay2` 下找到了很多 hash 目录经过检查发现就是我想要的合成目录，但是这个时候却发现不知道如何找到对应容器的最终合成目录，找了一下发现 `docker inspect` 能够打出容器的各种信息。

```json
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

## 三、代码

这边考虑只介绍 `创建容器`，`拉取镜像`，`创建exec`，`运行exec`。

**拉取镜像**

```go
import (
    "context"
    "strings"

    "github.com/pkg/errors"
    "github.com/docker/docker/client"
    "github.com/docker/docker/api/types"
    "github.com/docker/docker/pkg/jsonmessage"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/strslice"

    "github.com/zeromake/docker-debug/pkg/stream"
	"github.com/zeromake/docker-debug/pkg/tty"
)

const (
    legacyDefaultDomain = "index.docker.io"
    defaultDomain       = "docker.io"
    fficialRepoName = "library"
)

type Cli struct {
    client client.APIClient
    in     *stream.InStream
    out    *stream.OutStream
    err    io.Writer
}
// splitDockerDomain 分割镜像名和domain
func splitDockerDomain(name string) (domain, remainder string) {
	i := strings.IndexRune(name, '/')
	if i == -1 || (!strings.ContainsAny(name[:i], ".:") && name[:i] != "localhost") {
		domain, remainder = defaultDomain, name
	} else {
		domain, remainder = name[:i], name[i+1:]
	}
	if domain == legacyDefaultDomain {
		domain = defaultDomain
	}
	if domain == defaultDomain && !strings.ContainsRune(remainder, '/') {
        // 处理docker hub 镜像名映射
		remainder = officialRepoName + "/" + remainder
	}
	return
}

// ImagePull 拉取镜像
func (c *Cli) ImagePull(imageName string) error {
    domain, remainder := splitDockerDomain(imageName);
    body, err := c.client.ImagePull(
        context.Background(),
        domain + '/' + remainder,
        types.ImagePullOptions{},
    )
    if err != nil {
        return errors.WithStack(err)
    }
    defer body.Close()
    // docker 包里自带处理 pull 的 http 输出到 tty。
    return jsonmessage.DisplayJSONMessagesToStream(responseBody, cli.out, nil)
}

// CreateContainer 创建一个自定义镜像的新容器并把目标容器的各种资源挂载到新容器上
func (c *Cli) CreateContainer(targetContainerID string) error {
    ctx := context.Background()
    info, err := cli.client.ContainerInspect(ctx, targetContainerID)
    if err != nil {
        return errors.WithStack(err)
    }
    mountDir, ok := info.GraphDriver.Data["MergedDir"]
    mounts = []mount.Mount{}
    targetMountDir = '/mnt/container';
    // 通过 Inspect 查找出 MergedDir 位置并挂载到新容器的 /mnt/container
    if ok {
        mounts = append(mounts, mount.Mount{
            Type:   "bind",
            Source: mountDir,
            Target: targetMountDir,
        })
    }
    // 继承目标容器的挂载目录
    for _, i := range info.Mounts {
        var mountType = i.Type
        if i.Type == "volume" {
            // 虚拟目录在 docker 处理后也是一个在宿主机上的普通目录改为 bind
            mountType = "bind"
        }
        mounts = append(mounts, mount.Mount{
            Type:     mountType,
            Source:   i.Source,
            Target:   targetMountDir + i.Destination,
            ReadOnly: !i.RW,
        })
    }
    targetName := fmt.Sprintf("container:%s", targetContainerID)
    containerConfig := &container.Config{
        // 直接使用 sh 命令作为统一的容器后台进程
        Entrypoint: strslice.StrSlice([]string{"/usr/bin/env", "sh"}),
        // 默认镜像，真实项目中应该来自配置
        Image:      'nicolaka/netshoot:latest',
        Tty:        true,
        OpenStdin:  true,
        StdinOnce:  true,
    }
    hostConfig := &container.HostConfig{
        // network 共享
        NetworkMode: container.NetworkMode(targetName),
        // 用户共享
        UsernsMode:  container.UsernsMode(targetName),
        // ipc 共享
        IpcMode:     container.IpcMode(targetName),
        // pid 共享
        PidMode:     container.PidMode(targetName),
        // 文件共享
		Mounts:      mounts,
    }
}

// ExecCreate 创建exec
func ExecCreate(containerID string) error {
    ctx := context.Background()
    execConfig := types.ExecConfig{
        // User:         options.user,
        // Privileged:   options.privileged,
        // DetachKeys:   options.detachKeys,
        // 是否分配一个 tty vim 之类的 cli 交互类工具需要
        Tty:          true,
        // 是否附加各种标准流
        AttachStderr: true,
        AttachStdin:  true,
        AttachStdout: true,
        // exec 需要执行的命令也就是目标命令
        Cmd:          [
            'bash',
            '-l',
        ],
    }
    resp, err := cli.client.ContainerExecCreate(ctx, container, opt)
    return resp, errors.WithStack(err)
}

func (cli *DebugCli) ExecStart(execID string) error {
    ctx := context.Background()
	execConfig := types.ExecStartCheck{
		Tty: true,
	}
	response, err := cli.client.ContainerExecAttach(ctx, execID, execConfig)
	if err != nil {
		return errors.WithStack(err)
    }
    // 把 docker cli 包的 tty 移植了可以直接处理 HijackedIO。
	streamer := tty.HijackedIOStreamer{
		Streams:      cli,
		InputStream:  cli.in,
		OutputStream: cli.out,
		ErrorStream:  cli.err,
		Resp:         response,
		TTY:          true,
	}
	return streamer.Stream(ctx)
}
```

## 四、一些边角处理

### 4.1 通过环境变量获取 docker 配置

在各种系统环境下 `docker` 的 `cli` 获取连接的配置都是用环境变量和固定值来做的。

-   `DOCKER_HOST` 对应 `docker` 服务端 `api` 地址。
-   `DOCKER_TLS_VERIFY` `api` 的连接是否为 `tls`。
-   `DOCKER_CERT_PATH` 使用的证书目录。

### 4.2 docker/client 的 opts 包引入报错

在直接使用 `docker/client` 的 `opts` 包发现有很多奇怪的引入照成了各种错误，经过研究发现我的项目只需要一部分提取后放到了项目中。

### 4.3 使用 git-chglog 来生成 changelog

在开发过程中 `changelog` 如果使用手动维护会十分麻烦，所以考虑寻找一个 `cli` 通过 `git log` 自动生成。

后面找到了 [git-chglog](https://github.com/git-chglog/git-chglog) 这个工具效果还不错就是比较麻烦的是 `changelog` 自己也在 `git` 管理下每次的生成都会错过这次生成的提及。

### 4.4 go 编译二进制的一些问题

`golang` 的程序编译后只有单个执行文件，但是大小有 10MB - 11MB 左右，后来考虑使用 `upx` 进行压缩，但是却发现 `upx` 的压缩虽然能够在 `linux` 上压缩 `mac` 的二进制但是会出现压缩后二进制文件无法执行了，直接在 `mac` 上压缩是没问题的。

## 五、下一步计划

-   抽取 cli 的操作，开放到 pkg 里。
-   构建一个 http rpc api 支持在网页上操作，通过 `websocket` 或 `socket.io` 支持 `tty` 映射。
-   单独构建一个前端操作界面，可支持静态部署类似 `aria2ui` 之类的。

## 六、参考和感谢

-   [kubectl-debug](https://github.com/aylei/kubectl-debug): docker-debug 想法来自这个 kubectl 调试工具。
-   [Docker 核心技术与实现原理](https://draveness.me/docker): docker-debug 的文件系统挂载原理来自这个博文。
-   [docker-engine-api-doc](https://docs.docker.com/engine/api/latest): docker engine api 文档。
-   [docker-cli](https://github.com/docker/cli): 拷贝了不少 cli 的 tty 处理库。
