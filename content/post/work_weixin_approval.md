---
title: 企业微信审批的坑
date: 2020-07-28 15:27:00+08:00
tags:
  - weixin
lastmod: 2020-07-28 15:27:00+08:00
categories:
  - weixin
slug: work_weixin_approval
draft: true
---

## 前言

最近在处理封装企业微信的审批能力，发生了不少问题记录一下：

1. 审批模版获取与审批填写
2. 审批创建成功，获取审批却报 `no approval auth` 的错

<!--more-->


## 参考

1. [企业微信 API 文档](https://work.weixin.qq.com/api/doc)
2. [企业微信后台](https://work.weixin.qq.com/wework_admin/frame)
