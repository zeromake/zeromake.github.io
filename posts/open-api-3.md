---

title: openapi3 使用
date: 2018-03-07 10:22:00+08:00
type: resetful
tags: [resetful, api]
last_date: 2018-03-07 10:22:00+08:00
...

## 前言

1. 最近一直在用业余时间写一个个人项目,其中为了学习各种 `python` 新特性, 使用了各种新技术其中就使用了 openapi3 来描述 api。
2. 这篇博文就来说明和封装一套生成 openapi 配置。
3. 这里只讲述 openapi3 的配置结构，并与官方文档统一使用 `yaml` 格式来说明。
4. 由于使用 `python` 代码中的配置与 `json` 格式相同。
5. 在阅读此文前请自行了解 `json`, `yaml`。`python` 生成代码部分可无视。
    <!--more-->

## 一、openapi 整体结构

[官方文档](https://swagger.io/docs/specification/basic-structure/)

```yaml
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

把以上代码贴到 [Swagger Editor](https://editor.swagger.io) 可以看到如下效果:

![初始化](/public/img/openapi3/init.png)

### 构造 ApiSpec 对象, 简单的生成配置函数

```python
import yaml


class ApiSpec:
    def __init__(self, title, description, version):
        self._paths = {}
        self._tags = []
        self._schemas = {}
        self._parameters = {}
        self._responses = {}
        self._security_schemes = {}
        self._spec = {
            "openapi": "3.0.0",
            "info": {
                "title": title,
                "description": description,
                "version": version
            },
            "paths": self._paths,
            "tags": self._tags,
            "components": {
                "schemas": self._schemas,
                "parameters": self._parameters,
                "responses": self._responses,
                "securitySchemes": self._security_schemes
            }
        }
    def to_dict(self):
        return self._spec

    def to_yaml(self):
        return yaml.dump(self.to_dict())
if __name__ == "__main__":
    print(ApiSpec("测试", "测试api", "0.0.1").to_yaml())
```

最终会生成如下 `yaml` 代码实际上是和上面的示例等价。

```yaml
components:
    parameters: {}
    responses: {}
    schemas: {}
    securitySchemes: {}
info: { description: "\u6D4B\u8BD5api", title: "\u6D4B\u8BD5", version: 0.0.1 }
openapi: 3.0.0
paths: {}
tags: []
```

## 二、添加一个 api

这里只写代码片段

### 响应体

[path 文档](https://swagger.io/docs/specification/paths-and-operations/)
[响应文档](https://swagger.io/docs/specification/describing-responses/)

```yaml
paths:
    /user: # url
        get: # 请求方法
            responses: # 响应
                200: # 响应状态
                    description: ok # 响应说明
                    content: # 响应内容
                        application/json: # 响应格式
                            schema: # 格式描述
                                type: object # 类型(integer|number|boolean|string| array|object)
                                properties: # object 专用用于描述各个字段
                                    name: # 字段名
                                        type: string # 字段类型可继续使用 object 向下继续描述
                                        description: 名字 # 字段说明
                                    email:
                                        type: string
                                        description: 邮箱
                                    tags:
                                        type: array
                                        description: 标签
                                        items: # array专用 描述item
                                            type: string
```

-   上面的 `application/json` 可用换成支持的格式如 `text/yaml`
-   暂不支持 `map[string]any` 之类的类型
-   显示效果:
    ![get-api.png](/public/img/openapi3/responses.png)

### url 参数

[官方文档](https://swagger.io/docs/specification/describing-parameters/)

```yaml
paths:
    /user/{user_id}:
        get:
            parameters:
                - in: path
                  name: user_id
                  schema:
                      type: integer
                  required: true
                  description: 用户id
                - in: query
                  name: order
                  schema:
                      type: integer
                  description: 排序
```

还有一些在 `Cookie`, `Header` 中的配置，这里就不一一说明了，请自行阅读 [官方文档](https://swagger.io/docs/specification/describing-parameters/)

### 内容体参数

[官方文档](https://swagger.io/docs/specification/describing-request-body/)

```yaml
paths:
    /user:
        post:
            requestBody: # 内容体描述
                description: 内容体说明可用*markdown* # 说明可用markdown
                required: true # 是否必须传递内容体
                content: # 这里往下与 `responses` 的完全相同
                    application/json:
                        schema:
                            type: object
                            properties:
                                name:
                                    type: string
            responses:
                200:
                    description: ok
```

效果:
![requestBody.png](/public/img/openapi3/request-body.png)

## 对象引用

[\$ref 文档](https://swagger.io/docs/specification/using-ref/)
[schema 使用\$ref]()
