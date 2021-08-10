---
title: k3s 安装笔记
date: 2021-07-30 15:48:00 +08:00
tags:
  - k8s
  - k3s
  - linux
  - learn
lastmod: 2021-07-31 13:33:00 +08:00
categories:
  - cloud
slug: k3s-install
draft: false
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
> 我这边部署时最新版 v2.3.1 的 443 服务不知道为什么挂了开 nodePort，curl 直接访问 Connection refused，退回到 v2.3.0 就正常。

``` bash
➜ GITHUB_URL=https://github.com/kubernetes/dashboard/releases
➜ VERSION_KUBE_DASHBOARD=$(curl -w '%{url_effective}' -I -L -s -S ${GITHUB_URL}/latest -o /dev/null | sed -e 's|.*/||')
# 把 yaml 文件下载下来这样后面有需要可以手动修改
# ➜ VERSION_KUBE_DASHBOARD=v2.3.0
➜ curl -o dashboard.yaml https://raw.githubusercontent.com/kubernetes/dashboard/${VERSION_KUBE_DASHBOARD}/aio/deploy/recommended.yaml
➜ k3s kubectl create -f ./dashboard.yaml
```

获取登录用 token 请参考 [Kubernetes 仪表盘](https://docs.rancher.cn/docs/k3s/installation/kube-dashboard/_index) 里的方式。

**本地开放访问**

``` bash
➜ k3s kubectl proxy
```

[dashboard 本地访问地址](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/)

**修改 yaml 暴露 NodePort**

修改 dashboard.yaml 以下对应位置，开放端口

``` diff
kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
    name: kubernetes-dashboard
    namespace: kubernetes-dashboard
  spec:
+   type: NodePort
    ports:
      - port: 443
+       nodePort: 30001
        targetPort: 8443
    selector:
      k8s-app: kubernetes-dashboard
```

应用后，由于是单节点部署直接访问 server(master) 的 30001 端口例如 [https://192.168.1.1:30001](https://192.168.1.1:30001)。

``` bash
➜ k3s kubectl apply -f ./dashboard.yaml
```

**直接暴露 http 的方式**
> 下面的 yaml 文件内容都在 dashboard.yaml 当中

kubernetes-dashboard 的服务内实际上还有一个 9090 端口的 http 服务，但是不支持认证，由于没有认证也导致需要给 kubernetes-dashboard 额外配置权限。

先修改部署开放 9090 端口。
``` diff
kind: Deployment
apiVersion: apps/v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
spec:
  replicas: 1
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      k8s-app: kubernetes-dashboard
  template:
    metadata:
      labels:
        k8s-app: kubernetes-dashboard
    spec:
      containers:
        - name: kubernetes-dashboard
          image: kubernetesui/dashboard:v2.3.0
          imagePullPolicy: Always
          ports:
            - containerPort: 8443
              protocol: TCP
+           - containerPort: 9090
+             protocol: TCP
          args:
            - --auto-generate-certificates
            - --namespace=kubernetes-dashboard
            # Uncomment the following line to manually specify Kubernetes API server Host
            # If not specified, Dashboard will attempt to auto discover the API server and connect
            # to it. Uncomment only if the default does not work.
            # - --apiserver-host=http://my-address:port
          volumeMounts:
            - name: kubernetes-dashboard-certs
              mountPath: /certs
              # Create on-disk volume to store exec logs
            - mountPath: /tmp
              name: tmp-volume
          livenessProbe:
            httpGet:
              scheme: HTTPS
              path: /
              port: 8443
            initialDelaySeconds: 30
            timeoutSeconds: 30
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            runAsUser: 1001
            runAsGroup: 2001
      volumes:
        - name: kubernetes-dashboard-certs
          secret:
            secretName: kubernetes-dashboard-certs
        - name: tmp-volume
          emptyDir: {}
      serviceAccountName: kubernetes-dashboard
      nodeSelector:
        "kubernetes.io/os": linux
      # Comment the following tolerations if Dashboard must not be deployed on master
      tolerations:
        - key: node-role.kubernetes.io/master
          effect: NoSchedule
```

修改服务的方式直接暴露 9090 端口。

``` diff
kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
spec:
+ type: NodePort
  ports:
    - port: 443
      targetPort: 8443
+     nodePort: 30001
+     name: dashboard-https
+   - port: 9090
+     targetPort: 9090
+     nodePort: 30002
+     name: dashboard-http
  selector:
    k8s-app: kubernetes-dashboard
```

由于 dashboard 的 http 服务没有用户需要给 dashboard 给予额外权限。

``` diff
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
rules:
  # Allow Metrics Scraper to get metrics from the Metrics server
  - apiGroups: ["metrics.k8s.io"]
-   resources: ["pods", "nodes"]
+   resources: ["pods", "nodes", "namespaces","secrets","persistentvolumeclaims"]
    verbs: ["get", "list", "watch"]
+ - apiGroups: ["", "apps"]
+   resources: ["pods", "nodes","namespaces","secrets","persistentvolumeclaims","replicasets","deployments","events", "statefulsets", "daemonsets", "replicationcontrollers", "ingresses", "services", "configmaps", "persistentvolumes", "serviceaccounts", "pods/exec", "pods/log"]
+   verbs: ["get", "list", "watch", "create","update","patch","delete"]
+ - apiGroups: ["batch"]
+   resources: ["jobs", "cronjobs"]
+   verbs: ["get", "list", "watch"]
+ - apiGroups: ["networking.k8s.io"]
+   resources: ["ingresses", "networkpolicies"]
+   verbs: ["get", "list", "watch"]
+ - apiGroups: ["storage.k8s.io"]
+   resources: ["storageclasses"]
+   verbs: ["get", "list", "watch"]
+ - apiGroups: ["rbac.authorization.k8s.io"]
+   resources: ["roles", "rolebindings", "serviceaccounts", "clusterrolebindings", "clusterroles"]
+   verbs: ["get", "list", "watch"]
+ - apiGroups: ["apiextensions.k8s.io"]
+   resources: ["customresourcedefinitions"]
+   verbs: ["get", "list", "watch"]
```

``` bash
➜ k3s kubectl apply -f ./dashboard.yaml
```

应用后，由于是单节点部署直接访问 server(master) 的 30002 端口例如 [http://192.168.1.1:30002](http://192.168.1.1:30002)。

**使用 ingress 暴露**

k3s 内置的 `ingress` 为 `traefik`，只要满足几个条件任意的 `ingress` 都能够暴露 `dashboard`。

1. `ingress` 到 `pod(backend)` 的访问支持 `https`。
2. `ingress` 到 `pod(backend)` 的 `https` 访问支持跳过 `tls` 校验，或者支持指定 `ca` 证书校验。

修改 traefik 的配置

``` bash
➜ kubectl edit cm traefik -n kube-system
```

按照下文修改 `traefik` 增加 `insecureSkipVerify` 选项，保证 `ingress` 到对应 `pod(backend)` 的 `https` 访问跳过 `tls` 验证。毕竟我们一般没法用到正常的证书，所以 `ingress` 去访问 `pod(backend)` 需要跳过验证。

``` diff
apiVersion: v1
  data:
    traefik.toml: |
      # traefik.toml
      logLevel = "info"
+     insecureSkipVerify = true
```

重启 traefik

``` bash
➜ kubectl get po -n kube-system
NAME                                     READY   STATUS      RESTARTS   AGE
coredns-88dbd9b97-2kbtb                  1/1     Running     1          23h
local-path-provisioner-7ff9579c6-r5zd6   1/1     Running     1          23h
svclb-traefik-nbctb                      2/2     Running     2          23h
metrics-server-7b4f8b595-qzh6c           1/1     Running     1          23h
helm-install-traefik-nkpgh               0/1     Completed   0          2m51s
traefik-5bf464fc54-5nwk4                 1/1     Running     0          21s
➜ kubectl delete po traefik-5bf464fc54-5nwk4 -n kube-system
```

新建一个文件 `dashboard-ingress.yaml`

``` yaml
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: dashboard-ingress
  # 命名空间需要设置为 kubernetes-dashboard
  namespace: kubernetes-dashboard
  annotations:
    kubernetes.io/ingress.class: "traefik"
    # 指定访问 pod 的协议方式，这里改成 https
    ingress.kubernetes.io/protocol: "https"
spec:
  rules:
    # 域名方式暴露
    - host: dashboard.zeromake.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                # 暴露的服务名
                name: kubernetes-dashboard
                port:
                  # 服务的 port
                  number: 443
```

``` bash
➜ k3s kubectl apply -f ./dashboard-ingress.yaml
```

应用后，由于是单节点部署直接访问 server(master) 的 80 端口，但是需要指定域名可以手动写入 host 或者解析一个域名，[http://dashboard.zeromake.com](http://dashboard.zeromake.com)

**使用自签证书**

先生成自签证书，可以用 `openssl`，[mkcert](https://github.com/FiloSottile/mkcert)，[generate_cert.go](https://github.com/golang/go/blob/master/src/crypto/tls/generate_cert.go)，这里我直接用 go 自带的 `generate_cert.go`。

```bash
➜ go run $GOROOT/src/crypto/tls/generate_cert.go -host dashboard.zeromake.com
2021/07/31 12:36:49 wrote cert.pem
2021/07/31 12:36:49 wrote key.pem
# 重命名为需要的文件名
➜ mv key.pem dashboard.key && mv cert.pem dashboard.crt
```

把上面生成的证书放到 kubernetes secret 里，由于 dashboard 需要的文件名与 ingress 不同，我们还需要单独建一个 ingress 用的 secret。

``` bash
# 删除 kubernetes-dashboard-certs 重新建一个，实际上没有什么意义可以只在 ingress 做证书。
# ➜ kubectl delete secret kubernetes-dashboard-certs -n kubernetes-dashboard
# secret "kubernetes-dashboard-certs" deleted
# ➜ kubectl create secret generic kubernetes-dashboard-certs --from-file="$PWD/dashboard.crt,$PWD/dashboard.key" -n kubernetes-dashboard
# secret/kubernetes-dashboard-certs created
# 给 ingress 创建 secret
➜ kubectl create secret tls dashboard-ingress-certs --key dashboard.key --cert dashboard.crt -n kubernetes-dashboard
secret/dashboard-ingress-certs created
```

修改一下上面的 `dashboard-ingress.yaml`

``` yaml
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: dashboard-ingress
  # 命名空间需要设置为 kubernetes-dashboard
  namespace: kubernetes-dashboard
  annotations:
    kubernetes.io/ingress.class: "traefik"
    # 指定访问 pod 的协议方式，这里改成 https
    ingress.kubernetes.io/protocol: "https"
spec:
  tls:
    - hosts:
      - dashboard.zeromake.com
      # 使用刚刚的 secret 为 dashboard.zeromake.com 增加 tls
      secretName: dashboard-ingress-certs
  rules:
    # 域名方式暴露
    - host: dashboard.zeromake.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                # 暴露的服务名
                name: kubernetes-dashboard
                port:
                  # 服务的 port
                  number: 443
```

``` bash
➜ k3s kubectl apply -f ./dashboard-ingress.yaml
```

应用后，由于是单节点部署直接访问 server(master) 的 443 端口，但是需要指定域名可以手动写入 host 或者解析一个域名，[https://dashboard.zeromake.com](https://dashboard.zeromake.com)

## 参考

- [k3s 官方中文文档](https://docs.rancher.cn/docs/k3s/_index)
- [rancher 软件包国内镜像](http://mirror.cnrancher.com)
- [K3s离线安装](https://www.cnblogs.com/k3s2019/p/14339547.html)
- [在k3s中启用其自带ingress](https://www.jianshu.com/p/0040e8bd6d1e)
- [在K3S中启动traefik dashboard及配置ingress](https://www.jianshu.com/p/a1fd06d902bf)
- [使用 traefik ingress 暴露 kubernetes-dashbord(TLS)](https://blog.csdn.net/lwlfox/article/details/113403133)
- [ingress unknown field serviceName](https://stackoverflow.com/questions/67172481/kubernetes-ingress-unknown-field-servicename-in-io-k8s-api-networking-v1-ingr)
- [extensions/v1beta1 deprecated](https://stackoverflow.com/questions/66080909/logs-complaining-extensions-v1beta1-ingress-is-deprecated)
- [Dashboard 使用 Ingress-Nginx 访问](https://cloud.tencent.com/developer/article/1638856)
