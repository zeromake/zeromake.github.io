---
title: (翻译)docker 镜像中有什么？
date: 2019-03-09 12:58:39+08:00
type: docker
tags: [docker, translation]
last_date: 2019-03-09 12:58:39+08:00
---

> 翻译自 [whats-in-a-docker-image](https://cameronlonsdale.com/2018/11/26/whats-in-a-docker-image/)

这是一个很好的问题，在你知道答案之前，`docker` 镜像看起来很神秘。

我不仅想告诉你答案，还想告诉你我是如何找到这个答案的。

<!--more-->

## 一、从 Dockerfile 到镜像

让我们从头开始，希望你熟系 `Dockerfile` - 关于 docker 如何为您构建镜像的说明文件。

下面是一个简单的示例：

```dockerfile
FROM ubuntu:15.04
COPY app.py /app/
CMD python /app/app.py
```

其中每一行都是说明 `docker` 如何建立镜像。

它将使用 `ubuntu:15.04` 为基础镜像，然后复制 `python` 脚本，`CMD` 指令是在运行容器(将镜像装换为正在运行的过程)做什么，因此该指令在构建阶段不相关。

让我们运行 `docker build .` 并检查输出。

```shell
$ docker build -t my_test_image .
Sending build context to Docker daemon  364.2MB
Step 1/3 : FROM ubuntu:15.04
 ---> d1b55fd07600
Step 2/3 : COPY app.py /app/
 ---> 44ab3f1d4cd6
Step 3/3 : CMD python /app/app.py
 ---> Running in c037c981012e
Removing intermediate container c037c981012e
 ---> 174b1e992617
Successfully built 174b1e992617
Successfully tagged my_test_image:latest
```

看到最后两行，我们已经成功构建了一个 `docker` 镜像，我们可以通过标识符来引用它（这个是镜像的 `sha256` 值）。

我们有一个最终镜像，但是各个步骤的 id 是多少？`d1b55fd07600` 和 `44ab3f1d4cd6`？它们是镜像？事实上它们也是一个镜像。
试想一下我们把 Step 2(`COPY app.py /app/`)从 `Dockerfile` 中删除掉，依旧能够构建出一个镜像(忽略 CMD 缺失 `app.py` 文件而运行失败)。因此在构建镜像的每一步骤中都会有一个镜像生成。

这告诉我们镜像可以构建在上一个镜像上，这从 `Dockerfile` 的 `FROM` 指令中也可以看出来。

镜像的结构必须以这样的方式来组织，但是为什么？我们需要把镜像文件进行解包进行解析。

## 二、导出镜像并解包

为了方便解析，我们可以导出一个镜像到文件，使得我们能够查看镜像文件中的内容。

```shell
docker save my_test_image > my_test_image
```

而导出的文件是……

```shell
$ file my_test_image
my_test_image: POSIX tar archive
```

是一个 `tar` 文件，内部可能包含文件或文件夹。让我们解压看看。

```shell
$ mkdir unpacked_image
$ tar -xvf my_test_image -C unpacked_image
x 174b1e9926177b5dfd22981ddfab78629a9ce2f05412ccb1a4fa72f0db21197b.json
x 28441336175b9374d04ee75fdb974539e9b8cad8fec5bf0ff8cea6f8571d0114/
x 28441336175b9374d04ee75fdb974539e9b8cad8fec5bf0ff8cea6f8571d0114/VERSION
x 28441336175b9374d04ee75fdb974539e9b8cad8fec5bf0ff8cea6f8571d0114/json
x 28441336175b9374d04ee75fdb974539e9b8cad8fec5bf0ff8cea6f8571d0114/layer.tar
x 4631663ba627c9724cd701eff98381cb500d2c09ec78a8c58213f3225877198e/
x 4631663ba627c9724cd701eff98381cb500d2c09ec78a8c58213f3225877198e/VERSION
x 4631663ba627c9724cd701eff98381cb500d2c09ec78a8c58213f3225877198e/json
x 4631663ba627c9724cd701eff98381cb500d2c09ec78a8c58213f3225877198e/layer.tar
x 6c91b695f2ed98362f511f2490c16dae0dcf8119bcfe2fe9af50305e2173f373/
x 6c91b695f2ed98362f511f2490c16dae0dcf8119bcfe2fe9af50305e2173f373/VERSION
x 6c91b695f2ed98362f511f2490c16dae0dcf8119bcfe2fe9af50305e2173f373/json
x 6c91b695f2ed98362f511f2490c16dae0dcf8119bcfe2fe9af50305e2173f373/layer.tar
x c4f8838502da6456ebfcb3f755f8600d79552d1e30beea0ccc62c13a2556da9c/
x c4f8838502da6456ebfcb3f755f8600d79552d1e30beea0ccc62c13a2556da9c/VERSION
x c4f8838502da6456ebfcb3f755f8600d79552d1e30beea0ccc62c13a2556da9c/json
x c4f8838502da6456ebfcb3f755f8600d79552d1e30beea0ccc62c13a2556da9c/layer.tar
x cac0b96b79417d5163fbd402369f74e3fe4ff8223b655e0b603a8b570bcc76eb/
x cac0b96b79417d5163fbd402369f74e3fe4ff8223b655e0b603a8b570bcc76eb/VERSION
x cac0b96b79417d5163fbd402369f74e3fe4ff8223b655e0b603a8b570bcc76eb/json
x cac0b96b79417d5163fbd402369f74e3fe4ff8223b655e0b603a8b570bcc76eb/layer.tar
x manifest.json
x repositories
```

我们开始检查 `manifest.json` 的内容吧。

```json
[
    {
        "Config": "174b1e9926177b5dfd22981ddfab78629a9ce2f05412ccb1a4fa72f0db21197b.json",
        "RepoTags": ["my_test_image:latest"],
        "Layers": [
            "cac0b96b79417d5163fbd402369f74e3fe4ff8223b655e0b603a8b570bcc76eb/layer.tar",
            "28441336175b9374d04ee75fdb974539e9b8cad8fec5bf0ff8cea6f8571d0114/layer.tar",
            "4631663ba627c9724cd701eff98381cb500d2c09ec78a8c58213f3225877198e/layer.tar",
            "c4f8838502da6456ebfcb3f755f8600d79552d1e30beea0ccc62c13a2556da9c/layer.tar",
            "6c91b695f2ed98362f511f2490c16dae0dcf8119bcfe2fe9af50305e2173f373/layer.tar"
        ]
    }
]
```

`manifest.json` 是描述该镜像的元数据。我们可以看到镜像有一个标签 `my_test_image`，它有一个叫做 `Layers` 的东西和一个叫做 `Config`。

`Config` 的值前 12 位与我们在 docker 构建时看到的 id 相同，我想这不是巧合。

`$ cat 174b1e9926177b5dfd22981ddfab78629a9ce2f05412ccb1a4fa72f0db21197b.json`

```json
{
    "architecture": "amd64",
    "config": {
        "Hostname": "d2d404286fc4",
        "Domainname": "",
        "User": "",
        "AttachStdin": false,
        "AttachStdout": false,
        "AttachStderr": false,
        "Tty": false,
        "OpenStdin": false,
        "StdinOnce": false,
        "Env": [
            "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
        ],
        "Cmd": ["/bin/sh", "-c", "python /app/app.py"],
        "ArgsEscaped": true,
        "Image": "sha256:44ab3f1d4cd69d84c9c67187b378b1d1322b5fddf4068c11e8b11856ced7efc0",
        "Volumes": null,
        "WorkingDir": "",
        "Entrypoint": null,
        "OnBuild": null,
        "Labels": null
    },
    "container": "c037c981012e8f03ac5466fcdda8f78a14fb9bb5ee517028c66915624a5616fa",
    "container_config": {
        "Hostname": "d2d404286fc4",
        "Domainname": "",
        "User": "",
        "AttachStdin": false,
        "AttachStdout": false,
        "AttachStderr": false,
        "Tty": false,
        "OpenStdin": false,
        "StdinOnce": false,
        "Env": [
            "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
        ],
        "Cmd": [
            "/bin/sh",
            "-c",
            "#(nop) ",
            "CMD [\"/bin/sh\" \"-c\" \"python /app/app.py\"]"
        ],
        "ArgsEscaped": true,
        "Image": "sha256:44ab3f1d4cd69d84c9c67187b378b1d1322b5fddf4068c11e8b11856ced7efc0",
        "Volumes": null,
        "WorkingDir": "",
        "Entrypoint": null,
        "OnBuild": null,
        "Labels": {}
    },
    "created": "2018-11-01T03:19:16.8517953Z",
    "docker_version": "18.09.0-ce-beta1",
    "history": [
        {
            "created": "2016-01-26T17:48:17.324409116Z",
            "created_by": "/bin/sh -c #(nop) ADD file:3f4708cf445dc1b537b8e9f400cb02bef84660811ecdb7c98930f68fee876ec4 in /"
        },
        {
            "created": "2016-01-26T17:48:31.377192721Z",
            "created_by": "/bin/sh -c echo '#!/bin/sh' > /usr/sbin/policy-rc.d \t&& echo 'exit 101' >> /usr/sbin/policy-rc.d \t&& chmod +x /usr/sbin/policy-rc.d \t\t&& dpkg-divert --local --rename --add /sbin/initctl \t&& cp -a /usr/sbin/policy-rc.d /sbin/initctl \t&& sed -i 's/^exit.*/exit 0/' /sbin/initctl \t\t&& echo 'force-unsafe-io' > /etc/dpkg/dpkg.cfg.d/docker-apt-speedup \t\t&& echo 'DPkg::Post-Invoke { \"rm -f /var/cache/apt/archives/*.deb /var/cache/apt/archives/partial/*.deb /var/cache/apt/*.bin || true\"; };' > /etc/apt/apt.conf.d/docker-clean \t&& echo 'APT::Update::Post-Invoke { \"rm -f /var/cache/apt/archives/*.deb /var/cache/apt/archives/partial/*.deb /var/cache/apt/*.bin || true\"; };' >> /etc/apt/apt.conf.d/docker-clean \t&& echo 'Dir::Cache::pkgcache \"\"; Dir::Cache::srcpkgcache \"\";' >> /etc/apt/apt.conf.d/docker-clean \t\t&& echo 'Acquire::Languages \"none\";' > /etc/apt/apt.conf.d/docker-no-languages \t\t&& echo 'Acquire::GzipIndexes \"true\"; Acquire::CompressionTypes::Order:: \"gz\";' > /etc/apt/apt.conf.d/docker-gzip-indexes"
        },
        {
            "created": "2016-01-26T17:48:33.59869621Z",
            "created_by": "/bin/sh -c sed -i 's/^#\\s*\\(deb.*universe\\)$/\\1/g' /etc/apt/sources.list"
        },
        {
            "created": "2016-01-26T17:48:34.465253028Z",
            "created_by": "/bin/sh -c #(nop) CMD [\"/bin/bash\"]"
        },
        {
            "created": "2018-11-01T03:19:16.4562755Z",
            "created_by": "/bin/sh -c #(nop) COPY file:8069dbb6bfc301562a8581e7bbe2b7675c2f96108903c0889d258cd1e11a12f6 in /app/ "
        },
        {
            "created": "2018-11-01T03:19:16.8517953Z",
            "created_by": "/bin/sh -c #(nop)  CMD [\"/bin/sh\" \"-c\" \"python /app/app.py\"]",
            "empty_layer": true
        }
    ],
    "os": "linux",
    "rootfs": {
        "type": "layers",
        "diff_ids": [
            "sha256:3cbe18655eb617bf6a146dbd75a63f33c191bf8c7761bd6a8d68d53549af334b",
            "sha256:84cc3d400b0d610447fbdea63436bad60fb8361493a32db380bd5c5a79f92ef4",
            "sha256:ed58a6b8d8d6a4e2ecb4da7d1bf17ae8006dac65917c6a050109ef0a5d7199e6",
            "sha256:5f70bf18a086007016e948b04aed3b82103a36bea41755b6cddfaf10ace3c6ef",
            "sha256:9720cebfd814895bf5dc4c1c55d54146719e2aaa06a458fece786bf590cea9d4"
        ]
    }
}
```

这是一个相当大的 `JSON` 文件，详细查看了你可以看到，有许多不同的元数据在其中。
特别是，有关于镜像装换为可运行的容器的元数据 - 要运行的命令(`Cmd`)，要添加的环境变量(`Env`)。

## 三、镜像就像洋葱

它们都有 `layers`。什么是 `layer`？我选择了 `cac0b96b79417d5163fbd402369f74e3fe4ff8223b655e0b603a8b570bcc76eb`，因为这是镜像 `layers` 的第一个。

```shell
$ ls cac0b96b79417d5163fbd402369f74e3fe4ff8223b655e0b603a8b570bcc76eb
VERSION   json      layer.tar
```

里面有一个 `layer.tar` 文件，通过文件后缀可以得知是一个 `tar` 文件，我们解包查看一下结构。

```shell
$ tree -L 1
.
├── bin
├── boot
├── dev
├── etc
├── home
├── lib
├── lib64
├── media
├── mnt
├── opt
├── proc
├── root
├── run
├── sbin
├── srv
├── sys
├── tmp
├── usr
└── var
```

这是 `docker` 镜像的重要秘密，它由不同的文件系统视图组成。
这个 `layer` 中有着不少的东西，二进制可文件 `/bin`，用户共享库 `/usr/lib`，你几乎可以看到一个标准 `Ubuntu` 的文件系统。
那么每一个 `layer` 又包含着什么呢？那么它将有帮助我们知道哪些 `layer` 来自基本镜像，以及哪些 `layer` 是由我们添加的。

重复我们之前查看镜像的过程，我们可以看到 `ubuntu:15.04` 的所有 `layers`。

```shell
cac0b96b79417d5163fbd402369f74e3fe4ff8223b655e0b603a8b570bcc76eb
28441336175b9374d04ee75fdb974539e9b8cad8fec5bf0ff8cea6f8571d0114
4631663ba627c9724cd701eff98381cb500d2c09ec78a8c58213f3225877198e
c4f8838502da6456ebfcb3f755f8600d79552d1e30beea0ccc62c13a2556da9c
```

全部属于 `ubuntu` 的基础镜像，`FROM ubuntu:15.04` 指令。
知道了这一点我预测属于我们添加的最顶部的 `layer` 的镜像 `6c91b695f2ed98362f511f2490c16dae0dcf8119bcfe2fe9af50305e2173f373` 应该是从 `COPY app.py /app/` 的指令生成的。

```shell
$ tree
.
└── app
    └── app.py
```

这是 `layer` 中的内容，而且内部的所有内容只是对文件系统添加了 `app.py`。

### 图片辅助

把以上的 `layers` 和每个镜像包含的 `layers` 表现为一张图
![layers](/public/img/whats-in-a-docker-image/layers.png)

### 推荐工具

手工的对镜像进行分析，是比较的困难，但是这还是比较值得我们去做一次的。
如果你日后还是需要快捷对镜像进行分析，可以使用 [dive](https://github.com/wagoodman/dive) 这款开源工具。
![dive](/public/img/whats-in-a-docker-image/dive.png)

## 四、镜像是如何转换为运行的容器呢？

我们现在已经知道一个 `docker` 镜像内部到达包含了一些什么，那么 `docker` 又是如何把它转换为正在运行的容器呢？

### 文件系统

每个容器都有着自己的文件系统，`docker` 将所有镜像的 `layers` 获取并合并在一起，以呈现为一个文件系统视图。
这种技术称为 [Union Mounting](https://en.wikipedia.org/wiki/Union_mount) ，`Docker` 支持 `Linux` 上的几个 `Union Mount File` 系统，主要是 [OverlayFS](https://en.wikipedia.org/wiki/OverlayFS) 和 [AUFS](https://en.wikipedia.org/wiki/Aufs)。

但这并非全部，容器运行时的文件系统更改不应该在容器停止后保存到镜像。
要做到这一点的一种方法是将镜像复制为一个副本，这样容器的文件系统就能够和镜像的分离。
但这么做并不是很有效，作为代替(`docker` 中的做法)是在容器的文件系统的最顶部添加一个支持 `Read/Write` 的 `layer` 来代替容器中的文件系统变化。如果你需要修改下面某个镜像的 `layer` 的文件，则需要将该文件复制到顶部 `layer` 进行修改。
这被称之为 [Copy-on-write](https://en.wikipedia.org/wiki/Copy-on-write)。当容器停止时最顶部的 `layer` 被丢弃。

可以从 [docker 文档](https://docs.docker.com/storage/storagedriver/#images-and-layers) 的图片中看出容器最顶部的 `layer` 组成。
![container-layers](/public/img/whats-in-a-docker-image/container-layers.jpg)

## 五、总结

容器的运行全过程超出了本文的范围。在创建了文件系统之后，除了一些配置一些后续步骤的元数据之外不会再使用到镜像。
为了完整的运行容器，我们需要使用 [name spaces](https://en.wikipedia.org/wiki/Linux_namespaces) 查看进程的内容(文件系统，进程，网络，用户，配置)。
使用 [Cgroups](https://en.wikipedia.org/wiki/Cgroups) 查看进程可以使用哪些资源(内存，CPU，网络，配置)。
和安全功能(Security Features)控制进程的安全限制(Capabilities, AppArmor, SELinux, Seccomp)。
