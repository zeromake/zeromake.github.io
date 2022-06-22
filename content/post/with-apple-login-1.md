---
title: 苹果登录接入(1)
date: 2022-03-24 15:24:26 +08:00
tags:
  - apple
  - ios
  - golang
lastmod: 2022-03-24 15:24:26 +08:00
categories:
  - login
slug: with-apple-login-1
draft: true
---

## 前言

项目需要接入 apple 登录，但是由于网络上的各种资料并不是很详细这边打算写一篇笔记备忘，希望能帮助到有相同问题的人。


## 一、apple 登录流程

![登录流程](/public/img/with-apple-login/with-apple-login.drawio.svg)

## 二、apple 的 keys 获取

```go
import (
	"context"
	"net/http"
	"json"
)

const AppleAuthKeysUrl = "https://appleid.apple.com/auth/keys"

type PublicKey struct {
	Kid string `json:"kid,omitempty"`
	Kty string `json:"kty,omitempty"`
	Use string `json:"use,omitempty"`
	Alg string `json:"alg,omitempty"`
	N   string `json:"n,omitempty"`
	E   string `json:"e,omitempty"`
}

type PublicKeyResponse struct {
	Keys []*PublicKey `json:"keys,omitempty"`
}

// Todo: 有空可以加个 cache 用不着每次都请求
func generatePublicKey(ctx context.Context) (result *PublicKeyResponse, err error) {
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		AppleAuthKeysUrl,
		nil,
	)
	if err != nil {
		return
	}
	resp, err := http.DefaultClient.Do(req)
	defer resp.Body.Close()
	decoder := json.NewDecoder(resp.Body)
	result = &PublicKeyResponse{}
	err = decoder.Decode(result)
	if err != nil {
		return
	}
	return
}
```


## 参考

- [apple帐号登录服务器端接入](http://cwqqq.com/2020/09/27/apple_login_api_server_side)
- [IOS苹果登录sign in with apple后端校验](https://www.cnblogs.com/goloving/p/14349122.html)