---
title: 常用 shell 语法快查表
date: 2023-10-09 11:43:00.00 +08:00
tags:
  - shell
  - bash
  - powershell
  - fish
  - nushell
lastmod: 2023-10-09 16:19:00.00 +08:00
categories:
  - shell
slug: popular-shell-syntax-diff
draft: false
---

## 前言

各种 shell 的语法根本记不住，这里整理一个快查文档。

<!--more-->

## 一、bash

> cd,ls 有些不是命令而是 bash 内置函数

| 用途    | 示例 | 说明 |
|--------|-----|------|
| 执行命令 | `cat 1.txt` | 直接执行 cat …… |
| 变量引用 | `cat $USER.txt` 或者 `cat ${USER}.txt` | 有比较明确的非字母跟随可以直接使用 `$xxx`，没有最好使用 `${xxx}` |
| 算式运算 | `$[1+2]` 或者 `$((1+2))` | 两种方式相同 |
| 管道    | `cat 1.txt \| grep line` | 使用 `\|` 传递上一个命令的 `stdout` 到下一个命令的 `stdin` 里 |
| 内嵌命令 | <code>\`pwd\`</code> 或者 `$(pwd)` | 直接把命令的 `stdio` 返回，可以设置给变量 |
| 查询命令1 | `type pwd` | 显示一个命令的信息（内置、别名或可执行）|
| 查询命令2 | `which pwd` | 显示一个命令的所在路径 （which g => g: aliased to git） |
| 变量设置 | `VAR=1` | 当前 shell 变量，子命令不会享受该变量 |
| 删除变量 | `unset VAR` | 删除环境变量 |
| 环境变量 | `export VAR=1` | 设置环境变量，子命令也会享受该变量 |
| 输出文件 | `echo foo > 1.txt` | `>` 覆盖文件 |
| 追加文件 | `echo foo >> 1.txt` | `>>` 追加到文件最后 |
| 顺序执行 | `command1 && command2` | 顺序执行命令，任意一个命令发生失败中断 |
| 失败执行 | `command1 \|\| command2` | 顺序执行命令，成功任意一条发生中断并且为成功 |
| 后台执行 | `command1 & command2 &` | 同时执行两条命令 |
| 条件 | `if [ expression ]; then command1; else command2; fi` | 判断条件走不同命令 |
| 循环1 | `arr="a b c";for item in $arr; do echo $item; done` | 循环一个空格分割的字符串 |
| 循环2 | `files=$(find . -name '*.h');for item in $files; do echo $item; done` | 循环一个换行分割的字符串 |

## 二、fish

> cd, ls 是内置脚本

| 用途    | 示例 | 说明 |
|--------|-----|------|
| 执行命令 | `cat 1.txt` | 直接执行 cat …… |
| 变量引用 | `cat $USER.txt` 或者 `cat {$USER}.txt` | 有比较明确的非字母跟随可以直接使用 `$xxx`，没有最好使用 `{$xxx}` |
| 算式运算 | `math 1+2` | fish 内置 `math` 命令做数学运算 |
| 管道    | `cat 1.txt \| grep line` | 使用 `\|` 传递上一个命令的 `stdout` 到下一个命令的 `stdin` 里 |
| 内嵌命令 | `set x (pwd)` | 直接把命令的 `stdio` 返回，可以设置给变量 |
| 查询命令1 | `type pwd` | 显示一个命令的信息，如果是脚本会显示脚本内容 |
| 查询命令2 | `which pwd` | 显示一个命令的所在路径 （which g => g: aliased to git） |
| 删除变量 | `set -e VAR` | 删除环境变量 |
| 全局变量设置 | `set -g VAR 1` | 当前 shell 变量，方法内也能访问 |
| 变量设置 | `set VAR 1` | 当前 shell 变量，子命令不会享受该变量 |
| 环境变量 | `set -x VAR=1` | 设置环境变量，子命令也会享受该变量 |
| 输出文件 | `echo foo > 1.txt` | `>` 覆盖文件 |
| 追加文件 | `echo foo >> 1.txt` | `>>` 追加到文件最后 |
| 顺序执行 | `command1 && command2` | 顺序执行命令，任意一个命令发生失败中断 |
| 失败执行 | `command1 \|\| command2` | 顺序执行命令，成功任意一条发生中断并且为成功 |
| 后台执行 | `command1 & command2 &` | 同时执行两条命令 |
| 条件 | `if expression; command1; else command2; end` | 判断条件走不同命令 |
| 循环 | `set files (find . -name '*.h');for item in $files; echo $item; end` | 循环一个换行分割的字符串 |


## 三、powershell


| 用途    | 示例 | 说明 |
|--------|-----|------|
| 执行命令 | `Get-Content 1.txt` | 直接执行 Get-Content …… |
| 变量引用 | `Get-Content $PWD/1.txt`, `Get-Content $(PWD)/1.txt`, `Get-Content ${PWD}/1.txt` | 有比较明确的非字母跟随可以直接使用 `$xxx`，没有最好使用 `${xxx}`, `$(xxx)` |
| 算式运算 | `1+2` | 可以直接做数学运算 |
| 管道    | `Get-Content ./README.md \| Select-String -Pattern 'Run dev'` | 使用 `\|` 传递上一个命令的 `stdout` 到下一个命令的 `stdin` 里 |
| 内嵌命令 | `$x=ls` | 直接把命令的 `stdio` 返回，可以设置给变量 |
| 查询命令1 | `Get-Command type` | 显示一个命令的信息，别名，内置函数，命令所在位置 |
| 删除变量 | `Remove-Variable $VER` | 删除环境变量 |
| 变量设置 | `$VAR=1` | 当前 shell 变量，子命令不会享受该变量 |
| 环境变量 | `$Env:VAR=1` | 设置环境变量，子命令也会享受该变量 |
| 输出文件 | `echo foo \| Set-Content -Encoding utf8 1.txt` | 文本以 utf8 格式覆盖写入  |
| 追加文件 | `echo foo \| Add-Content -Encoding utf8 1.txt` | 文本以 utf8 格式追加到文件最后 |
| 二进制输出 | `Get-Content -AsByteStream 1.txt \| Set-Content -AsByteStream 2.txt` | 二进制方式输出 |
| 顺序执行1 | `(command1) -and (command2)` | 顺序执行命令，任意一个命令发生失败中断 |
| 失败执行1 | `(command1) -or (command2)` | 顺序执行命令，成功任意一条发生中断并且为成功 |
| 顺序执行2 | `command1 && command2` | 顺序执行命令，任意一个命令发生失败中断 |
| 失败执行2 | `command1 \|\| command2` | 顺序执行命令，成功任意一条发生中断并且为成功 |
| 条件 | `if (expression) {command1} else {command2}` | 判断条件走不同命令 |
| 循环 | `$files=find . -name '*.h';foreach($item in $files){echo $item}` | 循环一个换行分割的字符串 |

## 四、nushell
