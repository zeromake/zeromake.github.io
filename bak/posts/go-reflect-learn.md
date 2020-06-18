---
title: go 的 reflect 学习
date: 2019-12-11 20:05:26+08:00
type: go
tags: [reflect,learn]
last_date: 2019-12-11 20:05:26+08:00
private: true
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

## 三、Array, Slice, Map 的反射使用

## 四、实战

包装 `sql.Row`，`sql.Rows` 支持把值导入到结构体中，也支持切片结构体导入

接口设计为以下

```go
func ScanRow(row *sql.Row, value interface{}) error {
    return nil
}

func ScanRows(rows *sql.Rows, value interface{}) error {
    return nil
}

func ScanMany(rows *sql.Rows, values interface{}) error {
    return nil
}
```

## 参考

- [Go语言圣经-第12章 反射](https://books.studygolang.com/gopl-zh/ch12/ch12.html)
- [reflect 官方 API 文档](https://pkg.go.dev/reflect?tab=doc)
