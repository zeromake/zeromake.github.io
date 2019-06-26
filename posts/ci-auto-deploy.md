---
title: ci 自动部署
date: 2017-10-31 15:44:00+08:00
type: deploy
tags: [ci, docker, deploy]
last_date: 2017-10-31 15:44:00+08:00
---

## 前言

很久没写博文了，最近正好公司内部需要进行 ci 自动部署，就写一篇 ci 自动部署。其中分为两种，公开项目，私有项目

<!--more-->

## 一、自动部署原理

现在的 git 自动部署都是通过推送钩子，触发第三方 ci 执行脚本，然后在脚本中进行部署。

1. git push
2. 触发 git hooks 去调用 ci
3. ci 执行 shell，自动拉取代码，build，部署

但是这样会缺少每次更新的代码，无法做到回滚。

所以正常的做法是每次 ci 执行更新时做一个打包当前代码，并存到一个地方。

现在有了另一种做法，那就是直接打包 docker 镜像，通过私有或者公开 docker 仓库保存

1. git push
2. 触发 git hooks 去调用 ci
3. ci 执行 shell，自动拉取代码，build，打包 docker，推送 docker 镜像部署

这样的好处就是完全保证，代码，环境一致，并能快速回滚

## 二、ci

ci(Continuous integration)的中文是持续集成，常用于自动测试。

在每次提交代码时自动的执行项目中的测试用例。

这里我公司内部使用的`gitlab`所以直接使用内置的 ci

`.gitlab-ci.yml`

```yaml
image: xxxx:latest
# gitlab-ci支持自定义docker镜像

variables:
    DOCKER_DRIVER: overlay
    BUILD_TAG: 0.1.0
# 设置下面shell环境中的变量

stages:
    - build_test

build_test:
    stage: build_test
    only:
        - ci # 只在ci分支变化时触发
    script:
        - cnpm install
        - npm run build # 编译
        - npm run test # 测试
```

除了需要自己部署的私有 ci：`gitlab-ci`

常见的公开的有`travis-ci`，`circle-ci`，`appveyor`，一般都为私有项目收费，开源项目免费。

然后 ci 的环境一般都是`docker`的，然后执行的命令都是`shell`，所以实际上就是编写一个一键部署脚本。

```yaml
image: xxxx:latest
# gitlab-ci支持自定义docker镜像

variables:
    DOCKER_DRIVER: overlay
    BUILD_TAG: 0.1.0
# 设置下面shell环境中的变量

stages:
    - build_test

build_test:
    stage: build_test
    only:
        - ci # 只在ci分支变化时触发
    script:
        - cnpm install
        - npm run build # 编译
        - npm run test # 测试
        - tar -Jcf dist.tar.xz dist
        - scp dist.tar.xz xxxx@xxx:~/
        - ssh xxxx@xxx
        - cd ~ && tar -xf dist.tar.xz && cp -R ./dist/* /data/www/
        - systemctl reload nginx # docker restart xxx
        - exit
```

以上是一个自动部署脚本的`ci`示例，但是以上要正常的跑起来需要`open-ssh`,以及连接部署机的 ssh 密钥。

但是这里有一个问题，`ssh`密钥必须在`ci`环境中，而`ci`环境每次运行都会重置，如果写在代码中就暴露的部署机的密钥。

如果`ci`和代码仓库都是私有的那倒是没问题，但是使用`github` + `travis-ci`明显都是公开的。

`travis-ci` 提供了一个后台来配置私有变量和文件。

我公司的做法是使用一个内网`docker`仓库来存放要部署的代码，然后通知`Rancher`管理的内网部署机更新镜像，并运行。

然后把内网的镜像推送到外网手动的操作`Rancher`更新， 其中代码的数据库配置使用`ZooKeeper`获取，切换`ZooKeeper`节点通过环境变量。

![ci-auto-docker-flow](/public/img/ci-auto-deploy/ci-auto-docker-flow.svg)

以上使用`GitLab` + `GitLab-ci` + `Harbor` + `Rancher` + `ZooKeeper` 感觉有点多。
