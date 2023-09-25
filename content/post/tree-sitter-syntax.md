---
title: tree-sitter 语法参考
date: 2023-09-23 12:00:00 +08:00
tags:
  - syntax
  - tree-sitter
  - js
lastmod: 2023-09-23 12:00:26 +08:00
categories:
  - tree-sitter
  - syntax
slug: tree-sitter-syntax
draft: true
---

## 前言

## 一、创建一个 tree-sitter 解析器

## 二、参考 tree-sitter-json 说明每行的语法效果

## 三、语法参考表

> [官方参考](http://tree-sitter.github.io/tree-sitter/creating-parsers#the-grammar-dsl)

**额外表达式**

|名称|表达式|示例|说明|
|----|----|---|----|
| 语法函数的参数 `$` | `$ => {}` | `{rules: {document: $ => choice($.string, $.number)}}` | 每个语法规则都是一个函数，函数的参数是名一般为 `$`。`$` 是一个  object 规则中的所有符号都在这个 `$` 参数上，`$.string` 就是引用 `rules` 的 `string`。|
| 字面量 | "true", /\w+/ | '"', /\[0-1\]+/ | 字符串和正则(正则与 js 书写方式一致，但是最终到 c 代码里效果并不是正则)|

**公共字段**

|名称|说明|
|---|----|
| extras | 可能出现在语言中任何地方的符号数组，空格换行之类的字符。|
| inline | 一组规则名称，应通过将其所有用法替换为其定义的副本来自动从语法中删除。这对于在多个地方使用但不想在运行时创建语法树节点的规则很有用。|
| conflicts | 规则名称数组的数组。|
| externals | 可以由外部扫描器返回的符号名称数组。|
| word | 关键字一般用于编程语言里的操作符与变量连接区分 |
| supertypes | 把隐藏的规则放置到 supertypes 里 |

**内置函数**
|名称|表达式|示例|说明|
|---|-----|---|----|
| seq | seq(rule1, rule2, ...) | `seq("(", /w+,?/, ")")` | 使用其他的规则构建一个新的规则，按顺序拼接下去 |
| choice | choice(rule1, rule2, ...) | `choice("'", "\"")` | 使用其他规则创建一个新规则，顺序无关，类似于正则里 `\|` 效果 |
| repeat | repeat(rule) | `repeat(" ")` | 重复 0-n 该规则，类似于正则里的 `*` 效果 |
| repeat1 | repeat1(rule) | `repeat1("0x")` | 重复 1-n 该规则，类似于正则里的 `+` 效果 |
| optional | optional(rule) | `optional("0x")` | 重复 0-1 该规则，类似于正则里的 `?` 效果 |
| prec | prec(number, rule) | `prec(1, /\+-\*\\/)` | 指定规则优先级。默认优先级为 0。一般用于 choice 有叠加的情况 |
| prec.left | prec.left(number, rule) | `prec.left(1, /\+-\*\\/)` | 出现相同规则优先级时，优先执行左侧规则。 |
| prec.right | prec.right(number, rule) | `prec.right(1, /\+-\*\\/)` | 出现相同规则优先级时，优先执行右侧规则。 |
| prec.dynamic | prec.dynamic(number, rule) | `prec.dynamic(1, /\+-\*\\/)` | 优先级在动态运行时有效。动态运行处理语法冲突时，才有必要。|
| token | token(rule) | `token(prec(1, /\+-\*\\/))` | 将规则输出的内容标记为单个符号。默认是将字符串或正则标记为单独的符号。本函数可以将复杂表达式，标记为单个符号(在 c 里有优化效果，多个字符作为一个分支，否则会每个规则都需要一个分支代码)。|
| token.immediate | token.immediate(rule) | `token.immediate(prec(1, /\+-\*\\/))` | 只有在前面没有空格时，进行符号化。|
| alias | alias(rule, name) | `alias($.string, "commit")` | 语法树中以替代名称出现。|
| field | field(name, rule) | `field("key", choice($.string))` | 将字段名称分配给规则，解析后可以用该名命中规则匹配。|


## 参考
- [tree-sitter官方文档](ttps://tree-sitter.github.io)
- [玩玩-tree-sitter](https://nnnewb.github.io/blog/p/%E7%8E%A9%E7%8E%A9-tree-sitter/)
- [TreeSitter基本语法](https://kaisawind.gitee.io/2022/07/08/2022-07-08-tree-sitter/)
