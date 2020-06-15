---
title: 修改 helm 模板支持阿里云
date: 2019-04-12T08:25:21.000Z
tags:
  - kube
  - docker
  - helm
  - ailyun
lastmod: 2019-04-12T08:25:21.000Z
categories:
  - helm
slug: helm-ailyun-deploy
draft: false
---

## 一、前言

1. 最近公司内部需要在 `k8s` 上部署一些东西，然后发现现在有了一个 `helm` 的工具能够快速的部署。
2. 对于普通的 `k8s` 阿里云上则需要有一些特殊的操作，这边记录一下如何修改 `helm` 的模板以支持阿里云的部署。

<!--more-->

## 二、环境搭建

### 2.1 k8s 环境

**使用 minikube 搭建:**

[minikube](https://github.com/kubernetes/minikube)

官方推荐的本地 `k8s` 环境搭建，通过创建虚拟机来代替 `k8s` 需要的节点。

国内特点(1.0.0 版本新增的 `registry-repository` 选项):

> --registry-mirror=设置镜像源
> --registry-repository=设置 k8s.gcr.io 的替代镜像地址

```shell
minikube start --registry-mirror=http://f1361db2.m.daocloud.io --image-repository=registry.cn-hangzhou.aliyuncs.com/google_containers
```

完成后直接使用 `kubcli` 就可以管理。

**使用云上 k8s:**
这个就不用我说了，现在各个云厂商都有现成的 `k8s` 集群可以购买，购买后把配置放到 `~/.kube/config` 或者直接保存为单个文件(~/.kube/ali-config)然后通过环境变量加载。

```shell
export KUBECONFIG=~/.kube/ali-config
```

然后使用 `kubcli` 就可以管理。

**k3s**
[k3s](https://github.com/rancher/k3s)

最近一段时间 `rancher` 出的一款极简版 `k8s`，名为 `k3s` 在我本地的 mac 尝试部署却发现有着 `k8s.gcr.io` 镜像地址无法下载没有成功部署，尝试时的 `k3s` 的版本为 `0.3.0`。

**other**

### 2.2 kubectl && helm 安装和初始化

以上的 `k8s` 环境都需要 `kubectl` 来进行管理，使用 `web` 面板也行但是效率过低。

[kubectl 官方安装说明](https://kubernetes.io/docs/tasks/tools/install-kubectl/)

安装后配置好 `~/.kube/config`，使用 `kubectl cluster-info` 可以查看集群信息。

对于 `k8s` 的服务部署的 `yaml` 由于过于复杂，有了一个 `helm` 可以通过模板生成我们需要的 `yaml` 自动的部署和更新到 `k8s` 上。

[helm 官方安装说明](https://github.com/helm/helm)

## 三、使用 helm

**初始化 helm**
`k8s` 第一次使用 `helm` 需要执行 `helm init` 创建本地配置和远端 `k8s` api 服务。

```shell
helm init
```

国内特有情况(tiller 镜像版本与 helm 版本相同)：

```shell
helm init -i registry.cn-hangzhou.aliyuncs.com/google_containers/tiller:v2.13.1 --stable-repo-url https://kubernetes.oss-cn-hangzhou.aliyuncs.com/charts
```

如果 `k8s` 有 `rbac` 的权限控制请自行查找方案处理权限问题。

**helm 的 charts 源**
在上面的命令中我设置 `--stable-repo-url` 就是阿里云的 `stable` 的 `charts` 源，源路径在 [helm/charts](https://github.com/helm/charts)。

这里面有很多直接支持 `helm` 的模板可以进行参考。

## 四、helm 的模板

我们创建一个干净的模板看看

```shell
helm create test && tree ./test/
```

```shell
├── Chart.yaml          # 包的元信息
├── templates           # k8s 模板
│   ├── NOTES.txt       # 部署后的说明模板
│   ├── _helpers.tpl    # 帮助说明模板
│   ├── deployment.yaml # 部署模板
│   ├── ingress.yaml    # 暴露服务的一种方式
│   ├── service.yaml    # k8s 服务模板
│   └── tests
│       └── test-connection.yaml
└── values.yaml         # 模板中使用的变量声明和默认值
```

在 `templetes` 文件下的文件都会被 `{{}}` 这个指令支持内部可使用一下模板语法进行替换。
具体的不描述了可以见 [chart 模板手册](https://helm.sh/docs/chart_template_guide/)

对于 `helm install` 的执行顺序发现是按照 `configmap.yaml`, `pv.yaml`, `pvc.yaml`, `deployment.yaml`, `service.yaml`, `ingress.yaml` 的有依赖关系进行执行的，没有找到有控制和文件名的限制应该是用 `kind` 来做依赖分析的。

## 五、修改 helm 以支持阿里云部署

主要的不同点在于 `pv`, `pvc` 需要根据云厂商使用的云盘来定制。

这里我用 [stable/verdaccio](https://github.com/helm/charts/tree/master/stable/verdaccio) 来做示例。

把这个目录下载到本地就可以通过 `helm [install|template] ./verdaccio` 输出到本地或到 `k8s` 来调试。

### 5.1 阿里云云盘支持

`verdaccio` 的模板只有 `pvc` 没有 `pv` 需要自行添加一个

**values.yaml**

```yaml
pv:
    enabled: true
    size: 20Gi
    volume:
    fsType: xfs
    zone: cn-hangzhou-b
    region: cn-hangzhou
```

**pv.yaml**

```yaml
# 无需 pv 时通过这个控制不会触发pv创建
{{- if and .Values.pv.enabled (.Values.pv.volume) }}
apiVersion: v1
kind: PersistentVolume
metadata:
  name: {{ .Values.pv.volume }}
  labels:
    failure-domain.beta.kubernetes.io/zone: {{ .Values.pv.zone }}
    failure-domain.beta.kubernetes.io/region: {{ .Values.pv.region }}
spec:
  capacity:
    storage: {{ .Values.pv.size }}
  storageClassName: disk
  accessModes:
    - ReadWriteOnce
  flexVolume:
    driver: "alicloud/disk"
    fsType: "{{ .Values.pv.fsType }}"
    options:
      volumeId: "{{ .Values.pv.volume }}"
{{- end}}
```

1. size: pv 分配大小单位 `Gi`
2. volume: 云盘 id
3. fsType: 文件系统 `xfs`, `ext4`
4. zone: 云盘域
5. region: 云盘地区

以上的配置可以通 `--set` 命令传入 `helm` 重新设置。

```shell
helm install --set pv.volume=xx-dfgafgf,pv.zone=cn-hangzhou-b,pv.region=cn-hangzhou ./verdaccio/
```

由于使用的特有的云盘我们需要修改 `pvc` 支持
**pvc.yaml**
在 `spec` 下添加 `selector`, `volumeName` 设置为云盘 id 即可。

```yaml
# ...
spec:
# ...
{{- if .Values.pv.volume }}
  selector:
    matchLabels:
      alicloud-pvname: "{{ .Values.pv.volume }}"
  volumeName: "{{ .Values.pv.volume }}"
{{- end }}
# ...
```

### 5.2 阿里云 nas 支持

可以参考上面的方式根据 [阿里云 k8s nas 指南](https://help.aliyun.com/document_detail/88940.html) 修改 `pv` 和 `pvc` 来支持。

pv.yaml:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
    name: pv-nas
spec:
    capacity:
        storage: 5Gi
    storageClassName: nas
    accessModes:
        - ReadWriteMany
    flexVolume:
        driver: "alicloud/nas"
        options:
            server: "0cd8b4a576-uih75.cn-hangzhou.nas.aliyuncs.com"
            path: "/k8s"
            vers: "4.0"
```

pvc.yaml:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
    name: pvc-nas
spec:
    accessModes:
        - ReadWriteMany
    storageClassName: nas
    resources:
        requests:
            storage: 5Gi
```

主要是 `storageClassName` 的关联。

## 六、一些问题

1. 我发现 `helm install` 后经常会发生部署找不到 `pvc` 但是重新伸缩后又正常了，考虑可能是 `helm` 的执行间隔太短了，但是没有找到处理办法，可以手动的通过 `helm` 直接输出 `yaml` 用 `kubecli` 一个个手动创建。
2. 阿里云 k8s 在部署 `verdaccio` 部署会报错 `0/5 nodes are available: 2 node(s) had no available volume zone, 3 node(s) had taints that the pod didn't tolerate` 不知道怎么解决。

## 七、参考

-   [helm 官网文档](https://helm.sh/docs)
-   [阿里云 k8s 云盘指南](https://help.aliyun.com/document_detail/86612.html)
-   [阿里云 k8s nas 指南](https://help.aliyun.com/document_detail/88940.html)
