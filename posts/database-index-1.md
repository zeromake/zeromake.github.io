---
title: 数据库索引-1（索引数据类型）
date: 2020-05-01 18:44:00+08:00
type: database
tags: [database, index]
last_date: 2020-05-01 18:44:00+08:00
private: true
---

## 前言

- 这篇博文研究各种常见的数据库索引类型包括 `B` 树，`B+` 树，`LSM` 树。
- 对各种 `sql`，`nosql`，`newsql` 的索引表现形式进行调用。

## 一、数据库索引有哪些数据结构

``` sql
CREATE TABLE account {
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    PRIMARY KEY (`id`)
};
```


**hashmap**

在 `mysql` 的 `Memory` 引擎中就有支持，主要对于数据库的指定行有着非常好的效率 `O(1)`。

``` sql
SELECT * FROM account WHERE id = 5
```

但是我们在 `sql` 数据库下一般都是进行范围取行。

``` sql
SELECT * FROM account WHERE id < 5
```

这种情况下由于 `hashmap` 的实现必须是无序的所以，无法很好的支持范围数据的查询会进行全表扫描，对于一个关系型数据库并不是很好。


**b-tree**

![b-tree](https://img-blog.csdn.net/20160202204827368)

**b-plus-tree**

**lsm-tree**

## 二、sql 为什么都用 B+ 树

## 三、nosql 为什么都是使用 B 树

## 四、newsql 的索引现状

## 五、从索引来考虑数据库应用场景

## 参考

- [为什么 MySQL 使用 B+ 树](https://draveness.me/whys-the-design-mysql-b-plus-tree/)
- [为什么 MongoDB 使用 B 树](https://draveness.me/whys-the-design-mongodb-b-tree/)
- [BTree 和 B+Tree 详解](https://www.cnblogs.com/vianzhang/p/7922426.html)
- [大数据索引技术 - B+ tree vs LSM tree](https://www.cnblogs.com/fxjwind/archive/2012/06/09/2543357.html)

## 后语

