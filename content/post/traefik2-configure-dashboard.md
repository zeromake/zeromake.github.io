---
title: 使用traefik2暴露k8s-dashboard
date: 2021-12-20 12:25:00 +08:00
tags:
  - k8s
  - traefik
  - dashboard
lastmod: 2021-12-20 12:25:00 +08:00
categories:
  - cloud
slug: traefik2-configure-dashboard
---


## 前言

在之前的 [k3s 安装笔记](/pages/k3s-install) 里有怎么使用 `traefik1` 去暴露 `k8s-dashboard` 的 `https` 端口。

<!--more-->

## 一、tls 自签证书

这里就直接用 `crypto/tls/generate_cert.go` 生成了

```bash
➜ go run $GOROOT/src/crypto/tls/generate_cert.go -host dashboard.zeromake.com
2021/07/31 12:36:49 wrote cert.pem
2021/07/31 12:36:49 wrote key.pem
# 重命名为需要的文件名
➜ mv key.pem dashboard.key && mv cert.pem dashboard.crt
```

把上面生成的证书放到 kubernetes secret 里，由于 dashboard 需要的文件名与 ingress 不同，我们还需要单独建一个 ingress 用的 secret。

``` bash
# 给 ingress 创建 secret
➜ kubectl create secret tls dashboard-ingress-certs --key dashboard.key --cert dashboard.crt -n  kubernetes-dashboard
secret/dashboard-ingress-certs created
```

## 二、使用 ingress 注解去配置


```yaml
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: dashboard-ingress
  namespace: kubernetes-dashboard
  annotations:
    kubernetes.io/ingress.class: "traefik"
    ingress.kubernetes.io/protocol: "https"
    traefik.ingress.kubernetes.io/service.serverstransport: traefik-servers-transport
spec:
  tls:
    - hosts:
      - dashboard.zeromake.com
      secretName: dashboard-ingress-certs
  rules:
    - host: dashboard.zeromake.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: kubernetes-dashboard
                port:
                  number: 443
---
apiVersion: traefik.containo.us/v1alpha1
kind: ServersTransport
metadata:
  name: traefik-servers-transport
  namespace: kubernetes-dashboard
spec:
  serverName: "test"
  insecureSkipVerify: true
```


## 三、使用 IngressRoute

``` yaml
apiVersion: traefik.containo.us/v1alpha1
kind: ServersTransport
metadata:
  name: traefik-servers-transport
  namespace: kubernetes-dashboard
spec:
  serverName: "test"
  insecureSkipVerify: true
---
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: kubernetes-dashboard-route
  namespace: kubernetes-dashboard
spec:
  entryPoints:
    - websecure
  tls:
    secretName: dashboard-ingress-certs
  routes:
  - match: Host(`dashboard.zeromake.com`)
    kind: Rule
    services:
      - name: kubernetes-dashboard
        port: 443
        scheme: https
        serversTransport: traefik-servers-transport
```

四、参考

- [How to customize traefik2 config](https://github.com/k3s-io/k3s/issues/4589)
