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
func main () {
    var num int
    rValue := reflect.ValueOf(num)
    rType := reflect.TypeOf(num) // 或者使用 rValue.Type()
}
```

## 二、生成变量或者指针并设置值

## 三、Array

## 四、Slice

## 五、Map

## 六、Struct

## 七、interface

## 八、Function

## 九、反射做路由挂载

## 十、反射做 http.Handle 包装

## 参考

- [Go语言圣经-第12章 反射](https://books.studygolang.com/gopl-zh/ch12/ch12.html)
- [reflect 官方 API 文档](https://pkg.go.dev/reflect?tab=doc)
