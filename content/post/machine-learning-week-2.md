---
title: 机器学习第二周
date: 2019-09-15T06:11:00.000Z
tags:
  - machine-learning
lastmod: 2019-09-15T06:11:00.000Z
categories:
  - machine-learning
slug: machine-learning-week-2
draft: false
---

## 前言

继续上一篇的的学习，这一篇继续第二周的学习进度, 主要内容为多特征，Octave 使用。

<!--more-->

## 一、多个特征

<details>
<summary>原文</summary>

**Note:** [7:25 - <span class="katex">$1$</span> is a 1 by (n+1) matrix and not an (n+1) by 1 matrix]

Linear regression with multiple variables is also known as `multivariate linear regression`.

We now introduce notation for equations where we can have any number of input variables.

<div class="katex-display">
$$
x_j^{(i)} = \text{value of feature } j \text{ in the }i^{th}\text{ training example} \\
x^{(i)} = \text{the input (features) of the }i^{th}\text{ training example} \\
m = \text{the number of training examples} \\
n = \text{the number of features}
$$
</div>

The multivariable form of the hypothesis function accommodating these multiple features is as follows:

<span class="katex">$1$</span>

In order to develop intuition about this function, we can think about <span class="katex">$1$</span> as the basic price of a house, <span class="katex">$1$</span> as the price per square meter, <span class="katex">$1$</span> as the price per floor, etc. <span class="katex">$1$</span> will be the number of square meters in the house, <span class="katex">$1$</span> the number of floors, etc.

Using the definition of matrix multiplication, our multivariable hypothesis function can be concisely represented as:

<div class="katex-display">
$$
h_\theta(x) =\begin{bmatrix}\theta_0 \hspace{1em} \theta_1 \hspace{1em} ... \hspace{1em} \theta_n\end{bmatrix}\begin{bmatrix}x_0 \\
x_1 \\
\vdots \\
x_n\end{bmatrix}= \theta^T x
$$
</div>

This is a vectorization of our hypothesis function for one training example; see the lessons on vectorization to learn more.

Remark: Note that for convenience reasons in this course we assume <span class="katex">$1$</span>. This allows us to do matrix operations with theta and x. Hence making the two vectors '<span class="katex">$1$</span>' and <span class="katex">$1$</span> match each other element-wise (that is, have the same number of elements: n+1).]

</details>

**Note:** <span class="katex">$1$</span> 是 `1 * (n+1)` 的矩阵（横）而不是 `(n+1) * 1` 的矩阵（纵）

具有多个变量的线性回归也称为 `多元线性回归`。

我们现在为方程式引入符号，其中我们可以有任意数量的输入变量。

<div class="katex-display">
$$
x_j^{(i)} = \text{第 } i^{th} \text{ 个训练样例中特征 } j \text{ 的值}\\
x^{(i)} = \text{第 }i^{th} \text{ 个训练样例的输入（特征）}\\
m = \text{训练样本数量} \\
n = \text{特征变量数量}
$$
</div>

适应这些多个特征的假设函数的多变量形式如下：

<span class="katex">$1$</span>

为了发展关于这个功能的直觉，我们可以考虑 <span class="katex">$1$</span> 作为房子的基本价格，<span class="katex">$1$</span> 作为每平方米的价格，<span class="katex">$1$</span> 作为每层的价格等等。<span class="katex">$1$</span> 将是房子里的平方米数，<span class="katex">$1$</span> 楼层数等。

使用矩阵乘法的定义，我们的多变量假设函数可以简洁地表示为：

<div class="katex-display">
$$
h_\theta(x) =\begin{bmatrix}\theta_0 \hspace{1em} \theta_1 \hspace{1em} ... \hspace{1em} \theta_n\end{bmatrix}\begin{bmatrix}x_0 \\
x_1 \\
\vdots \\
x_n\end{bmatrix}= \theta^T x
$$
</div>

这是一个训练例子的假设函数的矢量化;请参阅有关矢量化的课程以了解更多信息。

Remark: 请注意，为了方便起见，在本课程中我们假设 <span class="katex">$1$</span>. 这允许我们用 theta 和 x 进行矩阵运算。因此，使两个向量 '<span class="katex">$1$</span>' 和 <span class="katex">$1$</span> 彼此元素匹配（即，具有相同数量的元素：n + 1）。

## 二、多个特征变量的梯度下降

<details>
<summary>原文</summary>

The gradient descent equation itself is generally the same form; we just have to repeat it for our `n` features:

<div class="katex-display">
$$
\text{repeat until convergence:} \; \lbrace \\
\; \theta_0 := \theta_0 - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_0^{(i)}\\
\; \theta_1 := \theta_1 - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_1^{(i)} \\
\; \theta_2 := \theta_2 - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_2^{(i)} \\
\vdots \\
\rbrace
$$
</div>

In other words:

<div class="katex-display">
$$
\text{repeat until convergence:} \; \lbrace \\
\; \theta_j := \theta_j - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_j^{(i)} \; \text{for j := 0...n}\\
\rbrace
$$
</div>

The following image compares gradient descent with one variable to gradient descent with multiple variables:

![](/public/img/machine-learn/2016-11-09-09.07.04.png)

</details>

梯度下降方程本身通常是相同的形式。 我们只需要为我们的 `n` 个特征重复一下：

<div class="katex-display">
$$
\text{repeat until convergence:} \; \lbrace \\
\; \theta_0 := \theta_0 - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_0^{(i)}\\
\; \theta_1 := \theta_1 - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_1^{(i)} \\
\; \theta_2 := \theta_2 - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_2^{(i)} \\
\vdots \\
\rbrace
$$
</div>

换句话说：

<div class="katex-display">
$$
\text{repeat until convergence:} \; \lbrace \\
\; \theta_j := \theta_j - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_j^{(i)} \; \text{for j := 0...n}\\
\rbrace
$$
</div>

下图将具有一个特征变量的梯度下降与具有多个多个变量的梯度下降进行比较：

![](/public/img/machine-learn/2016-11-09-09.07.04.png)

## 三、梯度下降实践 1 - 特征缩放

<details>
<summary>原文</summary>

Note: The average size of a house is `1000` but `100` is accidentally written instead

We can speed up gradient descent by having each of our input values in roughly the same range. This is because θ will descend quickly on small ranges and slowly on large ranges, and so will oscillate inefficiently down to the optimum when the variables are very uneven.

The way to prevent this is to modify the ranges of our input variables so that they are all roughly the same. Ideally:

<div class="katex-display">
$$
-1 ≤ x_{(i)} ≤ 1\\
\text{or}\\
-0.5 ≤ x_{(i)} ≤ 0.5
$$
</div>

These aren't exact requirements; we are only trying to speed things up. The goal is to get all input variables into roughly one of these ranges, give or take a few.

Two techniques to help with this are **feature scaling** and **mean normalization**. Feature scaling involves dividing the input values by the range (i.e. the maximum value minus the minimum value) of the input variable, resulting in a new range of just 1. Mean normalization involves subtracting the average value for an input variable from the values for that input variable resulting in a new average value for the input variable of just zero. To implement both of these techniques, adjust your input values as shown in this formula:

<div class="katex-display">
$$
x_i := \dfrac{x_i - \mu_i}{s_i}
$$
</div>

Where <span class="katex">$1$</span> is the **average** of all the values for feature (i) and <span class="katex">$1$</span> is the range of values (max - min), or <span class="katex">$1$</span> is the standard deviation.

Note that dividing by the range, or dividing by the standard deviation, give different results. The quizzes in this course use range - the programming exercises use standard deviation.

For example, if represents housing prices with a range of `100` to `2000` and a mean value of `1000`, then, <span class="katex">$1$</span>.

</details>

Note: 房屋的平均大小为 `1000`，但也可故意写为 `100`

我们可以通过将每个输入值设置在大致相同的范围内来加快梯度下降的速度。 这是因为 <span class="katex">$1$</span> 在小范围内会迅速下降，而在大范围内会缓慢下降，因此当变量非常不均匀时，会无效率地振荡到最佳状态。

防止这种情况的方法是修改输入变量的范围，以使它们都大致相同。理想的情况是：

<div class="katex-display">
$$
-1 ≤ x_{(i)} ≤ 1\\
\text{or}\\
-0.5 ≤ x_{(i)} ≤ 0.5
$$
</div>

这些不是确切的要求； 我们只是试图加快速度。 目标是使所有输入变量大致进入这些范围之一，给出或取几个。

两种有助于此目的的技术是 **特征缩放** 和 **平均归一化**。 特征缩放涉及将输入值除以输入变量的范围（即最大值减去最小值），从而得到新的范围仅为 `1`。平均归一化涉及从输入值的平均值中减去输入变量的平均值。 输入变量导致输入变量的新平均值仅为零。 要实现这两种技术，请按照以下公式调整输入值：

<div class="katex-display">
$$
x_i := \dfrac{x_i - \mu_i}{s_i}
$$
</div>

其中 <span class="katex">$1$</span> 是特征 <span class="katex">$1$</span> 所有值的 **平均值**，而 <span class="katex">$1$</span> 是值的范围（最大值-最小值），或 <span class="katex">$1$</span> 是标准偏差。

请注意，除以范围或除以标准偏差会得出不同的结果。 本课程中的测验使用范围-编程练习使用标准偏差。

例如，如果代表的房价范围为 `100` 至 `2000`，平均值为 `1000`，则，<span class="katex">$1$</span>。

## 四、梯度下降实践 1 - 学习速率

<details>
<summary>原文</summary>

Note: the x-axis label in the right graph should be <span class="katex">$1$</span> rather than No. of iterations

Debugging gradient descent. Make a plot with number of iterations on the x-axis. Now plot the cost function, <span class="katex">$1$</span> over the number of iterations of gradient descent. If J(θ) ever increases, then you probably need to decrease <span class="katex">$1$</span>.

Automatic convergence test. Declare convergence if <span class="katex">$1$</span> decreases by less than E in one iteration, where E is some small value such as <span class="katex">$1$</span>. However in practice it's difficult to choose this threshold value.

![](/public/img/machine-learn/2016-11-09-09.35.59.png)

It has been proven that if learning rate α is sufficiently small, then J(θ) will decrease on every iteration.

![](/public/img/machine-learn/2016-11-11-08.55.21.png)

To summarize:

If <span class="katex">$1$</span> is too small: slow convergence.

If <span class="katex">$1$</span> is too large: may not decrease on
every iteration and thus may not converge.

</details>

Note: 右图中的 x 轴标签应为 <span class="katex">$1$</span> 而不是迭代次数。

调试梯度下降。 绘制一个在 x 轴上具有迭代次数的图。 现在在梯度下降的迭代次数上绘制成本函数 <span class="katex">$1$</span>。 如果 <span class="katex">$1$</span> 曾经增加，那么您可能需要减少 <span class="katex">$1$</span>。

自动收敛测试。 如果 <span class="katex">$1$</span> 在一次迭代中减小的幅度小于 E，则声明收敛，其中 E 是一些小值，例如 <span class="katex">$1$</span>。 但是实际上，很难选择此阈值。

![](/public/img/machine-learn/2016-11-09-09.35.59.png)

已经证明，如果学习率 <span class="katex">$1$</span> 足够小，则 <span class="katex">$1$</span> 将在每次迭代中减小。

![](/public/img/machine-learn/2016-11-11-08.55.21.png)

总结一下：

如果 <span class="katex">$1$</span> 太小：收敛缓慢。

如果 <span class="katex">$1$</span> 太大：可能不会在每次迭代中都减少，因此可能不会收敛。

## 五、特征和多项式的回归函数

<details>
<summary>原文</summary>
We can improve our features and the form of our hypothesis function in a couple different ways.

We can combine multiple features into one. For example, we can combine <span class="katex">$1$</span> and <span class="katex">$1$</span> into a new feature <span class="katex">$1$</span> by taking <span class="katex">$1$</span>⋅<span class="katex">$1$</span>.

**Polynomial Regression**

Our hypothesis function need not be linear (a straight line) if that does not fit the data well.

We can change the behavior or curve of our hypothesis function by making it a quadratic, cubic or square root function (or any other form).

For example, if our hypothesis function is <span class="katex">$1$</span> then we can create additional features based on <span class="katex">$1$</span>, to get the quadratic function <span class="katex">$1$</span> or the cubic function <span class="katex">$1$</span>

In the cubic version, we have created new features <span class="katex">$1$</span> and <span class="katex">$1$</span> where <span class="katex">$1$</span> and <span class="katex">$1$</span>.

To make it a square root function, we could do: <span class="katex">$1$</span>

One important thing to keep in mind is, if you choose your features this way then feature scaling becomes very important.

eg. if <span class="katex">$1$</span> has range 1 - 1000 then range of <span class="katex">$1$</span> becomes 1 - 1000000 and that of <span class="katex">$1$</span> becomes 1 - 1000000000

</details>

我们可以通过几种不同的方式来改进我们的特征和假设函数的形式。

我们可以将多个功能组合为一个。例如，我们可以采用 <span class="katex">$1$</span> ⋅ <span class="katex">$1$</span>，将 <span class="katex">$1$</span> 和 <span class="katex">$1$</span> 组合成一个新功能 <span class="katex">$1$</span>。

**多项式回归**

如果我们的假设函数不太适合数据的分布，则不必是线性的（直线）。

我们可以通过将其设为二次，三次或平方根函数（或任何其他形式）来更改假设函数的行为或曲线。

例如，如果我们的假设函数是 <span class="katex">$1$</span>，那么我们可以基于 <span class="katex">$1$</span> 创建其他特征，以获得二次函数 <span class="katex">$1$</span> 或三次函数 <span class="katex">$1$</span>

在三次版本中，我们创建了新特征 <span class="katex">$1$</span> 和 <span class="katex">$1$</span>，其中 <span class="katex">$1$</span> 和 <span class="katex">$1$</span>。

要使它成为平方根函数，我们可以这样做：<span class="katex">$1$</span>

要记住的一件事是，如果以这种方式选择要素，则特征缩放变得非常重要。

例如。如果 <span class="katex">$1$</span> 的范围为 1-1000，则 <span class="katex">$1$</span> 的范围为 1-1000000，而 <span class="katex">$1$</span> 的范围为 1-1000000000

## 六、正规方程

<details>
<summary>原文</summary>

Note: he design matrix X (in the bottom right side of the slide) given in the example should have elements x with subscript 1 and superscripts varying from 1 to m because for all m training sets there are only 2 features <span class="katex">$1$</span> and <span class="katex">$1$</span>; The X matrix is m by (n+1) and NOT n by n.

Gradient descent gives one way of minimizing J. Let’s discuss a second way of doing so, this time performing the minimization explicitly and without resorting to an iterative algorithm. In the "Normal Equation" method, we will minimize J by explicitly taking its derivatives with respect to the θj ’s, and setting them to zero. This allows us to find the optimum theta without iteration. The normal equation formula is given below:

<div class="katex-display">
$$
\theta = (X^T X)^{-1}X^T y
$$
</div>

```text
pinv(X' * X) * X' * y
```

![](/public/img/machine-learn/2016-11-10-10.06.16.png)

There is **no need** to do feature scaling with the normal equation.

The following is a comparison of gradient descent and the normal equation:

|      Gradient Descent      |                Normal Equation                 |
| :------------------------: | :--------------------------------------------: |
|    Need to choose alpha    |            No need to choose alpha             |
|   Needs many iterations    |               No need to iterate               |
|         <span class="katex">$1$</span>          | <span class="katex">$1$</span>, need to calculate inverse of <span class="katex">$1$</span> |
| Works well when n is large |            Slow if n is very large             |

With the normal equation, computing the inversion has complexity <span class="katex">$1$</span>. So if we have a very large number of features, the normal equation will be slow. In practice, when n exceeds 10,000 it might be a good time to go from a normal solution to an iterative process.

</details>

Note: 在示例中给出的设计矩阵 X（在幻灯片的右下角）应具有元素 x，其下标 1 和上标的范围从 1 到 m，因为对于所有 m 个训练集，只有 2 个特征 <span class="katex">$1$</span> 和 <span class="katex">$1$</span>; X 矩阵的 m 乘 (n + 1)，而不是 n \* n。

梯度下降提供了一种最小化 J 的方法。让我们讨论这样做的第二种方法，这一次显式地执行最小化，而不求助于迭代算法。 在 `正态方程` 方法中，我们将通过显式地将其关于 θj 的导数并将其设置为零来最小化 J。 这使我们无需迭代即可找到最佳 θ。 正态方程公式如下：

<div class="katex-display">
$$
\theta = (X^T X)^{-1}X^T y
$$
</div>

`octave` 的代码公式

```text
pinv(X' * X) * X' * y
```

正规方程**无需**使用特征缩放。

以下是梯度下降与正规方程的比较：

|     梯度下降      |           正规方程           |
| :---------------: | :--------------------------: |
| 需要选择 <span class="katex">$1$</span> |     不需要选择 <span class="katex">$1$</span>      |
|   需要多次迭代    |        不需要进行迭代        |
|     <span class="katex">$1$</span>     | <span class="katex">$1$</span>, 需要计算逆 <span class="katex">$1$</span> |
| 当 n 大时效果很好 |     如果 n 很大，则变慢      |


利用正规方程，计算反演的复杂度为 <span class="katex">$1$</span>。 因此，如果我们具有大量特征，则正常方程将变慢。 在实践中，当 n 超过 10,000 时，可能是从常规解转到迭代过程的好时机。

## 七、测验

<details>
<summary>原文</summary>

---

1. Suppose m=4 students have taken some class, and the class had a midterm exam and a final exam. You have collected a dataset of their scores on the two exams, which is as follows:
>
| midterm exam | (midterm exam)^2 | final exam |
| -- | -- | -- |
| 89 | 7921 | 96 |
| 72 | 5184 | 74 |
| 94 | 8836 | 87 |
| 69 | 4761 | 78 |
>
You'd like to use polynomial regression to predict a student's final exam score from their midterm exam score. Concretely, suppose you want to fit a model of the form <span class="katex">$1$</span>, where <span class="katex">$1$</span> is the midterm score and <span class="katex">$1$</span> is (midterm score)^2. Further, you plan to use both feature scaling (dividing by the "max-min", or range, of a feature) and mean normalization.
What is the normalized feature <span class="katex">$1$</span>? (Hint: midterm = 69, final = 78 is training example 4.) Please round off your answer to two decimal places and enter in the text box below.

---

2. You run gradient descent for 15 iterations
with <span class="katex">$1$</span> and compute
<span class="katex">$1$</span> after each iteration. You find that the
value of <span class="katex">$1$</span> decreases quickly then levels
off. Based on this, which of the following conclusions seems
most plausible?
>
- a. <span class="katex">$1$</span> is an effective choice of learning rate.
- b. Rather than use the current value of <span class="katex">$1$</span>, it'd be more promising to try a smaller value of <span class="katex">$1$</span> (say <span class="katex">$1$</span>).
- c. Rather than use the current value of <span class="katex">$1$</span>, it'd be more promising to try a smaller value of <span class="katex">$1$</span> (say <span class="katex">$1$</span>).

---

3. Suppose you have <span class="katex">$1$</span> training examples with <span class="katex">$1$</span> features (excluding the additional all-ones feature for the intercept term, which you should add). The normal equation is <span class="katex">$1$</span>. For the given values of <span class="katex">$1$</span> and <span class="katex">$1$</span>, what are the dimensions of <span class="katex">$1$</span>, <span class="katex">$1$</span>, and <span class="katex">$1$</span> in this equation?
>
- a. <span class="katex">$1$</span> is <span class="katex">$1$</span>, <span class="katex">$1$</span> is <span class="katex">$1$</span>, <span class="katex">$1$</span> is <span class="katex">$1$</span>
- b. <span class="katex">$1$</span> is <span class="katex">$1$</span>, <span class="katex">$1$</span> is <span class="katex">$1$</span>, <span class="katex">$1$</span> is <span class="katex">$1$</span>
- c. <span class="katex">$1$</span> is <span class="katex">$1$</span>, <span class="katex">$1$</span> is <span class="katex">$1$</span>, <span class="katex">$1$</span> is <span class="katex">$1$</span>
- d. <span class="katex">$1$</span> is <span class="katex">$1$</span>, <span class="katex">$1$</span> is <span class="katex">$1$</span>, <span class="katex">$1$</span> is <span class="katex">$1$</span>

---

4. Suppose you have a dataset with <span class="katex">$1$</span> examples and <span class="katex">$1$</span> features for each example. You want to use multivariate linear regression to fit the parameters <span class="katex">$1$</span> to our data. Should you prefer gradient descent or the normal equation?
>
- a. Gradient descent, since it will always converge to the optimal <span class="katex">$1$</span>.
- b. Gradient descent, since <span class="katex">$1$</span> will be very slow to compute in the normal equation.
- c. The normal equation, since it provides an efficient way to directly find the solution.
- d. The normal equation, since gradient descent might be unable to find the optimal <span class="katex">$1$</span>.

---

5. Which of the following are reasons for using feature scaling?(many select)
>
- a. It prevents the matrix <span class="katex">$1$</span> (used in the normal equation) from being non-invertable (singular/degenerate).
- b. It speeds up gradient descent by making it require fewer iterations to get to a good solution.
- c. It speeds up solving for <span class="katex">$1$</span> using the normal equation.
- d. It is necessary to prevent gradient descent from getting stuck in local optima.

</details>

---

1. 假设 <span class="katex">$1$</span> 个学生参加了某堂课，并且该班进行了期中考试和期末考试。 您已经收集了两次考试的分数数据集，如下所示：
>
| 期中考试 | <span class="katex">$1$</span> | 期末考试 |
| -- | -- | -- |
| 89 | 7921 | 96 |
| 72 | 5184 | 74 |
| 94 | 8836 | 87 |
| 69 | 4761 | 78 |
>
您想使用多项式回归来根据学生的期中考试成绩来预测学生的期末考试成绩。 具体来说，假设您要拟合 <span class="katex">$1$</span> 形式的模型，其中 <span class="katex">$1$</span> 是期中分数，<span class="katex">$1$</span> 是 <span class="katex">$1$</span>。 此外，您计划同时使用特征缩放（除以特征的 `max - min` 或范围）和均值归一化。
什么是标准化特征 <span class="katex">$1$</span>？ （提示：期中 = 69，期末 = 78是训练示例4。）请四舍五入到小数点后两位，然后在下面的文本框中输入。

---

2. 您运行梯度下降 15 次迭代
<span class="katex">$1$</span> 并计算
每次迭代后的 <span class="katex">$1$</span>。 您发现
<span class="katex">$1$</span> 的值迅速下降，然后下降
关闭。 基于此，以下哪个结论似乎
最合理？
>
- a. <span class="katex">$1$</span> 是学习率的有效选择。
- b. 与其使用 <span class="katex">$1$</span> 的当前值，不如尝试使用较小的 <span class="katex">$1$</span> 值（例如 <span class="katex">$1$</span>）。
- c. 与其使用 <span class="katex">$1$</span> 的当前值，不如尝试使用较大的 <span class="katex">$1$</span> 值（例如 <span class="katex">$1$</span>）。

---

3. 假设您有 <span class="katex">$1$</span> 个训练示例，其中包含 <span class="katex">$1$</span> 个特征（不包括用于拦截项的附加全一功能，您应该添加该功能）。 正规方程为 <span class="katex">$1$</span>。 对于给定的 <span class="katex">$1$</span> 和 <span class="katex">$1$</span> 值，方程中 <span class="katex">$1$</span>，<span class="katex">$1$</span> 和 <span class="katex">$1$</span> 的尺寸分别是多少？
>
- a. <span class="katex">$1$</span> 是 <span class="katex">$1$</span>, <span class="katex">$1$</span> 是 <span class="katex">$1$</span>, <span class="katex">$1$</span> 是 <span class="katex">$1$</span>
- b. <span class="katex">$1$</span> 是 <span class="katex">$1$</span>, <span class="katex">$1$</span> 是 <span class="katex">$1$</span>, <span class="katex">$1$</span> 是 <span class="katex">$1$</span>
- c. <span class="katex">$1$</span> 是 <span class="katex">$1$</span>, <span class="katex">$1$</span> 是 <span class="katex">$1$</span>, <span class="katex">$1$</span> 是 <span class="katex">$1$</span>
- d. <span class="katex">$1$</span> 是 <span class="katex">$1$</span>, <span class="katex">$1$</span> 是 <span class="katex">$1$</span>, <span class="katex">$1$</span> 是 <span class="katex">$1$</span>

---

4. 假设您有一个包含 <span class="katex">$1$</span> 个示例和每个示例 <span class="katex">$1$</span> 个特征的数据集。 您想使用多元线性回归将参数 <span class="katex">$1$</span> 拟合到我们的数据中。 您应该选择 `梯度下降` 还是 `正规方程`？
>
- a. 梯度下降，因为它将始终收敛到最佳 <span class="katex">$1$</span>。
- b. 梯度下降，因为在正规方程中 <span class="katex">$1$</span> 的计算将非常缓慢。
- c. 正规方程，因为它提供了直接找到解的有效方法。
- d. 正规方程，因为梯度下降可能无法找到最佳的 <span class="katex">$1$</span>。

---

5. 以下哪些是使用特征缩放的原因？（多选）
>
- a. 这样可以防止矩阵 <span class="katex">$1$</span>（在正常方程式中使用）不可逆（奇异/简并）。
- b. 它通过减少迭代次数来获得良好的解决方案，从而加快了梯度下降的速度。
- c. 它可以使用法线方程加快求解 <span class="katex">$1$</span> 的速度。
- d. 有必要防止梯度下降陷入局部最优状态。


<details>
<summary>答案</summary>

1. `0.47` <span class="katex">$1$</span>, <span class="katex">$1$</span>, <span class="katex">$1$</span>.
2. `a`, 刚好匹配就是快速计算出正确的值，太大 <span class="katex">$1$</span> 可能会出现增大，太小会出现 <span class="katex">$1$</span> 值的下降缓慢。
3. `a`
4. `c`
5. `b`, a: 特征缩放仅对梯度下降方程有效，c: 并不会加快线性方程，d: 特征缩放无法处理局部最优解。
</details>

## 八、Octave 使用

python 环境下需要导入以下库
``` py
import numpy as np
import matplotlib.pyplot as plt
```

| 说明 | Octave | Python + Numpy + Matplotlib |
|:----:|:----:|:----:|
| 加 | `1 + 2` | `1 + 2` |
| 减 | `1 - 2` | `1 - 2` |
| 乘 | `1 * 2` | `1 * 2` |
| 除 | `1 / 2` | `1 / 2` |
| 幂 | `1 ^ 2` | `1 ** 2` |
| 抑制结果打印 | `${表达式};` | - |
| 逻辑或 | `a \|\| b` | `a or b` |
| 逻辑与 | `a && b` | `a and b` |
| 位异或 | `XOR(a, b)` | `a ^ b` |
| 等于 | `a == b` | `a == \|\| is b` |
| 不等于 | `a ~= b` | `a != \|\| not is b` |
| 大于 | `a > b` | `a > b` |
| 小于 | `a < b` | `a < b` |
| 大于等于 | `a >= b` | `a >= b` |
| 小于等于 | `a <= b` | `a <= b` |
| 打印变量 | `disp(a)` | `print(a)` |
| 字符串格式化 | `sprintf('%0.2f', a)` | `'%0.2f' % a` |
| 创建矩阵 | `a = [1 2; 3 4; 5 6]` | `a = np.array([(1, 2), (3, 4), (5, 6)]` |
| 递进创建向量 | `a = [1:0.1:2]` | `a = np.arange(1, 2 + 0.1, 0.1)` |
| 填充创建矩阵 | `a = 2 * ones(2, 3)` | `a = 2 * np.ones((2, 3), dtype=np.uint32)` |
| 创建随机填充的矩阵 | `a = rand(2, 3)` | `a = np.random.rand(2, 3)` |
| 高斯分布矩阵 | `a = randn(2, 3)` | `a = np.random.randn(2, 3)` |
| 对角矩阵 | `a = eye(3)` | `a = np.eye(3)` |
| 矩阵大小 | `sz = size(a)` | `sz = np.shape(a)` |
| 加载磁盘上的数据 | `load('file')` | `a = numpy.load('file')` |
| 保存变量 | `save 'file' a` | `numpy.save('file', a)` |
| 保存变量到纯文本 | `save 'file' a -ascii` | `numpy.savetxt('file', a)` |
| 查看全部变量 | `who` | - |
| 查看全部变量详情 | `whos` | - |
| 清理变量 | `clear a` | - |
| 矩阵元素访问 | `a(1, 1)` | `a[0][0]` or `a[0, 0]` |
| 矩阵行访问 | `a(1, :)` | `a[0]` or `a[0, :]` |
| 矩阵列访问 | `a(:, 1)` | `a[:, 0]` |
| 矩阵限制列或行 | `a(:, [1 2])` | `a[:, (0, 1)]` |
| 增加一列(合并列) | `a = [a [8; 9]]` | `np.c_(a, np.array([[8, 9]]).T)` |
| 增加一行(合并行) | `a = [a; [8 9 10]]` | `np.r_(a, np.array([[8, 9, 10]]))` |
| 矩阵转行向量 | `a(:)` | `a.flatten()` or `a.ravel()` |
| 矩阵乘法 | `a .* b` | `a * b` |
| 矩阵转置 | `a'` | `a.T` |
| 矩阵绝对值 | `abs(a)` | `np.abs(a)` |
| 矩阵平方根 | `sqrt(a)` | `np.sqrt(a)` |
| 矩阵对数 | `log(a)` | `np.log(a)` |
| 矩阵最大值 | `max(a)` | `np.max(a)` |
| 矩阵最小值 | `min(a)` | `np.min(a)` |
| 矩阵求和 | `sum(a)` | `np.sum(a)` |
| 矩阵求乘积 | `prod(a)` | `np.prod(a)` |
| 矩阵向下取整 | `floor(a)` | `np.floor(a)` |
| 矩阵向上取整 | `ceil(a)` | `np.ceil(a)` |
| 矩阵元素比较 | `a > 1` | `a > 1` |
| 矩阵根据比较结果矩阵过滤 | `find(a >1)` | `a[a > 1]` |
| 幻方矩阵 | `magic(3)` | 可自行实现 |
| 矩阵求逆 | `pinv(a)` | `np.linalg.pinv(a)` |
| 矩阵正弦函数 | `sin(a)` | `np.sin(a)` |
| 绘制线性函数 | `polt(t, y1)` | `plt.polt(t, y1)` |
| 绘制分布柱型图 | `w = -6 + sqrt(10) * randn(1, 100);hist(w, 10)` | `w = -6 + math.sqrt(10) * np.random.randn(1, 100);plt.hist(w[0], 10)` |


## 八、参考

1. [c-printf](http://www.cplusplus.com/reference/cstdio/printf/): c字符串格式化说明。
2. [numpy手册](https://www.numpy.org.cn/reference/)
3. [matplotlib手册](https://www.matplotlib.org.cn/)
4. [scipy手册](https://docs.scipy.org/doc/scipy/reference/)
