---
title: 机器学习1
date: 2019-08-18 13:53:00+08:00
type: machine-learning
tags: [machine-learning]
last_date: 2019-08-18 13:53:00+08:00
private: true
---

## 前言

- 近几年机器学习很火，但是我对机器学习的了解仅仅在能做可学习的一种程序，通过大量的数据集训练到达目标，但是内部到达是怎么做的完全不知道。
- 这里决通过 `斯坦福大学(coursera)` 的 [machine-learning](https://www.coursera.org/learn/machine-learning) 免费公开课进行学习，并且把学到的知识整理为一篇一篇博文。
- 第一篇的篇幅主要讲 `机器学习的定义`，`监督学习`，`无监督学习`。
- 顺便整理一个专有词对应表。

## 一、机器学习的定义

**Arthur Samuel 的定义**

第一个机器学习的定义来自于 `Arthur Samuel`。他定义机器学习为，在进行特定编程的情况下，给予计算机学习能力的领域。Samuel的定义可以回溯到50年代，他编写了一个西洋棋程序。这程序神奇之处在于，编程者自己并不是个下棋高手。但因为他太菜了，于是就通过编程，让西洋棋程序自己跟自己下了上万盘棋。通过观察哪种布局（棋盘位置）会赢，哪种布局会输，久而久之，这西洋棋程序明白了什么是好的布局，什么样是坏的布局。然后就牛逼大发了，程序通过学习后，玩西洋棋的水平超过了 `Samuel`。这绝对是令人注目的成果。尽管编写者自己是个菜鸟，但因为计算机有着足够的耐心，去下上万盘的棋，没有人有这耐心去下这么多盘棋。通过这些练习，计算机获得无比丰富的经验，于是渐渐成为了比 `Samuel` 更厉害的西洋棋手。上述是个有点不正式的定义，也比较古老。

**Tom Mitchell 的定义**

另一个年代近一点的定义，由 `Tom Mitchell` 提出，来自卡内基梅隆大学，Tom定义的机器学习是这么啰嗦的，一个好的学习问题定义如下，他说，一个程序被认为能从经验 `E` 中学习，解决任务 `T`，达到性能度量值 `P`，当且仅当，有了经验 `E` 后，经过 `P` 评判，程序在处理 `T` 时的性能有所提升。我认为他提出的这个定义就是为了压韵在西洋棋那例子中，经验 `E` 就是程序上万次的自我练习的经验而任务 `T` 就是下棋。性能度量值 `P` 呢，就是它在与一些新的对手比赛时，赢得比赛的概率。


**阅读资料: What is Machine Learning?**
<details>
<summary>原文</summary>
Two definitions of Machine Learning are offered. Arthur Samuel described it as: "the field of study that gives computers the ability to learn without being explicitly programmed." This is an older, informal definition.

Tom Mitchell provides a more modern definition: "A computer program is said to learn from experience E with respect to some class of tasks T and performance measure P, if its performance at tasks in T, as measured by P, improves with experience E."

Example: playing checkers.

E = the experience of playing many games of checkers

T = the task of playing checkers.

P = the probability that the program will win the next game.

In general, any machine learning problem can be assigned to one of two broad classifications:

Supervised learning and Unsupervised learning.
</details>


## 二、监督学习

## 三、无监督学习

## 四、练习

## 五、专有词

| abbreviate | original | description |
|------------|----------|-------------|
