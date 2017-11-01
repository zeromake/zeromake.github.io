title: ci自动部署
date: 2017-10-31 15:44:00+08:00
type: deploy
tags: [ci, docker, deploy]
last_date: 2017-10-31 15:44:00+08:00

## 前言

很久没写博文了，最近正好公司内部需要进行ci自动部署，就写一篇ci自动部署。
其中分为两种，公开项目，私有项目

## 一、自动部署原理

现在的git自动部署都是通过推送钩子，触发第三方ci执行脚本，然后在脚本中进行部署。
1. git push
2. 触发 git hooks 去调用ci
3. ci执行shell，自动拉取代码，build，部署


但是这样会缺少每次更新的代码，无法做到回滚。

所以正常的做法是每次ci执行更新时做一个打包当前代码，并存到一个地方。

现在有了另一种做法，那就是直接打包docker镜像，通过私有或者公开docker仓库保存

1. git push
2. 触发 git hooks 去调用ci
3. ci执行shell，自动拉取代码，build，打包docker，推送docker镜像部署


这样的好处就是完全保证，代码，环境一致，并能快速回滚

## 二、ci

ci(Continuous integration)的中文是持续集成，常用于自动测试。

在每次提交代码时自动的执行项目中的测试用例。

这里我公司内部使用的`gitlab`所以直接使用内置的ci
