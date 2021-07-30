---
title: k3s 安装笔记
date: 2021-07-30 15:78:00 +08:00
tags:
  - k8s
  - k3s
  - linux
  - learn
lastmod: 2021-07-30 15:78:00 +08:00
categories:
  - cloud
slug: k3s-install
draft: true
---

## 前言

最近因工作，需要有一个 `k8s` 环境，观察了不少单机部署方案都很差劲，最后看到 `k3s` 官方的文档里直接有各种安装方案，最终部署下来也是比较方便，完全没有网络的干扰。

## 一、准备工作

> [官方安装要求](https://docs.rancher.cn/docs/k3s/installation/installation-requirements/_index)

- 一台 linux 机器，单核 1 GB配置也完全足够
- 有一些发行版需要修改一些东西参考官方文档即可
- server(master) 节点需要 `6443/TCP` 端口
- 需要通过 `ingress` 暴露服务的话还需要 `80/TCP`, `443/TCP`


## 二、离线安装
> k3s 安装脚本默认使用 containerd 作为容器隔离，k8s 也抛弃了 docker，所以这里就直接使用 containerd 了。

**从镜像下载所需资源**

``` bash
# 镜像同步不是很及时手动选择镜像里有的最新版本（channels 里的版本号都能同步但是却没有对应版本的可以下载）
# version_url=http://rancher-mirror.cnrancher.com/k3s/channels/stable
# K3S_VERSION=(curl -s -S ${version_url})
➜ K3S_VERSION=v1.19.5-k3s1
➜ curl -o k3s-airgap-images-amd64.tar http://rancher-mirror.cnrancher.com/k3s/${K3S_VERSION}/k3s-airgap-images-amd64.tar
➜ curl -o k3s http://rancher-mirror.cnrancher.com/k3s/${K3S_VERSION}/k3s
➜ curl -o k3s-install.sh http://rancher-mirror.cnrancher.com/k3s/k3s-install.sh
```

**从 Github 下载最新的所需资源**

``` bash
➜ GITHUB_URL=https://github.com/k3s-io/k3s/releases
➜ version_url=https://update.k3s.io/v1-release/channels/stable
➜ K3S_VERSION=$(curl -w '%{url_effective}' -L -s -S ${version_url} -o /dev/null | sed -e 's|.*/||')
➜ curl -o k3s-airgap-images-amd64.tar ${GITHUB_URL}/download/${VERSION_K3S}/k3s-airgap-images-amd64.tar
➜ curl -o k3s ${GITHUB_URL}/download/${VERSION_K3S}/k3s
➜ curl -o k3s-install.sh https://get.k3s.io
```

**修改权限放到对应位置**

``` bash
➜ chmod a+x k3s k3s-install.sh
➜ cp k3s /usr/local/bin/
➜ mkdir -p /var/lib/rancher/k3s/agent/images/
➜ cp k3s-airgap-images-amd64.tar /var/lib/rancher/k3s/agent/images/
```


**最后执行安装脚本**
``` bash
$ INSTALL_K3S_SKIP_DOWNLOAD=true ./k3s-install.sh
```

**安装完成**
``` bash
# 可以看看 containerd 的镜像，由于是离线这些镜像不用下载
➜ crictl images
IMAGE                                      TAG                 IMAGE ID            SIZE
docker.io/rancher/coredns-coredns          1.7.1               0a6cfbf7b0b66       42.5MB
docker.io/rancher/klipper-helm             v0.3.0              5c7bd28900147       148MB
docker.io/rancher/klipper-lb               v0.1.2              897ce3c5fc8ff       6.46MB
docker.io/rancher/library-busybox          1.31.1              1c35c44120825       1.44MB
docker.io/rancher/library-traefik          1.7.19              aa764f7db3051       86.6MB
docker.io/rancher/local-path-provisioner   v0.0.14             e422121c9c5f9       42MB
docker.io/rancher/metrics-server           v0.3.6              9dd718864ce61       41.2MB
docker.io/rancher/pause                    3.1                 da86e6ba6ca19       746kB
# 以及全部命名空间下的 pods 情况
➜ k3s kubectl get pods -A
NAMESPACE              NAME                                         READY   STATUS      RESTARTS   AGE
kube-system            metrics-server-7b4f8b595-qzh6c               1/1     Running     0          31s
kube-system            local-path-provisioner-7ff9579c6-r5zd6       1/1     Running     0          31s
kube-system            svclb-traefik-nbctb                          2/2     Running     0          31s
kube-system            coredns-88dbd9b97-2kbtb                      1/1     Running     0          31s
kube-system            traefik-5bf464fc54-vqzvr                     1/1     Running     0          15s
kube-system            helm-install-traefik-hwhjv                   0/1     Completed   0          18s
```

## 三、远端访问 k3s

使用任意方式把 server(master) 节点的 `/etc/rancher/k3s/k3s.yaml` 的文件复制到自己本地的 `~/.kube/config`，记得把 `clusters[:].cluster.server` 的 `https://127.0.0.1:6443` 修改为对应地址。

``` bash
➜ scp k3s:/etc/rancher/k3s/k3s.yaml ~/.kube/config
➜ sed=$([[ "$OSTYPE" =~ ^darwin ]] && echo "gsed" || echo "sed")
➜ host=192.168.1.1
➜ $sed -i "s/127.0.0.1:6443/$host:6443/" ~/.kube/config
```

然后可以直接使用 [官方 kubectl](https://kubernetes.io/docs/tasks/tools/) 去直接访问，如果已经装过 `docker-desktop` 一般自带 `kubectl` 命令。

``` bash
➜ kubectl get pods -A
NAMESPACE              NAME                                         READY   STATUS      RESTARTS   AGE
kube-system            metrics-server-7b4f8b595-qzh6c               1/1     Running     1          3h48m
kube-system            local-path-provisioner-7ff9579c6-r5zd6       1/1     Running     1          3h48m
kube-system            svclb-traefik-nbctb                          2/2     Running     2          3h48m
kube-system            coredns-88dbd9b97-2kbtb                      1/1     Running     1          3h48m
kube-system            traefik-5bf464fc54-vqzvr                     1/1     Running     0          3h30m
kube-system            helm-install-traefik-hwhjv                   0/1     Completed   0          91m
```

## 四、安装 Kubernetes Dashboard
> [Kubernetes 仪表盘](https://docs.rancher.cn/docs/k3s/installation/kube-dashboard/_index)

**部署最新版**

``` bash
➜ GITHUB_URL=https://github.com/kubernetes/dashboard/releases
➜ VERSION_KUBE_DASHBOARD=$(curl -w '%{url_effective}' -I -L -s -S ${GITHUB_URL}/latest -o /dev/null | sed -e 's|.*/||')
# 把 yaml 文件下载下来这样后面有需要可以手动修改
➜ curl -o dashboard.yaml https://raw.githubusercontent.com/kubernetes/dashboard/${VERSION_KUBE_DASHBOARD}/aio/deploy/recommended.yaml
➜ k3s kubectl create -f ./dashboard.yaml
```

**本地开放访问**

```
➜ k3s kubectl proxy
```

[dashboard 本地访问地址](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/)

**修改 yaml 暴露 NodePort**


## 参考

- [k3s 官方中文文档](https://docs.rancher.cn/docs/k3s/_index)
- [rancher 软件包国内镜像](http://mirror.cnrancher.com)
- [K3s离线安装](https://www.cnblogs.com/k3s2019/p/14339547.html)
- [在k3s中启用其自带ingress](https://www.jianshu.com/p/0040e8bd6d1e)
- [使用 traefik ingress 暴露 kubernetes-dashbord(TLS)](https://blog.csdn.net/lwlfox/article/details/113403133)
- [ingress unknown field serviceName](https://stackoverflow.com/questions/67172481/kubernetes-ingress-unknown-field-servicename-in-io-k8s-api-networking-v1-ingr)
- [extensions/v1beta1 deprecated](https://stackoverflow.com/questions/66080909/logs-complaining-extensions-v1beta1-ingress-is-deprecated)
