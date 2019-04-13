---
title: 修改 helm 模板支持阿里云
date: 2019-04-12 16:25:21+08:00
type: helm
tags: [kube, docker, helm, ailyun]
last_date: 2019-04-12 16:25:21+08:00
...

## 一、前言

1. 最近公司内部需要在 `k8s` 上部署一些东西，然后发现现在有了一个 `helm` 的工具能够快速的部署。
2. 对于普通的 `k8s` 阿里云上则需要有一些特殊的操作，这边记录一下如何修改 `helm` 的模板以支持阿里云的部署。


## 二、环境搭建

### 2.1 k8s 环境

**minikube**
[minikube](https://github.com/kubernetes/minikube)


官方推荐的本地 `k8s` 环境搭建，通过创建虚拟机来代替 `k8s` 需要的节点。

国内特点(1.0.0版本新增的 `registry-repository` 选项):
> --registry-mirror=设置镜像源
> --registry-repository=设置 k8s.gcr.io 的替代镜像地址
``` shell
minikube start --registry-mirror=http://f1361db2.m.daocloud.io --image-repository=registry.cn-hangzhou.aliyuncs.com/google_containers
```

完成后直接使用 `kubcli` 就可以管理。

**云上k8s**
这个就不用我说了，现在各个云厂商都有现成的 `k8s` 集群可以购买，购买后把配置放到 `~/.kube/config` 或者直接保存为单个文件(~/.kube/ali-config)然后通过环境变量加载。
``` shell
export KUBECONFIG=~/.kube/ali-config
```
然后使用 `kubcli` 就可以管理。

**k3s**
[k3s](https://github.com/rancher/k3s)

最近一段时间 `rancher` 出的一款极简版 `k8s`，名为 `k3s` 在我本地的 mac 尝试部署却发现有着 `k8s.gcr.io` 镜像地址无法下载没有成功部署，尝试时的 `k3s` 的版本为 `0.3.0`。

**other**

### 2.2 kubectl && helm 安装和初始化


## 三、使用 helm

## 四、helm 的模板

## 五、修改 helm 以支持阿里云部署

## 六、一些问题

## 七、参考


