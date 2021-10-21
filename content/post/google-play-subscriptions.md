---
title: google play 订阅接入
date: 2021-10-14 14:38:26 +08:00
tags:
  - android
  - java
  - golang
lastmod: 2021-10-14 14:38:26 +08:00
categories:
  - google
  - pay
slug: google-play-subscriptions
draft: false
---

## 一、Google 开发者平台配置回调

> [使用推送订阅](https://cloud.google.com/pubsub/docs/push) 貌似官方文档说不用网域验证了。

~~先把域名添加到 search 后台，打开 [search-console](https://search.google.com/search-console/welcome)，选择网域填写域名，获得要验证的 DNS 记录，填写到 DNS 配置后台的 TXT 记录里，然后直接验证，在 Cloud 控制台的 [网域验证](https://console.cloud.google.com/apis/credentials/domainverification) 添加白名单。~~


去 [主题](https://console.cloud.google.com/cloudpubsub/topic/list) 页面创建好新的主题。

![google-cloud-create-top](/public/img/google-play/google-cloud-create-top.png)

并且需要设置 `google-play-developer-notifications@system.gserviceaccount.com` 的账号为发布者，文档见

![google-cloud-top-publisher](/public/img/google-play/google-cloud-top-publisher.png)


到 [订阅](https://console.cloud.google.com/cloudpubsub/subscription/list) 面板发现已经有一个 Pull 类型的订阅了，不用理，新建一个订阅设置为推送模式，设置对应要推送的地址，下面还有一个 `重试政策` 设置建议改成 `在按照指数退避算法确定的延迟时间后重试`。

![google-cloud-create-sub](/public/img/google-play/google-cloud-create-sub.png)


最后通过 [创收设置](https://play.google.com/console/u/0/developers/${developer}/app/${app_id}/monetization-setup) 来检查是否能够由 google 来通知到我们。

![google-play-publish-test](/public/img/google-play/google-play-publish-test.png)

下面是一个简单的 http 服务，可以选择使用 `ngrok` 或者自己的域名加外网服务器去实现 `https`。

```go
package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/sub", func(w http.ResponseWriter, req *http.Request) {
		defer req.Body.Close()
		log.Println("Authorization:", req.Header.Get("Authorization"))
		body, _ := io.ReadAll(req.Body)
		log.Println("Body:", string(body))
		// 返回 200 状态通知 google 这个通知已经接受
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		_, _ = fmt.Fprintln(w, "ok")
	})
	http.ListenAndServe(":8000", mux)
}

```

接收到的数据会像下面的格式。

```bash
Authorization: Bearer eyJhbGciOiJSUzI1Ni..
Body: {
    "message":{
        "data": "eyJ2ZXJzaW9u..",
        "messageId": "3220015587906257",
        "publishTime": "2021-10-15T03:27:58.356Z"
    },
    "subscription": "上面的主题"
}
```

## 二、Google 后台配置商品

## 三、订阅流程

## 四、订阅客户端调起

## 五、服务端处理订阅发起

## 六、服务端处理订阅状态变化

## 七、Google 回调失败处理


## 参考

- [谷歌订阅接入文档](https://developer.android.google.cn/google/play/billing/subscriptions)
- [谷歌推送配置文档](https://cloud.google.com/pubsub/docs/push)
- [推送的云平台配置说明](https://developer.android.google.cn/google/play/billing/getting-ready#configure-rtdn)
- [实时开发者通知参考指南](https://developer.android.google.cn/google/play/billing/rtdn-reference)
- [googlePlay订阅商品对接流程](https://blog.csdn.net/diaomeng11/article/details/103237874)
- [IAP 订阅后端踩坑总结之 Google 篇](https://www.cnblogs.com/Fushengliangnian/p/11190538.html)
- [Android 接入Google应用订阅与应用内支付结算笔记](https://blog.csdn.net/wjj1996825/article/details/80862349)
