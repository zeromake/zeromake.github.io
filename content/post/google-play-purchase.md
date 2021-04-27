---
title: google play 内购接入
date: 2021-04-25 15:46:26 +8:00
tags:
  - android
  - java
lastmod: 2021-04-25 15:46:26 +8:00
categories:
  - google
  - pay
slug: google-play-purchase
draft: true
---

## 前言

## 一、预先准备

### 1.1 Google 开发者账号

进入 [Google Play控制台](https://play.google.com/console) 注册并支付费用，然后创建一个新的应用，用之前的应用也可以但是没有办法发布到各个流水线上。

### 1.2 安卓开发环境

安卓开发环境就不用说了，主要说一下创建的项目的包名必须是 google play 上没有的，在 `app/build.gradle` 加入以下依赖：

``` gradle
dependencies {
  def billing_version = "3.0.3"
  implementation "com.android.billingclient:billing:$billing_version"
}
```

然后打包带签名的 release 版本，上传到内部测试，保存并发布，这个时候你才能添加商品。


### 1.3 支持 Google Play 内购的安卓系统

正常的模拟器会直接显示设备不支持内购，需要下载带 Google APIs 的镜像才能支持，或者找个带 google 框架的实体机器。
### 1.4 支持 Google Play 内购的账号

所在地区必须是国外，我有一个香港所属地的无法使用内购，可以尝试切换到外国地区（我没成功）。


## 二、流程

1. 客户端通过商品列表中的 sku(商品ID)，向 google play 获取 skuDetail(商品详情)。
2. 客户端通过商品创建一个自己的订单，并且客户端通过该订单id发起一个支付。
3. 支付完成需要服务端验证，服务端会判断是否付款且将订单进行确认，验证后客户端需要进行订单消耗。


## 注意点

1. 发起支付时 ProfileId, AccountId 必须一同设置，否则会触发 onPurchasesUpdated 的 `BillingResponseCode.DEVELOPER_ERROR` 错误，但是实际上是缺少 ProfileId。
2. 所有订单都有 待支付、已支付待确认、已支付并确认待消耗，已完成，客户端需要启动时检查一些特殊状态的订单使用 `queryPurchases`。
3. 测试支付不需要等 google play 内部测试通道发布，只需要上传过一次 apk 设置好账号即可在本地进行调试，无需使用 release 模式也不需要签名。
4. google账号需要在外国地区并添加了支付方式，有两个地方需要设置测试白名单，一个是控制台的 设置-许可测试 这个不设置的话会没法用测试支付，还有一个地方是控制台的应用的内部测试的测试用户数量，生效时间不定一般在几个小时左右，最长不会超过 24 小时。
5. 服务账号的权限就算是新建的账号邀请到 play 后台也需要一段时间生效，最长不会超过 24 小时。
6. google play 后台的订单更新在内部测试的情况下在 5 分钟更新一次。


## 参考

1. [Google支付接入](https://www.cnblogs.com/alphagl/p/6013625.html)
2. [简单 3 步配置 Google Play Billing](https://mp.weixin.qq.com/s/QQg4ttdnn6XLrOBZIDsEQA)
3. [In-app billing API version 3 is not supported on this device](https://blog.csdn.net/u013762572/article/details/108478969)
2. [Google结算服务文档](https://developer.android.com/google/play/billing)
3. [官方示例](https://github.com/android/play-billing-samples)
4. [](https://stackoverflow.com/questions/43536904/google-play-developer-api-the-current-user-has-insufficient-permissions-to-pe)
