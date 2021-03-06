---
title: go-spring 使用学习
date: 2019-12-21T12:05:26.000Z
tags:
  - go
  - spring
  - learn
lastmod: 2019-12-22T09:20:57.000Z
categories:
  - go
slug: go-spring-learn
draft: false
---

## 前言

- 最近发现了 [go-spring](https://github.com/go-spring/go-spring)
- 看了一下比起其它的 `di` 库感觉挺不错的，写篇博文记录一下

<!--more-->


## 一、安装

``` shell
# 拉取 go spring
$ go get github.com/go-spring/go-spring

# 如果需要使用 go-spring 做 web 服务需要
$ go get github.com/go-spring/go-spring-web
```

~~由于 `go-spring` 现在还是 `beta` 版，每天都有可能有一些重要更新建议拉取最新的 `master`，不过到了后面 `go-spring` 正式版也许就不需要直接手动拉取 `@master` 了，请自行判断。~~

现在 `go-spring` 已经为正式版 `v1.0.2`，可以正确食用了。


## 二、go-spring 项目包结构介绍

``` shell
$ tree . -L 1
.
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── RunAllTests.sh
├── RunCodeCheck.sh
├── RunGoDoc.sh
├── boot-starter
├── go.mod
├── go.sum
├── package-info.go
├── spring-boot
├── spring-core
├── starter-echo
├── starter-gin
└── starter-web

6 directories, 9 files
```

其中 `starter` 本来在 [go-spring-boot-starter](https://github.com/go-spring/go-spring-boot-starter) 仓库里，作者为减少引入包已经把这些 `starter` 移动到了 `go-spring` 仓库里。
`starter` 部分的暂时无视，这样一看就只剩下 `spring-core` 和 `spring-boot`。

- `spring-core` 是用于 IoC 容器注入的核心库。
- `spring-boot` 是使用了 `spring-core` 构建的配置自动载入，还有注入的对象的启动和关闭的统一管理。

## 三、一个简单 gin web 服务

```go
package main

import (
	SpringWeb "github.com/go-spring/go-spring-web/spring-web"
	SpringBoot "github.com/go-spring/go-spring/spring-boot"
	"net/http"

	_ "github.com/go-spring/go-spring/starter-gin"
	_ "github.com/go-spring/go-spring/starter-web"
)

func init() {
	SpringBoot.RegisterBean(new(Controller)).Init(func(c *Controller) {
		SpringBoot.GetMapping("/", c.Home)
	})
}

type Controller struct{}

func (c *Controller) Home(ctx SpringWeb.WebContext) {
	ctx.String(http.StatusOK, "OK!")
}

func main() {
	SpringBoot.RunApplication("config/")
}
```
- 其中 `init` 方法里我们注册了一个 `Controller` 的空实例，这个不一定要在 `init` 中注册，可以在 `SpringBoot.RunApplication` 调用前的任意地方注册，使用 `init` 的原因是可以不依赖包内部方法只需要导入即可注入。
- 然后通过 `InitFunc` 注册路由，`SpringBoot.GetMapping` 是统一封装的路由挂载器
- `Home(ctx SpringWeb.WebContext)` 里的 `SpringWeb.WebContext` 则封装了请求响应操作。
- `github.com/go-spring/go-spring/starter-gin` 导入替换为 `github.com/go-spring/go-spring/starter-echo` 可以直接替换为 `echo` 框架。


``` go
$ go run main.go
[INFO] spring-boot/spring-boot-app.go:105 spring boot started
[INFO] spring-gin/spring-gin.go:76 ⇨ http server started on:8080
```
访问 [http://127.0.0.1:8080](http://127.0.0.1:8080) 可以看到上面的代码效果。

> 该章节代码见 [post-1](https://github.com/zeromake/spring-web-demo/tree/post-1) 分支。

## 四、拆分 controller 并自动注册路由

现代项目都是 `controller` + `service` 外加一个实体层，这里我们试着把 `controller` 拆分出去。
新建一个 `controllers` 目录下面创建一个 `controllers.go` 来导入各个独立的 `controller`。

**controllers/home/home.go**

```go
package home

import (
	SpringWeb "github.com/go-spring/go-spring-web/spring-web"
	SpringBoot "github.com/go-spring/go-spring/spring-boot"
	"net/http"
)

type Controller struct {}

func init() {
	SpringBoot.RegisterBean(new(Controller)).Init(func(c *Controller) {
		SpringBoot.GetMapping("/", c.Home)
	})
}

func (c *Controller) Home(ctx SpringWeb.WebContext) {
	ctx.String(http.StatusOK, "OK!")
}
```

**controllers/controllers.go**

```go
package controllers

// 导入各个 controller 即可实现路由挂载
import (
	_ "github.com/zeromake/spring-web-demo/controllers/home"
)

```

**main.go**

```go
package main

import (
	_ "github.com/go-spring/go-spring/starter-gin"
	_ "github.com/go-spring/go-spring/starter-web"
	SpringBoot "github.com/go-spring/go-spring/spring-boot"
	_ "github.com/zeromake/spring-web-demo/controllers"
)

func main() {
	SpringBoot.RunApplication("config/")
}

```
重新运行 `go run main.go` 访问浏览器能获得相同的效果，这样我们就把 `controller` 拆分出去了。

> 该章节代码见 [post-2](https://github.com/zeromake/spring-web-demo/tree/post-2) 分支。

## 五、构建 service 的自动注入到 controller

上面说到 `controller` 的主要的能力为路由注册，参数处理复杂的逻辑应当拆分到 `service` 当中。在我使用 `go-spring` 之前都是手动的构建一个 `map[string]interface{}` 然后把 `service` 按照自定义名字挂进去。

然后在 `controller` 构建时从这个 `map` 中取出并强制转换为 `service` 类型或者抽象的接口。
这个方案问题蛮大的，手动的 `service` 名称容易出错，而且注册和在 `controller` 注入都是非常麻烦的，而且错误处理也都没做。
但是这一切有了 `go-spring` 就不一样了，我只需要在 `service` 注册，在 `controller` 里的结构体里声明这个 `service` 类型实例就可以使用。

为了不作为一个示例而太简单让学习者觉得没有什么意义，我决定做一个上传的能力，先看未拆分 `service` 的情况

**controllers/upload/upload.go**

```go
package upload

import (
	// ……
)

type Controller struct{}

func init() {
	SpringBoot.RegisterBean(new(Controller))Init(func(c *Controller) {
		SpringBoot.GetMapping("/upload", c.Upload)
	})
}

func (c *Controller) Upload(ctx SpringWeb.WebContext) {
	file, err := ctx.FormFile("file")
	if err != nil {
		// ……
		return
	}
	w, err := file.Open()
	if err != nil {
		// ……
		return
	}
	defer func() {
		_ = w.Close()
	}()
	out := path.Join("temp", file.Filename)
	if !PathExists(out) {
		dir := path.Dir(out)
		if !PathExists(dir) {
			err = os.MkdirAll(dir, DIR_MARK)
			if err != nil {
				// ……
				return
			}
		}
		dst, err := os.OpenFile(out, FILE_FLAG, FILE_MAEK)
		if err != nil {
			// ……
			return
		}
		defer func() {
			_ = dst.Close()
		}()
		_, err = io.Copy(dst, w)
		if err != nil {
			// ……
			return
		}
	} else {
		// ……
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": http.StatusText(http.StatusOK),
		"data": map[string]string{
			"url": out,
		},
	})
}

func PathExists(path string) bool {
	// ……
}

```

运行 `go run main.go` 然后用 `curl` 上传测试。

``` shell
$ curl -F "file=@./README.md" http://127.0.0.1:8080/upload
{"code":0,"data":{"url":"temp/README.md"},"message":"OK"}
# 重复上传会发现文件已存在
$ curl -F "file=@./README.md" http://127.0.0.1:8080/upload
{"code":1,"message":"该文件已存在"}
```

在项目下的 `temp` 文件夹中能够找到上传后的文件。

以上能正常运行但是 `controller` 中包含了大量的逻辑而且均为文件操作 `api` 耦合性过高。

我们需要把上面的的文件操作拆分到 `service` 当中。

**services/file/file.go**

将文件操作逻辑抽取为 `PutObject(name string, r io.Reader, size int64) (err error)` 和 `ExistsObject(name string) bool`。

```go
package file

type Service struct{}

func init() {
	SpringBoot.RegisterBean(new(Service))
}

func (s *Service) PutObject(name string, r io.Reader, size int64) (err error) {
	// ……
}

func (s *Service) ExistsObject(name string) bool {
	// ……
}

```
**services/services.go**
```go
package services

import (
	_ "github.com/zeromake/spring-web-demo/services/file"
)

```

**main.go**

增加 `services` 的导入。

```go
package main

import (
	// ……
	_ "github.com/zeromake/spring-web-demo/services"
)

func main() {
	SpringBoot.RunApplication("config/")
}

```

**controllers/upload/upload.go**

在 `Controller` 上声明 `File` 并设置 tag `autowire`，这样 `spring-boot` 会自动注入 `service` 那边注册的实例。

```go
package upload

import (
	"github.com/gin-gonic/gin"
	SpringWeb "github.com/go-spring/go-spring-web/spring-web"
	SpringBoot "github.com/go-spring/go-spring/spring-boot"
	"github.com/zeromake/spring-web-demo/services/file"
	"net/http"
	"path"
)

type Controller struct {
	File *file.Service `autowire:""`
}

func (c *Controller) Upload(ctx SpringWeb.WebContext) {
	// ……
	if !c.File.ExistsObject(out) {
		err = c.File.PutObject(out, w, f.Size)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"code":    1,
				"message": "保存失败",
				"error":   err.Error(),
			})
			return
		}
	} else {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    1,
			"message": "该文件已存在",
		})
		return
	}
	// ……
}

```

重新运行 `go run main.go` 并测试，功能正常

```shell
$ rm temp/README.md
$ curl -F "file=@./README.md" http://127.0.0.1:8080/upload
{"code":0,"data":{"url":"temp/README.md"},"message":"OK"}

$ curl -F "file=@./README.md" http://127.0.0.1:8080/upload
{"code":1,"message":"该文件已存在"}
```

> 未拆分 `service` 的完整代码在 [post-3](https://github.com/zeromake/spring-web-demo/tree/post-3)
> 拆分了 `service` 的完整代码在 [post-4](https://github.com/zeromake/spring-web-demo/tree/post-4)


## 六、spring-boot 加载配置注入对象

我们启动服务时有传入一个 `config/` 这个实际上是配置文件搜索路径。

```go
SpringBoot.RunApplication("config/")
```

`spring-boot` 支持不少格式的配置和命名方式，这些都不介绍了。

只介绍一下怎么使用这些文件

**config/application.toml**

```toml
[spring.application]
name = "demo-config"

[file]
dir = "temp"
```

**controllers/upload/upload.go**
在 `controller` 使用配置替换硬编码的保存文件夹路径, `value:"${file.dir}"` 对应配置文件的路径绑定。

```go
type Controller struct {
	File *file.Service `autowire:""`
	Dir string `value:"${file.dir}"`
}

func (c *Controller) Upload(ctx SpringWeb.WebContext) {
	// ……
	// 替换为注入的配置
	out := path.Join(c.Dir, f.Filename)
	// ……
}
```

当然 `spring-boot` 也支持对结构体实例化配置数据还有默认值。

```go

type Config struct {
	Dir string `value:"${file.dir=tmp}"`
}

type Controller struct {
	File *file.Service `autowire:""`
	Config Config
}

func (c *Controller) Upload(ctx SpringWeb.WebContext) {
	// ……
	// 替换为注入的配置
	out := path.Join(c.Config.Dir, f.Filename)
	// ……
}
```

> 该章完整代码在 [post-5](https://github.com/zeromake/spring-web-demo/tree/post-5)

## 七、通过接口类型解除 controller 对 service 的依赖

以上代码已经很完整了，但是 `controller` 直接导入 `service` 造成对逻辑的直接依赖，这样会照成很高的代码耦合，而且导入 `service` 包也比较麻烦。

这里我们可以使用 `interface` 来做到解除依赖，这样不仅解决的导入的问题也能够快速的替换 `serivce` 的实现。

**types/services.go**

之前抽取的抽象方法派上用处了。

```go
package types

import (
	"io"
)

type FileProvider interface {
	PutObject(name string, r io.Reader, size int64) error
	ExistsObject(name string) bool
}
```

**controllers/upload/upload.go**

然后把 `*file.Service` 类型替换为 `types.FileProvider` 即可，~~`spring-boot` 会自动匹配接口对应的实例。~~，正式版的 `go-spring` 默认开启严格模式无法自动匹配 `interface` 了。

```go
type Controller struct {
	File types.FileProvider `autowire:""`
	Dir  string             `value:"${file.dir}"`
}
```

**services/file/file.go**

```go
type Service struct{}

func init() {
    var s = new(Service)
    // 需要手动声明支持的接口对象，说起来我记得 new(types.FileProvider) 也是能用的
	SpringBoot.RegisterBean(s).AsInterface((*types.FileProvider)(nil))
}
```

> 该章完整代码在 [post-6](https://github.com/zeromake/spring-web-demo/tree/post-6)

## 八、通过 Condition 来限制 Bean 的注册来做到不同的 service 切换

上面我们说到用 `interface` 结构后是可以替换不同的逻辑实现的，这里我们就来一个对象存储和本地文件存储能力的更换，可以通过配置文件替换文件操作逻辑实现。

这里使用 [minio](https://github.com/minio/minio) 作为远端对象存储服务。

**docker-compose**
这里我们用 `docker` 快速创建一个本地的 `minio` 服务。
```go
version: "3"
services:
  minio:
    image: "minio/minio:RELEASE.2019-10-12T01-39-57Z"
    volumes:
      - "./minio:/data"
    ports:
      - "9000:9000"
    environment:
      MINIO_ACCESS_KEY: minio
      MINIO_SECRET_KEY: minio123
    command:
      - "server"
      - "/data"
```

**config/application.toml**
添加 `minio` 配置
```toml
[minio]
enable = true
host = "127.0.0.1"
port = 9000
access = "minio"
secret = "minio123"
secure = false
bucket = "demo"
```

**modules/minio/minio.go**
单独的用 `module` 来做 `minio` 的客户端初始化。

```go
package minio

type MinioConfig struct {
	Enable bool   `value:"${minio.enable:=true}"`    // 是否启用 HTTP
	Host   string `value:"${minio.host:=127.0.0.1}"` // HTTP host
	Port   int    `value:"${minio.port:=9000}"`      // HTTP 端口
	Access string `value:"${minio.access:=}"`        // Access
	Secret string `value:"${minio.secret:=}"`        // Secret
	Secure bool   `value:"${minio.secure:=true}"`    // Secure
	Bucket string `value:"${minio.bucket:=}"`
}

func init() {
	SpringBoot.RegisterNameBeanFn(
        // 给这个实例起个名字
        "minioClient",
        // 自动注入 minio 配置
		func(config MinioConfig) *minio.Client {
			// ……
        },
        // 前面的 0 代表参数位置，后面则是配置前缀
        "0:${}",
        // ConditionOnPropertyValue 会检查配置文件来确认是否注册
	).ConditionOnPropertyValue(
		"minio.enable",
		true,
	)
}
```

记得收集导入到 `main.go`。

**services/file/file.go**

本地存储 `service` 需要在没有注册 `minioClient` 的情况才注册。

```go
func init() {
	SpringBoot.RegisterBean(new(Service)).AsInterface((*types.FileProvider)(nil)).ConditionOnMissingBean("minioClient")
}
```
**services/minio/minio.go**

```go
package minio

type Service struct {
    // 自动注入 minio client
	Client *minio.Client `autowire:""`
	Bucket string        `value:"${minio.bucket:=}"`
}

func init() {
    // 在已注册了 minioClient 才注册
	SpringBoot.RegisterBean(new(Service)).AsInterface((*types.FileProvider)(nil)).ConditionOnBean("minioClient")
}

func (s *Service) PutObject(name string, r io.Reader, size int64) error {
	// ……
}

func (s *Service) ExistsObject(name string) bool {
	// ……
}

```

然后启动 `docker-compose up -d minio` 启动 `minio` 服务。

修改 `config/application.toml` 的 `minio.enable` 可以切换存储能力。

> 本章完整代码在 [post-7](https://github.com/zeromake/spring-web-demo/tree/post-7)


## 九、其它的 di 库体验

> 本来想直接用 `go-spring` 到项目上，但是因为 `beta` 版的默认日志输出和大量的 `panic` 暂时劝退了，找了一些其它精简的 `di` 库。

### 9.1 uber-go/dig
> [uber-go/dig](https://github.com/uber-go/dig)

`api` 极简，一个初始化容器，两个函数支持注入和导出。

``` go
func main() {
    c := dig.New()
    // 使用 Provide 注入新的对象，可选 group, name 来使用，当然 Provide 的函数变量也是注入的对象
    c.Provide(func (file types.FileProvider) (*upload.Controller, error){
        return &upload.Controller{
            File: file,
        }
    })
    c.Invoke(func (controller *upload.Controller) {
        // route init
    })
}
```

但是我还是不太满意，因为 `dig` 注入的对象有一些是需要关闭回收的，`dig` 只能在要结束运行时手动的 `Invoke` 取出对象来结束。

还有对于多个 `Controller` 注入希望能够在注入完成后有个回调，`dig` 只能够手动的 `Invoke` 一个一个 `Controller`，而且不支持 `interface` 别名。

### 9.2 defval/inject | goava/di

> [defval/inject](https://github.com/defval/inject); [goava/di](https://github.com/goava/di)

应该也是参考了 `dig` 的 `api` 完美覆盖了 `dig` 所拥有的功能，顺带一提 `defval/inject` 和 `goava/di` 是同一个作者的作品，`api` 完全相同。

`goava/di` 是作者新开的项目，打算添加新的功能。

```go
func main() {
    c := di.New(
    // 使用 Provide 注入新的对象，可选 name 来使用，当然 Provide 的函数变量也是注入的对象
        di.Provide(func (file types.FileProvider) (*upload.Controller, error){
            return &upload.Controller{
                File: file,
            }
        })
    )
}
```
然后当然也都有我想要的那些功能，请自行到 `goava/di` 查阅文档。

- 接口别名支持
- 结束清理支持
- 多接口聚合处理

但是还有一个问题那就是依赖必须通过函数参数传入，例如下面的例子。

```go
type Controller struct {
	user   types.UserService
	cfg    *config.Config
	friend types.FriendService
}

func NewController(cfg *config.Config, user types.UserService, friend types.FriendService) *Controller {
	return &Controller{
		user:   user,
		cfg:    cfg,
		friend: friend,
	}
}
```

我已经提交的 [issues/2](https://github.com/goava/di/issues/2) 等等有空就把这个功能实现一下。

### 9.3 几个 di 库的对比表

| 库名 | 注入对象命名 | 接口别名支持 | 结束清理支持 | 自动注入结构体 |
|:-|:-:|:-:|:-:|:-:|
| [go-spring/go-spring](https://github.com/go-spring/go-spring) | √ | √ | √ | √ |
| [goava/di](https://github.com/goava/di) | √ | √ | √ | × |
| [uber-go/dig](https://github.com/uber-go/dig) | √ | × | × | × |
