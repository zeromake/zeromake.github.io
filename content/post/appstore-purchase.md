---
title: AppStore 内购接入
date: 2021-04-29 15:46:26 +08:00
tags:
  - ios
  - object-c
  - golang
lastmod: 2021-04-29 15:46:26 +08:00
categories:
  - appstore
  - pay
slug: appstore-purchase
draft: true
---

## 前言

## 一、准备

## 二、客户端


## 三、服务端

服务端需要几个参数才能够进行校是否成功支付

<!-- 1. `transaction_id` 支付交易的唯一标识(可以看成是订单 id)，购买完成后回调的 transaction 里可以获得。 -->
1. `receipt_data` 购买校验凭证，购买完成后回调的 transaction 里可以获得。
1. `secret` 后端用来请求苹果校验服务器的密码。

```go
package main

import (
	"context"
	"github.com/awa/go-iap/appstore"
)

func PurchaseVerify(
  ctx context.Context,
  receiptData,
  secret string,
) (*appstore.IAPResponse, error) {
	resp := &appstore.IAPResponse{
		Status: -1,
	}
  // 内部会自动先访问 prod 如果返回 21007 再访问 sandbox
	err := appstore.New().Verify(ctx, appstore.IAPRequest{
		Password: secret,
		ReceiptData: receiptData,
	}, resp)
	if err != nil {
		return nil, err
	}
  	return resp, nil
}
```




## 参考

1. [官方内购文档](https://developer.apple.com/documentation/storekit/in-app_purchase)
1. [verifyReceipt官方文档](https://developer.apple.com/documentation/appstorereceipts/verifyreceipt)
1. [node.js的内购接入示例](https://github.com/voltrue2/in-app-purchase)
1. [golang的内购帮助sdk](https://github.com/awa/go-iap)
1. [苹果内购防丢单策略](https://www.jianshu.com/p/3546f78d8db9)
