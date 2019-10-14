---
title: 机器学习第三周
date: 2019-10-10 14:11:00+08:00
type: machine-learning
tags: [machine-learning]
last_date: 2019-09-15 14:11:00+08:00
private: true
---

## 前言

## 一、分类

<details>
<summary>原文</summary>

To attempt classification, one method is to use linear regression and map all predictions greater than `0.5` as a `1` and all less than `0.5` as a `0`. However, this method doesn't work well because classification is not actually a linear function.

The classification problem is just like the regression problem, except that the values we now want to predict take on only a small number of discrete values. For now, we will focus on the binary classification problem in which y can take on only two values, 0 and 1. (Most of what we say here will also generalize to the multiple-class case.) For instance, if we are trying to build a spam classifier for email, then $x^(i)$ may be some features of a piece of email, and y may be 1 if it is a piece of spam mail, and 0 otherwise. Hence, `y∈{0,1}`. 0 is also called the negative class, and 1 the positive class, and they are sometimes also denoted by the symbols `-` and `+.` Given $x^(i)$, the corresponding $y^(i)$ is also called the label for the training example.

</details>

要尝试分类，一种方法是使用线性回归并将所有大于 `0.5` 的预测映射为 `1` 并将所有小于 `0.5` 的预测映射为 `0`。但是，此方法效果不佳，因为分类实际上不是线性函数。
分类问题就像回归问题一样，除了我们现在要预测的值仅包含少量离散值。现在，我们将重点讨论二进制分类问题，其中y只能采用两个值 `0` 和 `1`。（我们在这里所说的大多数内容也将推广到多类情况。）例如，如果我们尝试要为电子邮件构建垃圾邮件分类器，则 $x^(i)$ 可能是一封电子邮件的某些功能，如果它是一封垃圾邮件，则 `y` 为 `1`，否则为 `0`。因此，`y∈{0,1}`。 `0` 也称为否定类，`1` 也称为正类，有时也用符号 `-` 和 `+` 表示。给定 $x^(i)$，相应的 $y^(i)$ 为也称为培训示例的标签。

## 二、假设表示

<details>
<summary>原文</summary>

We could approach the classification problem ignoring the fact that y is discrete-valued, and use our old linear regression algorithm to try to predict y given x. However, it is easy to construct examples where this method performs very poorly. Intuitively, it also doesn’t make sense for $h_θ(x)$ to take values larger than `1` or smaller than `0` when we know that `y∈{0, 1}`. To fix this, let’s change the form for our hypotheses $h_θ(x)$ to satisfy $0 ≤ h_θ(x) ≤ 10$. This is accomplished by plugging $θ^Tx$ into the Logistic Function.

Our new form uses the "Sigmoid Function," also called the "Logistic Function":

$$
h_\theta (x) = g ( \theta^T x ) \newline
\newline
z = \theta^T x \newline
g(z) = \dfrac{1}{1 + e^{-z}}
$$

The following image shows us what the sigmoid function looks like:

![](/public/img/machine-learn/logistic_function.png)

The function g(z), shown here, maps any real number to the (0, 1) interval, making it useful for transforming an arbitrary-valued function into a function better suited for classification.

$h_θ(x)$ will give us the probability that our output is 1. For example, $h_θ(x)=0.7$ gives us a probability of 70% that our output is 1. Our probability that our prediction is 0 is just the complement of our probability that it is 1 (e.g. if probability that it is 1 is 70%, then the probability that it is 0 is 30%).

$$
h_\theta(x) = P(y=1 | x ; \theta) = 1 - P(y=0 | x ; \theta) \newline
P(y = 0 | x;\theta) + P(y = 1 | x ; \theta) = 1
$$

</details>

我们可以忽略 `y` 是离散值这一事实来处理分类问题，并使用我们的旧线性回归算法尝试在给定 `x` 的情况下预测 `y`。 但是，很容易构造这种方法效果很差的示例。 直观地讲，当我们知道 `y∈{0，1}` 时，$h_θ(x)$取大于1或小于0的值也没有意义。 为了解决这个问题，让我们更改假设 $h_θ(x)$ 的形式，使其满足 $0 ≤ h_θ(x) ≤ 10$。 这是通过将 $θ^Tx$ 插入逻辑函数来完成的。

我们的新形式使用 `Sigmoid函数`，也称为 `Logistic函数`：

$$
h_\theta (x) = g ( \theta^T x ) \newline
\newline
z = \theta^T x \newline
g(z) = \dfrac{1}{1 + e^{-z}}
$$

下图显示了 `Logistic函数` 的外观：

![](/public/img/machine-learn/logistic_function.png)

此处显示的函数 `g(z)` 将任何实数映射到 (0, 1) 区间，这对于将任意值函数转换为更适合分类的函数很有用。

$h_θ(x)$ 将给我们输出为 `1` 的概率。例如，$h_θ(x) = 0.7$给我们将输出为 `1` 的概率为 `70％`。我们预测为 `0` 的概率就是它是 `1` 的概率的补码（例如，如果它是 `1` 的概率是 `70％`，那么它是 `0` 的概率是 `30％`）。

$$
h_\theta(x) = P(y=1 | x ; \theta) = 1 - P(y=0 | x ; \theta) \newline
P(y = 0 | x;\theta) + P(y = 1 | x ; \theta) = 1
$$

## 三、决策边界


<details>
<summary>原文</summary>

In order to get our discrete `0` or `1` classification, we can translate the output of the hypothesis function as follows:

$$
h_\theta(x) \geq 0.5 \rightarrow y = 1 \newline
h_\theta(x) < 0.5 \rightarrow y = 0 \newline
$$

The way our logistic function g behaves is that when its input is greater than or equal to zero, its output is greater than or equal to `0.5`:

$$
g(z) \geq 0.5 \newline
when \; z \geq 0
$$

Remember.

$$
z=0, e^{0}=1 \Rightarrow g(z)=1/2\newline
z \to \infty, e^{-\infty} \to 0 \Rightarrow g(z)=1 \newline
z \to -\infty, e^{\infty}\to \infty \Rightarrow g(z)=0
$$

So if our input to g is $θ^TX$, then that means:

$$
h_\theta(x) = g(\theta^T x) \geq 0.5 \newline
when \; \theta^T x \geq 0
$$

From these statements we can now say:

$$
\theta^T x \geq 0 \Rightarrow y = 1 \newline
\theta^T x < 0 \Rightarrow y = 0 \newline
$$

The **decision boundary** is the line that separates the area where y = 0 and where y = 1. It is created by our hypothesis function.

**Example:**

$$
\theta = \begin{bmatrix}5 \newline
-1 \newline
0\end{bmatrix} \newline
y = 1 \; if \; 5 + (-1) x_1 + 0 x_2 \geq 0 \newline
5 - x_1 \geq 0 \newline
- x_1 \geq -5 \newline
x_1 \leq 5 \newline
$$

In this case, our decision boundary is a straight vertical line placed on the graph where $x1 = 5$, and everything to the left of that denotes $y = 1$, while everything to the right denotes $y = 0$.

Again, the input to the sigmoid function `g(z)` (e.g. $θ^TX$ doesn't need to be linear, and could be a function that describes a circle (e.g. $z = θ_0 + θ_1x_1^2 + θ_2x_2^2$) or any shape to fit our data.

</details>

为了获得离散的 `0` 或 `1` 分类，我们可以将假设函数的输出转换如下：

$$
h_\theta(x) \geq 0.5 \rightarrow y = 1 \newline
h_\theta(x) < 0.5 \rightarrow y = 0 \newline
$$

我们的逻辑函数 `g` 的行为方式是，当其输入大于或等于零时，其输出大于或等于 `0.5`：

$$
g(z) \geq 0.5 \newline
when \; z \geq 0
$$

记住。

$$
z=0, e^{0}=1 \Rightarrow g(z)=1/2\newline
z \to \infty, e^{-\infty} \to 0 \Rightarrow g(z)=1 \newline
z \to -\infty, e^{\infty}\to \infty \Rightarrow g(z)=0
$$

因此，如果我们对 `g` 的输入是 $θ^TX$，则意味着：

$$
h_\theta(x) = g(\theta^T x) \geq 0.5 \newline
when \; \theta^T x \geq 0
$$

从这些语句中，我们现在可以说：

$$
\theta^T x \geq 0 \Rightarrow y = 1 \newline
\theta^T x < 0 \Rightarrow y = 0 \newline
$$

**决策边界** 是分隔 $y = 0$ 和 $y = 1$ 区域的线。它是由我们的假设函数创建的。

**Example:**

$$
\theta = \begin{bmatrix}5 \newline
-1 \newline
0\end{bmatrix} \newline
y = 1 \; if \; 5 + (-1) x_1 + 0 x_2 \geq 0 \newline
5 - x_1 \geq 0 \newline
- x_1 \geq -5 \newline
x_1 \leq 5 \newline
$$

在这种情况下，我们的决策边界是放置在图形上的垂直直线，其中 $x1 = 5$，其中左边的所有内容表示 $y = 1$，而右边的所有内容表示 $y = 0$。

同样，`Logistic函数` `g(z)` 的输入（例如 $θ^TX$ 不需要是线性的，可以是描述圆的函数（例如 $z=θ_0 + θ_1x_1^2 + θ_2x_2^2$）或任何适合我们数据的形状。

## 分类的代价函数

We cannot use the same cost function that we use for linear regression because the Logistic Function will cause the output to be wavy, causing many local optima. In other words, it will not be a convex function.

Instead, our cost function for logistic regression looks like:

$$
J(\theta) = \dfrac{1}{m} \sum_{i=1}^m \mathrm{Cost}(h_\theta(x^{(i)}),y^{(i)}) \newline
\mathrm{Cost}(h_\theta(x),y) = -\log(h_\theta(x)) \;
\text{if y = 1} \newline
\mathrm{Cost}(h_\theta(x),y) = -\log(1-h_\theta(x)) \;
\text{if y = 0}
$$

![](/public/img/machine-learn/logistic_regression_cost_function_positive_class.png)

Similarly, when $y = 0$, we get the following plot for $J(θ)$ vs $h_θ(x)$:

![](/public/img/machine-learn/logistic_regression_cost_function_negative_class.png)

$$
\mathrm{Cost}(h_\theta(x),y) = 0 \text{ if } h_\theta(x) = y \newline
\mathrm{Cost}(h_\theta(x),y) \rightarrow \infty \text{ if } y = 0 \; \mathrm{and} \; h_\theta(x) \rightarrow 1 \newline
\mathrm{Cost}(h_\theta(x),y) \rightarrow \infty \text{ if } y = 1 \; \mathrm{and} \; h_\theta(x) \rightarrow 0 \newline
$$

If our correct answer 'y' is 0, then the cost function will be 0 if our hypothesis function also outputs 0. If our hypothesis approaches 1, then the cost function will approach infinity.

If our correct answer 'y' is 1, then the cost function will be 0 if our hypothesis function outputs 1. If our hypothesis approaches 0, then the cost function will approach infinity.

Note that writing the cost function in this way guarantees that $J(θ)$ is convex for logistic regression.

