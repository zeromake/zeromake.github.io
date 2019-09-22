---
title: 机器学习第二周
date: 2019-09-15 14:11:00+08:00
type: machine-learning
tags: [machine-learning]
last_date: 2019-09-15 14:11:00+08:00
private: false
---

## 前言

-   继续上一篇的的学习，但是明显发现我的进度完全不够快，拖延症还是泛滥了。
-   这一篇继续第二周的学习进度。

<!--more-->

## 一、多个特征

<details>
<summary>原文</summary>

**Note:** [7:25 - $θ^T$ is a 1 by (n+1) matrix and not an (n+1) by 1 matrix]

Linear regression with multiple variables is also known as `multivariate linear regression`.

We now introduce notation for equations where we can have any number of input variables.

$$
x_j^{(i)} = \text{value of feature } j \text{ in the }i^{th}\text{ training example} \\
x^{(i)} = \text{the input (features) of the }i^{th}\text{ training example} \\
m = \text{the number of training examples} \\
n = \text{the number of features}
$$

The multivariable form of the hypothesis function accommodating these multiple features is as follows:

$h_\theta (x) = \theta_0 + \theta_1 x_1 + \theta_2 x_2 + \theta_3 x_3 + \cdots + \theta_n x_n$

In order to develop intuition about this function, we can think about $θ_0$ as the basic price of a house, $θ_1$ as the price per square meter, $θ_2$ as the price per floor, etc. $x_1$ will be the number of square meters in the house, $x_2$ the number of floors, etc.

Using the definition of matrix multiplication, our multivariable hypothesis function can be concisely represented as:

$$
h_\theta(x) =\begin{bmatrix}\theta_0 \hspace{1em} \theta_1 \hspace{1em} ... \hspace{1em} \theta_n\end{bmatrix}\begin{bmatrix}x_0 \\
x_1 \\
\vdots \\
x_n\end{bmatrix}= \theta^T x
$$

This is a vectorization of our hypothesis function for one training example; see the lessons on vectorization to learn more.

Remark: Note that for convenience reasons in this course we assume $x_{0}^{(i)} = 1 \text{ for } (i\in { 1,\dots, m })$. This allows us to do matrix operations with theta and x. Hence making the two vectors '$\theta$' and $x^{(i)}$ match each other element-wise (that is, have the same number of elements: n+1).]

</details>

**Note:** $θ^T$ 是 `1 * (n+1)` 的矩阵（横）而不是 `(n+1) * 1` 的矩阵（纵）

具有多个变量的线性回归也称为 `多元线性回归`。

我们现在为方程式引入符号，其中我们可以有任意数量的输入变量。

$$
x_j^{(i)} = \text{第 } i^{th} \text{ 个训练样例中特征 } j \text{ 的值}\\
x^{(i)} = \text{第 }i^{th} \text{ 个训练样例的输入（特征）}\\
m = \text{训练样本数量} \\
n = \text{特征变量数量}
$$

适应这些多个特征的假设函数的多变量形式如下：

$h_\theta (x) = \theta_0 + \theta_1 x_1 + \theta_2 x_2 + \theta_3 x_3 + \cdots + \theta_n x_n$

为了发展关于这个功能的直觉，我们可以考虑 $θ_0$ 作为房子的基本价格，$θ_1$ 作为每平方米的价格，$θ_2$ 作为每层的价格等等。$x_1$ 将是房子里的平方米数，$x_2$ 楼层数等。

使用矩阵乘法的定义，我们的多变量假设函数可以简洁地表示为：

$$
h_\theta(x) =\begin{bmatrix}\theta_0 \hspace{1em} \theta_1 \hspace{1em} ... \hspace{1em} \theta_n\end{bmatrix}\begin{bmatrix}x_0 \\
x_1 \\
\vdots \\
x_n\end{bmatrix}= \theta^T x
$$

这是一个训练例子的假设函数的矢量化;请参阅有关矢量化的课程以了解更多信息。

Remark: 请注意，为了方便起见，在本课程中我们假设 $x_{0}^{(i)} = 1 \text{ for } (i\in { 1,\dots, m })$. 这允许我们用 theta 和 x 进行矩阵运算。因此，使两个向量 '$\theta$' 和 $x^{(i)}$ 彼此元素匹配（即，具有相同数量的元素：n + 1）。

## 二、多个特征变量的梯度下降

<details>
<summary>原文</summary>

The gradient descent equation itself is generally the same form; we just have to repeat it for our `n` features:

$$
\text{repeat until convergence:} \; \lbrace \\
\; \theta_0 := \theta_0 - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_0^{(i)}\\
\; \theta_1 := \theta_1 - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_1^{(i)} \\
\; \theta_2 := \theta_2 - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_2^{(i)} \\
\vdots \\
\rbrace
$$

In other words:

$$
\text{repeat until convergence:} \; \lbrace \\
\; \theta_j := \theta_j - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_j^{(i)} \; \text{for j := 0...n}\\
\rbrace
$$

The following image compares gradient descent with one variable to gradient descent with multiple variables:

![](/public/img/machine-learn/2016-11-09-09.07.04.png)

</details>

梯度下降方程本身通常是相同的形式。 我们只需要为我们的 `n` 个特征重复一下：

$$
\text{repeat until convergence:} \; \lbrace \\
\; \theta_0 := \theta_0 - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_0^{(i)}\\
\; \theta_1 := \theta_1 - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_1^{(i)} \\
\; \theta_2 := \theta_2 - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_2^{(i)} \\
\vdots \\
\rbrace
$$

换句话说：

$$
\text{repeat until convergence:} \; \lbrace \\
\; \theta_j := \theta_j - \alpha \frac{1}{m} \sum\limits_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) \cdot x_j^{(i)} \; \text{for j := 0...n}\\
\rbrace
$$

下图将具有一个特征变量的梯度下降与具有多个多个变量的梯度下降进行比较：

![](/public/img/machine-learn/2016-11-09-09.07.04.png)

## 三、梯度下降实践 1 - 特征缩放

<details>
<summary>原文</summary>

Note: The average size of a house is `1000` but `100` is accidentally written instead

We can speed up gradient descent by having each of our input values in roughly the same range. This is because θ will descend quickly on small ranges and slowly on large ranges, and so will oscillate inefficiently down to the optimum when the variables are very uneven.

The way to prevent this is to modify the ranges of our input variables so that they are all roughly the same. Ideally:

$$
-1 ≤ x_{(i)} ≤ 1\\
\text{or}\\
-0.5 ≤ x_{(i)} ≤ 0.5
$$

These aren't exact requirements; we are only trying to speed things up. The goal is to get all input variables into roughly one of these ranges, give or take a few.

Two techniques to help with this are **feature scaling** and **mean normalization**. Feature scaling involves dividing the input values by the range (i.e. the maximum value minus the minimum value) of the input variable, resulting in a new range of just 1. Mean normalization involves subtracting the average value for an input variable from the values for that input variable resulting in a new average value for the input variable of just zero. To implement both of these techniques, adjust your input values as shown in this formula:

$$
x_i := \dfrac{x_i - \mu_i}{s_i}
$$

Where $μ_i$ is the **average** of all the values for feature (i) and $s_i$ is the range of values (max - min), or $s_i$ is the standard deviation.

Note that dividing by the range, or dividing by the standard deviation, give different results. The quizzes in this course use range - the programming exercises use standard deviation.

For example, if represents housing prices with a range of `100` to `2000` and a mean value of `1000`, then, $x_i := \dfrac{price-1000}{1900}$.

</details>

Note: 房屋的平均大小为 `1000`，但也可故意写为 `100`

我们可以通过将每个输入值设置在大致相同的范围内来加快梯度下降的速度。 这是因为 $θ$ 在小范围内会迅速下降，而在大范围内会缓慢下降，因此当变量非常不均匀时，会无效率地振荡到最佳状态。

防止这种情况的方法是修改输入变量的范围，以使它们都大致相同。理想的情况是：

$$
-1 ≤ x_{(i)} ≤ 1\\
\text{or}\\
-0.5 ≤ x_{(i)} ≤ 0.5
$$

这些不是确切的要求； 我们只是试图加快速度。 目标是使所有输入变量大致进入这些范围之一，给出或取几个。

两种有助于此目的的技术是 **特征缩放** 和 **平均归一化**。 特征缩放涉及将输入值除以输入变量的范围（即最大值减去最小值），从而得到新的范围仅为 `1`。平均归一化涉及从输入值的平均值中减去输入变量的平均值。 输入变量导致输入变量的新平均值仅为零。 要实现这两种技术，请按照以下公式调整输入值：

$$
x_i := \dfrac{x_i - \mu_i}{s_i}
$$

其中 $μ_i$ 是特征 $(i)$ 所有值的 **平均值**，而 $s_i$ 是值的范围（最大值-最小值），或 $s_i$ 是标准偏差。

请注意，除以范围或除以标准偏差会得出不同的结果。 本课程中的测验使用范围-编程练习使用标准偏差。

例如，如果代表的房价范围为 `100` 至 `2000`，平均值为 `1000`，则，$x_i := \dfrac{price-1000}{1900}$。

## 四、梯度下降实践 1 - 学习速率

<details>
<summary>原文</summary>

Note: the x-axis label in the right graph should be $θ$ rather than No. of iterations

Debugging gradient descent. Make a plot with number of iterations on the x-axis. Now plot the cost function, $J(θ)$ over the number of iterations of gradient descent. If J(θ) ever increases, then you probably need to decrease $α$.

Automatic convergence test. Declare convergence if $J(θ)$ decreases by less than E in one iteration, where E is some small value such as $10^{-3}$. However in practice it's difficult to choose this threshold value.

![](/public/img/machine-learn/2016-11-09-09.35.59.png)

It has been proven that if learning rate α is sufficiently small, then J(θ) will decrease on every iteration.

![](/public/img/machine-learn/2016-11-11-08.55.21.png)

To summarize:

If $α$ is too small: slow convergence.

If $α$ is too large: may not decrease on
every iteration and thus may not converge.

</details>

Note: 右图中的 x 轴标签应为 $θ$ 而不是迭代次数。

调试梯度下降。 绘制一个在 x 轴上具有迭代次数的图。 现在在梯度下降的迭代次数上绘制成本函数 $J(θ)$。 如果 $J(θ)$ 曾经增加，那么您可能需要减少 $α$。

自动收敛测试。 如果 $J(θ)$ 在一次迭代中减小的幅度小于 E，则声明收敛，其中 E 是一些小值，例如 $10^{-3}$。 但是实际上，很难选择此阈值。

![](/public/img/machine-learn/2016-11-09-09.35.59.png)

已经证明，如果学习率 $α$ 足够小，则 $J(θ)$ 将在每次迭代中减小。

![](/public/img/machine-learn/2016-11-11-08.55.21.png)

总结一下：

如果 $α$ 太小：收敛缓慢。

如果 $α$ 太大：可能不会在每次迭代中都减少，因此可能不会收敛。

## 五、特征和多项式的回归函数

<details>
<summary>原文</summary>
We can improve our features and the form of our hypothesis function in a couple different ways.

We can combine multiple features into one. For example, we can combine $x_1$ and $x_2$ into a new feature $x_3$ by taking $x_1$⋅$x_2$.

**Polynomial Regression**

Our hypothesis function need not be linear (a straight line) if that does not fit the data well.

We can change the behavior or curve of our hypothesis function by making it a quadratic, cubic or square root function (or any other form).

For example, if our hypothesis function is $h_\theta(x) = \theta_0 + \theta_1 x_1$ then we can create additional features based on $x_1$, to get the quadratic function $h_\theta(x) = \theta_0 + \theta_1 x_1 + \theta_2 x_1^2$ or the cubic function $h_\theta(x) = \theta_0 + \theta_1 x_1 + \theta_2 x_1^2 + \theta_3 x_1^3$

In the cubic version, we have created new features $x_2$ and $x_3$ where $x_2=x_1^2$ and $x_3=x_1^3$.

To make it a square root function, we could do: $h_\theta(x) = \theta_0 + \theta_1 x_1 + \theta_2 \sqrt{x_1}$

One important thing to keep in mind is, if you choose your features this way then feature scaling becomes very important.

eg. if $x_1$ has range 1 - 1000 then range of $x_1^2$ becomes 1 - 1000000 and that of $x_1^3$ becomes 1 - 1000000000

</details>

我们可以通过几种不同的方式来改进我们的特征和假设函数的形式。

我们可以将多个功能组合为一个。例如，我们可以采用 $x_1$ ⋅ $x_2$，将 $x_1$ 和 $x_2$ 组合成一个新功能 $x_3$。

**多项式回归**

如果我们的假设函数不太适合数据的分布，则不必是线性的（直线）。

我们可以通过将其设为二次，三次或平方根函数（或任何其他形式）来更改假设函数的行为或曲线。

例如，如果我们的假设函数是 $h_\theta(x) = \theta_0 + \theta_1 x_1$，那么我们可以基于 $x_1$ 创建其他特征，以获得二次函数 $h_\theta(x) = \theta_0 + \theta_1 x_1 + \theta_2 x_1^2$ 或三次函数 $h_\theta(x) = \theta_0 + \theta_1 x_1 + \theta_2 x_1^2 + \theta_3 x_1^3$

在三次版本中，我们创建了新特征 $x_2$ 和 $x_3$，其中 $x_2 = x_1^2$ 和 $x_3 = x_1^3$。

要使它成为平方根函数，我们可以这样做：$h_\theta(x) = \theta_0 + \theta_1 x_1 + \theta_2 \sqrt{x_1}$

要记住的一件事是，如果以这种方式选择要素，则特征缩放变得非常重要。

例如。如果 $x_1$ 的范围为 1-1000，则 $x_1^2$ 的范围为 1-1000000，而 $x_1^3$ 的范围为 1-1000000000

## 六、正规方程

<details>
<summary>原文</summary>

Note: he design matrix X (in the bottom right side of the slide) given in the example should have elements x with subscript 1 and superscripts varying from 1 to m because for all m training sets there are only 2 features $x_0$ and $x_1$; The X matrix is m by (n+1) and NOT n by n.

Gradient descent gives one way of minimizing J. Let’s discuss a second way of doing so, this time performing the minimization explicitly and without resorting to an iterative algorithm. In the "Normal Equation" method, we will minimize J by explicitly taking its derivatives with respect to the θj ’s, and setting them to zero. This allows us to find the optimum theta without iteration. The normal equation formula is given below:

$$
\theta = (X^T X)^{-1}X^T y
$$

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
|         $O(kn^2)$          | $O(n^3)$, need to calculate inverse of $X^T X$ |
| Works well when n is large |            Slow if n is very large             |

With the normal equation, computing the inversion has complexity $\mathcal{O}(n^3)$. So if we have a very large number of features, the normal equation will be slow. In practice, when n exceeds 10,000 it might be a good time to go from a normal solution to an iterative process.

</details>

Note: 在示例中给出的设计矩阵 X（在幻灯片的右下角）应具有元素 x，其下标 1 和上标的范围从 1 到 m，因为对于所有 m 个训练集，只有 2 个特征 $x_0$ 和 $ x_1$; X 矩阵的 m 乘 (n + 1)，而不是 n \* n。

梯度下降提供了一种最小化 J 的方法。让我们讨论这样做的第二种方法，这一次显式地执行最小化，而不求助于迭代算法。 在 `正态方程` 方法中，我们将通过显式地将其关于 θj 的导数并将其设置为零来最小化 J。 这使我们无需迭代即可找到最佳 θ。 正态方程公式如下：

$$
\theta = (X^T X)^{-1}X^T y
$$

`octave` 的代码公式

```text
pinv(X' * X) * X' * y
```

正规方程**无需**使用特征缩放。

以下是梯度下降与正规方程的比较：

|     梯度下降      |           正规方程           |
| :---------------: | :--------------------------: |
| 需要选择 $\alpha$ |     不需要选择 $\alpha$      |
|   需要多次迭代    |        不需要进行迭代        |
|     $O(kn^2)$     | $O(n^3)$, 需要计算逆 $X^T X$ |
| 当 n 大时效果很好 |     如果 n 很大，则变慢      |


利用正规方程，计算反演的复杂度为 $\mathcal{O}(n^3)$。 因此，如果我们具有大量特征，则正常方程将变慢。 在实践中，当 n 超过 10,000 时，可能是从常规解转到迭代过程的好时机。
