---
title: 机器学习第一周
date: 2019-08-18 13:53:00+08:00
type: machine-learning
tags: [machine-learning]
last_date: 2019-08-23 15:39:00+08:00
private: true
---

## 前言

- 近几年机器学习很火，但是我对机器学习的了解仅仅在能做可学习的一种程序，通过大量的数据集训练到达目标，但是内部到达是怎么做的完全不知道。
- 这里决通过 `斯坦福大学(coursera)` 的 [machine-learning](https://www.coursera.org/learn/machine-learning) 免费公开课进行学习，并且把学到的知识整理为一篇一篇博文。
- 第一篇的篇幅主要讲 `机器学习的定义`，`监督学习`，`无监督学习`。
- 顺便整理一个专有词对应表。

<!--more-->

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

机器学习的两个定义。 `Arthur Samuel` 将其描述为：“研究领域使计算机无需明确编程即可学习。” 这是一个较旧的非正式定义。

`Tom Mitchell` 提供了一个更现代的定义：“据说计算机程序从经验 `E` 中学习某些任务T和绩效测量 `P`，如果它在 `T` 中的任务中的表现，由 `P` 测量，随经验 `E` 而改善。“

示例：玩跳棋。

`E` = 玩许多跳棋游戏的经验

`T` = 玩跳棋的任务。

`P` = 程序赢得下一场比赛的概率。

通常，任何机器学习问题都可以分配到两个广泛的分类之一：

- `监督学习`: 可以被预测的结果
- `无监督学习`: 无法预测的结果

## 二、监督学习

<details>
<summary>原文</summary>
In supervised learning, we are given a data set and already know what our correct output should look like, having the idea that there is a relationship between the input and the output.

Supervised learning problems are categorized into "regression" and "classification" problems. In a regression problem, we are trying to predict results within a continuous output, meaning that we are trying to map input variables to some continuous function. In a classification problem, we are instead trying to predict results in a discrete output. In other words, we are trying to map input variables into discrete categories.

**Example 1:**

Given data about the size of houses on the real estate market, try to predict their price. Price as a function of size is a continuous output, so this is a regression problem.

We could turn this example into a classification problem by instead making our output about whether the house "sells for more or less than the asking price." Here we are classifying the houses based on price into two discrete categories.

**Example 2:**

(a) Regression - Given a picture of a person, we have to predict their age on the basis of the given picture

(b) Classification - Given a patient with a tumor, we have to predict whether the tumor is malignant or benign.
</details>

在有监督的学习中，我们得到一个数据集，并且已经知道我们的正确输出应该是什么样的，并且认为输入和输出之间存在关系。

监督学习问题分为“回归”和“分类”问题。在回归问题中，我们试图在连续输出中预测结果，这意味着我们正在尝试将输入变量映射到某个连续函数。在分类问题中，我们试图在离散输出中预测结果。换句话说，我们正在尝试将输入变量映射到离散类别。

**例1：**
鉴于有关房地产市场房屋面积的数据，请尝试预测房价。作为大小函数的价格是连续输出，因此这是一个回归问题。

我们可以将这个例子变成一个分类问题，而不是让我们的输出关于房子“卖得多于还是低于要价”。在这里，我们将基于价格的房屋分为两个不同的类别。

**例2：**
（a）回归 - 鉴于一个人的照片，我们必须根据给定的图片预测他们的年龄

（b）分类 - 鉴于患有肿瘤的患者，我们必须预测肿瘤是恶性的还是良性的。

## 三、无监督学习

<details>
<summary>原文</summary>
Unsupervised learning allows us to approach problems with little or no idea what our results should look like. We can derive structure from data where we don't necessarily know the effect of the variables.

We can derive this structure by clustering the data based on relationships among the variables in the data.

With unsupervised learning there is no feedback based on the prediction results.

**Example:**

Clustering: Take a collection of 1,000,000 different genes, and find a way to automatically group these genes into groups that are somehow similar or related by different variables, such as lifespan, location, roles, and so on.

Non-clustering: The "Cocktail Party Algorithm", allows you to find structure in a chaotic environment. (i.e. identifying individual voices and music from a mesh of sounds at a [cocktail party](https://en.wikipedia.org/wiki/Cocktail_party_effect)).
</details>
无监督学习使我们能够在很少或根本不知道我们的结果应该是什么样的情况下处理问题。 我们可以从数据中导出结构，我们不一定知道变量的影响。

我们可以通过基于数据中变量之间的关系对数据进行聚类来推导出这种结构。

在无监督学习的情况下，没有基于预测结果的反馈。

**例：**
聚类：收集1,000,000个不同基因的集合，并找到一种方法将这些基因自动分组成不同的相似或相关的不同变量组，如寿命，位置，角色等。

非聚类：“鸡尾酒会算法”允许您在混乱的环境中查找结构。 （即在[鸡尾酒会](https://zh.wikipedia.org/wiki/%E9%B8%A1%E5%B0%BE%E9%85%92%E4%BC%9A%E6%95%88%E5%BA%94)上从声音网格中识别个别声音和音乐）。

## 四、练习1
[演讲幻灯片](https://www.coursera.org/learn/machine-learning/supplement/d5Pt1/lecture-slides)


<details>
<summary>原文</summary>

---

1. A computer program is said to learn from experience E with respect to some task T and some performance measure P if its performance on T, as measured by P, improves with experience E.Suppose we feed a learning algorithm a lot of historical weather data, and have it learn to predict weather. In this setting, what is T?
>
* a. The process of the algorithm examining a large amount of historical weather data.
* b. The probability of it correctly predicting a future date's weather.
* c. The weather prediction task.
* d. None of these.

---
2. The amount of rain that falls in a day is usually measured in either millimeters (mm) or inches. Suppose you use a learning algorithm to predict how much rain will fall tomorrow. Would you treat this as a classification or a regression problem?
>
* a. Regression
* b. Classification

---
3. Suppose you are working on stock market prediction. You would like to predict whether or not a certain company will win a patent infringement lawsuit (by training on data of companies that had to defend against similar lawsuits). Would you treat this as a classification or a regression problem?
>
* a. Classification
* b. Regression

---
4. Some of the problems below are best addressed using a supervised learning algorithm, and the others with an unsupervised learning algorithm. Which of the following would you apply supervised learning to? (Select all that apply.) In each case, assume some appropriate dataset is available for your algorithm to learn from.
>
* a. Given data on how 1000 medical patients respond to an experimental drug (such as effectiveness of the treatment, side effects, etc.), discover whether there are different categories or "types" of patients in terms of how they respond to the drug, and if so what these categories are.
* b. Given genetic (DNA) data from a person, predict the odds of him/her developing diabetes over the next 10 years.
* c. Given a large dataset of medical records from patients suffering from heart disease, try to learn whether there might be different clusters of such patients for which we might tailor separate treatments.
* d. Have a computer examine an audio clip of a piece of music, and classify whether or not there are vocals (i.e., a human voice singing) in that audio clip, or if it is a clip of only musical instruments (and no vocals).

---
5. Which of these is a reasonable definition of machine learning?
>
* a. Machine learning is the field of allowing robots to act intelligently.
* b. Machine learning is the science of programming computers.
* c. Machine learning is the field of study that gives computers the ability to learn without being explicitly programmed.
* d. Machine learning learns from labeled data.
</details>

---
1. 一个计算机程序据说可以从经验 `E` 中学习一些任务 `T` 和一些绩效测量 `P`，如果它在 `T` 上的表现，用 `P` 来衡量，随着经验的提高而提高 `E`。假设我们为学习算法提供了大量的历史天气数据，让它学会预测天气。在这种情况下，什么是 `T`？
>
* a. 该算法检查大量历史天气数据的过程。
* b. 正确预测未来日期天气的概率。
* c. 天气预报任务。
* d. 都不是。
---
2. 一天中下降的雨量通常以毫米（mm）或英寸为单位。假设您使用学习算法来预测明天将下降多少雨。您会将此视为分类还是回归问题？
>
* a. 回归
* b. 分类

---
3. 假设您正在进行股市预测。您想预测某家公司是否会赢得专利侵权诉讼（通过培训必须为类似诉讼辩护的公司的数据）。您会将此视为分类还是回归问题？
>
* a. 分类
* b. 回归
---
4. (hasMany)下面的一些问题最好使用监督学习算法解决，其他问题使用无监督学习算法。您将以下哪项应用监督学习？ （选择所有适用的选项。）在每种情况下，假设您的算法可以使用一些适当的数据集来学习。
>
* a. 根据1000名医疗患者对实验药物的反应（如治疗效果，副作用等）的数据，发现患者对药物的反应方式是否存在不同的类别或“类型”，以及如果是这样，这些类别是什么。
* b. 根据一个人的遗传（DNA）数据，预测他/她在未来10年内患糖尿病的几率。
* c. 根据患有心脏病的患者的医疗记录的大量数据集，尝试了解**是否**可能存在不同的这类患者群体，我们可以针对这些患者量身定制单独的治疗方案。
* d. 让计算机检查一段音乐的音频片段，并分类该音频片段中是否存在人声（即，人声唱歌），或者它是否仅是乐器（并且没有人声）的片段。
---
5. 这些是机器学习的合理定义？
>
* a. 机器学习是允许机器人智能行动的领域。
* b. 机器学习是计算机编程的科学。
* c. 机器学习是一个研究领域，它使计算机无需明确编程即可学习。
* d. 机器学习从标记数据中学习。


<details>
<summary>答案</summary>

1. `c` 根据机器学习定义中的得等 `T` 是目标的任务。
2. `a` 根据以往的数据制作为曲线函数或者直线函数来预测一个值，所以是回归算法。
3. `a` 目标要求明确为是否赢得专利侵权诉讼，所以是分类算法。
4. `b, c` 主要问题是 `c` 选项中语言陷阱明明是一个是否有其它分类的说法，如果不注意会以为应该用无监督算法。
5. `c` 这个没啥好说的，自己去翻定义。
</details>

## 五、线性回归算法


<details>
<summary>原文</summary>

To establish notation for future use, we’ll use $x(i)$ to denote the `input` variables (living area in this example), also called input features, and $y(i)$ to denote the `output` or target variable that we are trying to predict (price). A pair $(x(i),y(i))$ is called a training example, and the dataset that we’ll be using to learn—a list of m training examples $(x(i),y(i))$; `i=1,...` , $m$ is called a training set. Note that the superscript $(i)$ in the notation is simply an index into the training set, and has nothing to do with exponentiation. We will also use X to denote the space of input values, and Y to denote the space of output values. In this example, `X = Y = ℝ`.

To describe the supervised learning problem slightly more formally, our goal is, given a training set, to learn a function `h : X → Y` so that `h(x)` is a `good` predictor for the corresponding value of y. For historical reasons, this function h is called a hypothesis. Seen pictorially, the process is therefore like this:

When the target variable that we’re trying to predict is continuous, such as in our housing example, we call the learning problem a regression problem. When y can take on only a small number of discrete values (such as if, given the living area, we wanted to predict if a dwelling is a house or an apartment, say), we call it a classification problem.

</details>

为了建立未来使用的符号，我们将使用 $x(i)$ 来表示 `输入` 变量（在此示例中为生活区域），也称为输入要素，并使用 $y(i)$ 来表示我们试图预测的 `输出` 或目标变量（价格）。一对  $(x(i),y(i))$ 被称为训练示例，我们将使用的数据集学习 $m$ 个训练样例列表 $(x(i),y(i))$; `i=1,...` ,$m$ 称为训练集数量。请注意，符号中的上标 $(i)$ 只是训练集的索引，与取幂无关。我们还将使用 `X` 来表示输入值的空间，并使用 `Y` 来表示输出值的空间。在这个例子中，`X = Y = ℝ`。

为了更加正式地描述监督学习问题，我们的目标是，在给定训练集的情况下，学习函数 `h : X → Y`，使得 `h(x)` 是 `y` 的对应值的 `good` 预测器。由于历史原因，该函数 `h` 被称为假设。从图中可以看出，这个过程是这样的：

当我们试图预测的目标变量是连续的时，例如在我们的住房示例中，我们将学习问题称为回归问题。当y只能承受少量离散值时（例如，如果给定生活区域，我们想要预测住宅是房屋还是公寓，请说），我们将其称为分类问题。


## 六、成本函数

## 七、梯度下降

## 八、练习2

## 九、专有词

**机器学习定义**

| abbreviate | original    | description |
|------------|-------------|-------------|
|     T      | task        | 任务         |
|     E      | experience  | 经验         |
|     P      | probability | 概率         |

**几种算法**

| abbreviate | original    | description |
|------------|-------------|-------------|
| supervised learning   | - | 监督学习      |
| unsupervised learning | - | 无监督学习    |
| classification        | - | 分类          |
| regression            | - | 回归          |

**线性回归**

| abbreviate | original    | description |
|------------|-------------|-------------|
| $m$ | number of tranining examples | 训练级数量 |
| $x$ | `input` variable / features | 输入变量 / 特征 |
| $y$ | `output` variable / `target` variable | 输出变量 / 目标变量 |
| $(x, y)$ | - | 一个训练集样本 |
| $(x(i), y(i))$ | - | 第 $i$ 个训练集样本，$(i)$ 为下标 |
