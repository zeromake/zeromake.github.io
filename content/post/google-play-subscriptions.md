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

## 前言

由于 Google Play 的订阅有 13 种状态，在各种状态流转的复杂性超过我的想象，甚至有推送消息内的触发时间更早的消息更晚到的情况。

这里写一篇博文来记录各种坑。

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

## 二、订阅流程

测试的订阅在购买后的 5 分钟内如果没有确认该订阅商品，否则会自动退款并关闭订阅。


![subscription-flow](/public/img/google-play/subscription-flow.svg)


<details>
<summary>数据示例</summary>

订阅发起:
``` json
// 2021/10/25 11:49:11 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635133750992","subscriptionNotification":{"version":"1.0","notificationType":4,"purchaseToken":"token","subscriptionId":"sku"}}

// 2021/10/25 11:49:12 purchase
{"autoRenewing":true,"countryCode":"US","expiryTimeMillis":"1635134157989","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57296937369853","orderId":"GPA.61","paymentState":1,"priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635133750347"}
```

续订成功：
```json
// 2021/10/25 11:53:29 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635134007674","subscriptionNotification":{"version":"1.0","notificationType":2,"purchaseToken":"token","subscriptionId":"sku"}}

// 2021/10/25 11:53:30 purchase
{"acknowledgementState":1,"countryCode":"US","expiryTimeMillis":"1635133706342","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57296301053176","orderId":"GPA.61..0","priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635133124357","userCancellationTimeMillis":"1635133460780"}
```

续订失败(进入宽待期):
``` json
// 2021/10/25 11:59:04 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635134341983","subscriptionNotification":{"version":"1.0","notificationType":6,"purchaseToken":"token","subscriptionId":"sku"}}

// 2021/10/25 11:59:04 purchase
{"acknowledgementState":1,"autoRenewing":true,"countryCode":"US","expiryTimeMillis":"1635134464683","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57296937369853","orderId":"GPA.61..1","priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635133750347"}
```


续订失败(进入保留期):
``` json
// 2021/10/25 12:04:01 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635134639719","subscriptionNotification":{"version":"1.0","notificationType":5,"purchaseToken":"token","subscriptionId":"com.android.499"}}

// 2021/10/25 12:04:02 purchase
{"acknowledgementState":1,"autoRenewing":true,"countryCode":"US","expiryTimeMillis":"1635134637989","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57296937369853","orderId":"GPA.61..1","priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635133750347"}
```

恢复订阅(注意这个恢复需要根据业务来处理，如果你在宽带期发过周期性奖励，这里就不能再次发放，只能发放持续奖励)：
``` json
// 2021/10/25 12:05:54 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635134752789","subscriptionNotification":{"version":"1.0","notificationType":1,"purchaseToken":"token","subscriptionId":"com.android.499"}}

// 2021/10/25 12:05:55 purchase
{"acknowledgementState":1,"autoRenewing":true,"countryCode":"US","expiryTimeMillis":"1635135172433","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57296937369853","orderId":"GPA.61..1","paymentState":1,"priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635133750347"}
```


用户订阅暂停计划触发通知:
``` json
// 2021/10/25 12:11:41 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635135099444","subscriptionNotification":{"version":"1.0","notificationType":11,"purchaseToken":"token","subscriptionId":"com.android.499"}}

// 2021/10/25 12:11:41 purchase
{"acknowledgementState":1,"autoRenewing":true,"autoResumeTimeMillis":"1635135772433","countryCode":"US","expiryTimeMillis":"1635135592433","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57296937369853","orderId":"GPA.61..2","paymentState":1,"priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635133750347"}
```

订阅已经暂停:
```json
// 2021/10/25 12:17:55 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635135473787","subscriptionNotification":{"version":"1.0","notificationType":10,"purchaseToken":"token","subscriptionId":"com.android.499"}}

// 2021/10/25 12:17:56 purchase
{"acknowledgementState":1,"autoRenewing":true,"autoResumeTimeMillis":"1635135772433","countryCode":"US","expiryTimeMillis":"1635135472433","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57296937369853","orderId":"GPA.61..2","paymentState":1,"priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635133750347"}
```

从暂停计划恢复
```json
// 2021/10/25 12:22:58 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635135776362","subscriptionNotification":{"version":"1.0","notificationType":1,"purchaseToken":"token","subscriptionId":"com.android.499"}}

// 2021/10/25 12:22:59 purchase
{"acknowledgementState":1,"autoRenewing":true,"countryCode":"US","expiryTimeMillis":"1635136195923","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57296937369853","orderId":"GPA.61..3","paymentState":1,"priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635133750347"}
```

取消订阅:
```json
// 2021/10/25 12:24:26 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635135864707","subscriptionNotification":{"version":"1.0","notificationType":3,"purchaseToken":"token","subscriptionId":"com.android.499"}}

// 2021/10/25 12:24:27 purchase
{"acknowledgementState":1,"countryCode":"US","expiryTimeMillis":"1635136075923","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57296937369853","orderId":"GPA.61..3","paymentState":1,"priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635133750347","userCancellationTimeMillis":"1635135864171"}
```

订阅已到期：
``` json
// 2021/10/25 15:54:05 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635148443335","subscriptionNotification":{"version":"1.0","notificationType":13,"purchaseToken":"token","subscriptionId":"com.android.499"}}

// 2021/10/25 15:54:06 purchase
{"acknowledgementState":1,"countryCode":"US","expiryTimeMillis":"1635147242010","orderId":"GPA.44..3","priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635145747564","userCancellationTimeMillis":"1635146950247"}
```

取消后未到期的情况在 Play 后台恢复订阅(会把之前的uid复制过来)
```json
// 2021/10/25 15:56:21 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635148579496","subscriptionNotification":{"version":"1.0","notificationType":7,"purchaseToken":"token","subscriptionId":"com.android.499"}}

// 2021/10/25 15:56:21 purchase
{"acknowledgementState":1,"autoRenewing":true,"countryCode":"US","expiryTimeMillis":"1635148830612","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57311609629510","orderId":"GPA.30","paymentState":1,"priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635148415972"}
```


到期后通过 Play 重新订阅(没有对应的商品和账号，需要客户端配合做恢复订阅功能)
```json
// 2021/10/25 16:03:38 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635149016374","subscriptionNotification":{"version":"1.0","notificationType":4,"purchaseToken":"token","subscriptionId":"com.android.499"}}

// 2021/10/25 16:03:39 purchase
{"autoRenewing":true,"countryCode":"US","expiryTimeMillis":"1635149433007","orderId":"GPA.87","paymentState":1,"priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635149015784"}
```

取消后在未到期的情况下再一次从 app 里购买(一次性周期奖励这里可不能再发放，不过这里没有明确的说明为已经有一个订阅在过程中，需要自己用过期时间判断)
```json
// 2021/10/28 15:40:54 subscription
{"version":"1.0","packageName":"com.bingo.crown.android","eventTimeMillis":"1635406853999","subscriptionNotification":{"version":"1.0","notificationType":4,"purchaseToken":"token","subscriptionId":"600271.com.bingo.crown.android.elite.499"}}

// 2021/10/28 15:40:55 purchase
{"autoRenewing":true,"countryCode":"US","expiryTimeMillis":"1635407160887","kind":"androidpublisher#subscriptionPurchase","linkedPurchaseToken":"token","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57570050407351","orderId":"GPA.04","paymentState":1,"priceAmountMicros":"5015570","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635406853066"}
```
</details>

## 三、订阅客户端调起

和内购不一样的地方是，查询 sku 时需要设置为订阅类型，购买后的 token 也无法用于服务端确认，订阅也没有客户端消耗的逻辑。

查询 `sku`

```java
ArrayList<String> list = new ArrayList<String>();
SkuDetailsParams params = SkuDetailsParams.newBuilder()
    .setType(com.android.billingclient.api.BillingClient.SkuType.SUBS)
    .setSkusList(list)
    .build();
billingClient.querySkuDetailsAsync(params, this);
```

发起购买:
```java
SkuDetails skuDetail;
BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
    .setSkuDetails(skuDetail)
    .setObfuscatedProfileId("self-order-id")
    .setObfuscatedAccountId("self-user-id")
    .build();
BillingResult result = this.bc.launchBillingFlow(this, billingFlowParams);
```

## 四、服务端处理订阅发起

最上面设置了主题和订阅的地址，在订阅发生变化时会由 google 向我们设置的地址推送消息。


```go
package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
)


// SubscriptionNotification https://developer.android.google.cn/google/play/billing/rtdn-reference#sub
type SubscriptionNotification struct {
	Version          string `json:"version,omitempty"`          // 版本
	NotificationType int    `json:"notificationType,omitempty"` // 变化类型
	PurchaseToken    string `json:"purchaseToken,omitempty"`    // 支付令牌
	SubscriptionId   string `json:"subscriptionId,omitempty"`   // 商品 id
}

type OneTimeProductNotification struct {
	Version          string `json:"version,omitempty"`          // 版本
	NotificationType int    `json:"notificationType,omitempty"` // 变化类型
	PurchaseToken    string `json:"purchaseToken,omitempty"`    // 支付令牌
	SKU              string `json:"sku,omitempty"`
}

type TestNotification struct {
	Version string `json:"version,omitempty"` // 版本
}

type SubscriptionData struct {
	Version                    string                      `json:"version,omitempty"`
	PackageName                string                      `json:"packageName,omitempty"`
	EventTimeMillis            string                      `json:"eventTimeMillis,omitempty"`
	SubscriptionNotification   *SubscriptionNotification   `json:"subscriptionNotification,omitempty"`
	OneTimeProductNotification *OneTimeProductNotification `json:"oneTimeProductNotification,omitempty"`
	TestNotification           *TestNotification           `json:"testNotification,omitempty"`
}


type pushRequest struct {
	Message      pubsub.PubsubMessage `json:"message"`
	Subscription string               `json:"subscription"`
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/sub", func(w http.ResponseWriter, req *http.Request) {
		defer req.Body.Close()
		body, _ := io.ReadAll(req.Body)

		var pr pushRequest
		err = json.Unmarshal(body, &pr)
		if err != nil {
			return
		}
		dataByte, err := base64.StdEncoding.DecodeString(pr.Message.Data)
		if err != nil {
			return
		}
		var subscriptionData = &config.SubscriptionData{}
		err = json.Unmarshal(dataByte, subscriptionData)
		if err != nil {
			return
		}
		if subscriptionData.SubscriptionNotification == nil {
			return
		}
        switch subscriptionData.SubscriptionNotification.NotificationType {
            // 自行根据状态来处理
        }
		// 返回 200 状态通知 google 这个通知已经接受
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		_, _ = fmt.Fprintln(w, "ok")
	})
	http.ListenAndServe(":8000", mux)
}
```

## 五、服务端处理订阅状态变化

在订阅中有几个状态需要特别注意，如果你的订阅商品除了类似 buff 的周期性奖励还有每次的一次性奖励，不注意的话会出现被刷。

### 取消后立即订阅
> 4:开始订阅 -> 3:取消订阅 -> 4:在未到期之前在 app 里又一次订阅(由于类型还是 4 可能会再一次发放奖励)。

取消订阅:
```json
// 2021/10/25 12:24:26 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635135864707","subscriptionNotification":{"version":"1.0","notificationType":3,"purchaseToken":"token","subscriptionId":"com.android.499"}}

// 2021/10/25 12:24:27 purchase
{"acknowledgementState":1,"countryCode":"US","expiryTimeMillis":"1635136075923","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57296937369853","orderId":"GPA.61..3","paymentState":1,"priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635133750347","userCancellationTimeMillis":"1635135864171"}
```
再次从商店订阅需要自己用过期时间判断:
```json
// 2021/10/28 15:40:54 subscription
{"version":"1.0","packageName":"com.bingo.crown.android","eventTimeMillis":"1635406853999","subscriptionNotification":{"version":"1.0","notificationType":4,"purchaseToken":"token","subscriptionId":"600271.com.bingo.crown.android.elite.499"}}

// 2021/10/28 15:40:55 purchase
{"autoRenewing":true,"countryCode":"US","expiryTimeMillis":"1635407160887","kind":"androidpublisher#subscriptionPurchase","linkedPurchaseToken":"token","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57570050407351","orderId":"GPA.04","paymentState":1,"priceAmountMicros":"5015570","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635406853066"}
```


### 宽待期

续订失败(进入宽待期):
``` json
// 2021/10/25 11:59:04 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635134341983","subscriptionNotification":{"version":"1.0","notificationType":6,"purchaseToken":"token","subscriptionId":"sku"}}

// 2021/10/25 11:59:04 purchase
{"acknowledgementState":1,"autoRenewing":true,"countryCode":"US","expiryTimeMillis":"1635134464683","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57296937369853","orderId":"GPA.61..1","priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635133750347"}
```

### 保留期

续订失败(进入保留期):
``` json
// 2021/10/25 12:04:01 subscription
{"version":"1.0","packageName":"com.google.android","eventTimeMillis":"1635134639719","subscriptionNotification":{"version":"1.0","notificationType":5,"purchaseToken":"token","subscriptionId":"com.android.499"}}

// 2021/10/25 12:04:02 purchase
{"acknowledgementState":1,"autoRenewing":true,"countryCode":"US","expiryTimeMillis":"1635134637989","obfuscatedExternalAccountId":"1","obfuscatedExternalProfileId":"57296937369853","orderId":"GPA.61..1","priceAmountMicros":"5017006","priceCurrencyCode":"USD","purchaseType":0,"startTimeMillis":"1635133750347"}
```

## 参考

- [谷歌订阅接入文档](https://developer.android.google.cn/google/play/billing/subscriptions)
- [谷歌推送配置文档](https://cloud.google.com/pubsub/docs/push)
- [推送的云平台配置说明](https://developer.android.google.cn/google/play/billing/getting-ready#configure-rtdn)
- [实时开发者通知参考指南](https://developer.android.google.cn/google/play/billing/rtdn-reference)
- [googlePlay订阅商品对接流程](https://blog.csdn.net/diaomeng11/article/details/103237874)
- [IAP 订阅后端踩坑总结之 Google 篇](https://www.cnblogs.com/Fushengliangnian/p/11190538.html)
- [Android 接入Google应用订阅与应用内支付结算笔记](https://blog.csdn.net/wjj1996825/article/details/80862349)
