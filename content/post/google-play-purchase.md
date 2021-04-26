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

### 1.2 安卓开发环境

安卓开发环境就不用说了，主要说一下创建的项目的包名必须是 google play 上没有的，在 `app/build.gradle` 加入以下依赖：

``` gradle
dependencies {
  def billing_version = "3.0.3"
  implementation "com.android.billingclient:billing:$billing_version"
}
```


### 1.3 支持 Google Play 的实体机器

> 模拟器会直接显示设备不支持内购。

### 1.4 支持 Google Play 内购的账号

> 所在地区必须是国外，我有一个香港所属地的无法使用内购，可以尝试切换到外国地区。


## 二、


## 参考

1. [Google支付接入](https://www.cnblogs.com/alphagl/p/6013625.html)
2. [简单 3 步配置 Google Play Billing](https://mp.weixin.qq.com/s/QQg4ttdnn6XLrOBZIDsEQA)
3. [In-app billing API version 3 is not supported on this device](https://blog.csdn.net/u013762572/article/details/108478969)
2. [Google结算服务文档](https://developer.android.com/google/play/billing)
3. [官方示例](https://github.com/android/play-billing-samples)
4. [](https://stackoverflow.com/questions/43536904/google-play-developer-api-the-current-user-has-insufficient-permissions-to-pe)
