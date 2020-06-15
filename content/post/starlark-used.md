---
title: Starlark使用
date: 2020-06-11T07:53:00.000Z
tags:
  - go
  - python
  - script
  - vm
  - starlark
lastmod: 2020-06-11T07:53:00.000Z
categories:
  - go
slug: starlark-used
draft: true
---

## 前言

最近需要在 `Golang` 里嵌入一个脚本语言，现在对于 `Golang` 来说比较成熟的有 `python`, `javascript`, `lua` 的第三方作为内嵌脚本执行引擎。

其中我使用了 `starlark` 主要是大部分兼容 `python` 语法，并且比起其他的脚本实现它实际上是没有 `vm` 的更加的轻量。

<!--more-->

## 一、最小化运行

``` bash
go get -u -v go.starlark.net/starlark
```


```go
package main

import (
    "log"

	"go.starlark.net/starlark"
)

func main() {
    thread := &starlark.Thread{
		Name: "starlark",
		Print: func(_ *starlark.Thread, msg string) {
            // starlark.Thread 是执行栈
			log.Println(msg)
		},
    }
    g, err := starlark.ExecFile(comp.thread, "", `
print("hello starlark!")
    `, nil)
    if err != nil {
        log.Fatalln(err)
    }
    // g 是脚本的全局对象字典
    log.Println(g)
}
```

## 二、load 和 print 设置

我们查看 `starlark.Thread` 结构发现有三个字段 `Name string`, `Print func(thread *Thread, msg string)`, `func(thread *Thread, module string) (StringDict, error)` 可以设置

1. `Name` 没啥特别的意义就是命名。
2. `Print` 设置 `starlark` 脚本里的 `print` 函数调用。
3. `Load` 可以用来做额外的模块脚本加载，个人觉的没啥用，作为一个嵌入脚本，直接把需要的模块全部手动注入了就好了。

## 三、module 注入

在 `starlark.ExecFile` 方法会发现最后有一个 `predeclared StringDict` 参数，这个就是后面需要执行的脚本里注入的全局模块函数还有变量。

不得不说官方文档不知道为啥不写一个 `starlarkstruct.Module` 注入教程，找了一下手动的声明就可以了。

```go
package main

import (
    "log"

    "go.starlark.net/starlark"
    "go.starlark.net/starlarkstruct"
)

func Test(
	_ *starlark.Thread,
	_ *starlark.Builtin,
	args starlark.Tuple,
	_ []starlark.Tuple,
) (starlark.Value, error) {
    log.Println("Test")
    return starlark.None, nil
}

func main() {
    thread := &starlark.Thread{
		Name: "starlark",
		Print: func(_ *starlark.Thread, msg string) {
            // starlark.Thread 是执行栈
			log.Println(msg)
		},
    }
    // 手动构建 starlarkstruct.Module 即可
    ctxModule := &starlarkstruct.Module{
		Name: "ctx",
		Members: starlark.StringDict{
			"test": starlark.NewBuiltin("test", Test),
		},
    }
    predeclared := starlark.StringDict{
        "ctx": ctxModule,
    }
    g, err := starlark.ExecFile(comp.thread, "", `
ctx.test()
    `, predeclared)
    if err != nil {
        log.Fatalln(err)
    }
    // g 是脚本的全局对象字典
    log.Println(g)
}
```


## 四、回调支持



## 五、抛出错误支持

## 六、第三方模块

## 七、一些注意事项

1. 没有很多语法，例如异常相关 `try`, `except`, `finally`, `raise`。
2. 没有 `class`, `dict` 没有 `has_key` 可以去官方的 [spec](https://github.com/google/starlark-go/blob/master/doc/spec.md) 里查看。

## 参考

- [starlark官方仓库](https://github.com/google/starlark-go)
- [spec](https://github.com/google/starlark-go/blob/master/doc/spec.md)
- [starlib](https://github.com/qri-io/starlib)
