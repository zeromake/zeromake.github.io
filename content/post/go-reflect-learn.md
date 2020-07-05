---
title: go 的 reflect 学习
date: 2019-12-11T12:05:26.000Z
tags:
  - reflect
  - learn
lastmod: 2019-12-11T12:05:26.000Z
categories:
  - go
slug: go-reflect-learn
draft: true
---
## 前言

最近使用了 `gorm` 发现各种难受，单表查询还好但是多表关联查询就会出问题，感觉并不是太合适我这个习惯了使用 `knex` + `bookshelf` 和 `sequelize`。
希望重写一个 `orm`，这里是预先学习 `go` 反射，这里会做到一个自动注入到结构体数据的 `sql.Row` 转换。

``` go
func main() {
    rows, err := db.Query("SELECT 10 as id")
    if err != nil {
        log.Fatal(err)
    }
    var id int
    if !rows.Next() {
        return
    }
    err = rows.Scan(&id)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(id)

    rows, err := db.Query("SELECT 10 as id")
    if err != nil {
        log.Fatal(err)
    }
    var data struct {
        ID int
    }
    err = ScanRow(rows, &data)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println(data)
}
```

## 一、`TypeOf`, `ValueOf` 介绍

```go
package reflect

import (
	"reflect"
	"testing"
)

func TestReflectValue(t *testing.T)  {
	var num1 int
    var num2 int
    // 直接传入值是无法通过反射修改值的
    rValue1 := reflect.ValueOf(num1)
    // 需要去引用再取 reflect.Value 然后得到的是 *int 的 Value 需要再 Elem() 取到 int。
    rValue2 := reflect.ValueOf(&num2).Elem()
    // int: 0 false
    t.Logf("%+v:\t%+v\t%v\n", rValue1.Type(), rValue1, rValue1.CanSet())
    // int: 0 true
	t.Logf("%+v:\t%+v\t%v\n", rValue2.Type(), rValue2, rValue2.CanSet())
    rValue2.SetInt(5)
    // 5
	t.Log(num2)
}
```

| 分组 | 名称 | 说明 | 应用场景示例 |
|:--------:|----|-------|-------------|
| 通用 || 几乎是所有类型都可以使用的 ||
|| `Set(Value)` | 对所有可以被写入的值进行赋值 | 常用于赋值和赋值方都来自调用方的通用赋值，例如 orm 里的字段产生的 Value 和用户的 Value 的赋值 |
|| `Elem() Value` | 对 `Interface | Ptr` 解出内部值 | |
|| `CanSet() bool` | 可以检查是否可赋值 | |
|| `Type() Type` | 去除值的类型反射 ||
|| `Addr() Value` | 对值取引用||
|| `CanAddr() bool` | 检查是否可以取引用 ||
| Int | | 仅对 int, uint 类型有效||
|| `SetInt(int64)` | 对 `int64` 向下全部支持设置 |  |
|| `SetUint(uint64)` | 对 `uint64` 向下全部支持设置 ||
|| `Int() int64` | 在确认为 `int64` 及兼容的类型情况可以取出并转为 `int64` ||
|| `Uint() uint64` | 在确认为 `uint64` 及兼容的类型情况可以取出并转为 `uint64` ||


## 二、生成变量或者指针并设置值

## 三、Array

## 四、Slice

## 五、Map

## 六、Struct

## 七、interface

## 八、Function

## 九、反射做路由挂载

## 十、反射做 http.Handle 包装

## 十一、使用 unsafe 加反射对 struct 的私有字段写入值

## 参考

- [Go语言圣经-第12章 反射](https://books.studygolang.com/gopl-zh/ch12/ch12.html)
- [reflect 官方 API 文档](https://pkg.go.dev/reflect?tab=doc)
