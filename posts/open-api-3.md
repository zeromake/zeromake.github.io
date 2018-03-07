title: openapi3使用
date: 2018-03-07 10:22:00+08:00
type: resetful
tags: [resetful, api]
last_date: 2018-03-07 10:22:00+08:00

## 前言

1. 最近一直在用业余时间写一个个人项目,其中为了学习各种 `python` 新特性, 使用了各种新技术其中就使用了openapi3来描述api。
2. 这篇博文就来说明和封装一套生成 openapi 配置。
3. 这里只讲述 openapi3 的配置结构，并与官方文档统一使用 `yaml` 格式来说明。
4. 由于使用 `python` 代码中的配置与 `json` 格式相同。
5. 在阅读此文前请自行了解 `json`, `yaml`。`python` 生成代码部分可无视。

## 一、openapi整体结构

``` yaml
openapi: 3.0.0 # 指定openapi版本
info: # 说明当前文档信息
    title: 测试 # 标题
    description: 测试api # 具体说明支持 markdown
    version: 0.0.1 # 版本
paths: {} # 各个url下的api说明对象
tags: [] # 分组用的tag
components: # 多次复用的一些对象
    schemas: {} # 复用的数据结构
    parameters: {} # 复用的请求参数
    responses: {} # 复用的响应参数
    securitySchemes: {} # 认证信息
```

把以上代码贴到 [Swagger Editor](https:#editor.swagger.io) 可以看到如下效果:

![初始化](/public/img/openapi3/init.png)

### 构造python对象

``` python
class ApiSpec:
    def __init__(self, title, description, version):
        self._paths = {}
        self._tags = []
        self._spec = {
            "openapi": "3.0.0",
            "info": {
                "title": title,
                "description": description,
                "version": version
            },
            "paths": self._paths,
            "self._tags": self._tags
        }
```
