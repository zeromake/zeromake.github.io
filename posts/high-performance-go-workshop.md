---
title: (翻译)Go 高性能研讨讲座 - High Performance Go Workshop
date: 2019-07-25 16:25:21+08:00
type: performance
tags: [go, performance, pprof]
last_date: 2019-07-25 16:25:21+08:00
private: true
---

> [原文地址](https://dave.cheney.net/high-performance-go-workshop/gopherchina-2019.html)

## Overview

本次研讨讲座的目标是让您能够诊断 `Go` 应用程序中的性能问题，并且修复这些问题。

这一天，我们将从小做起 - 学习如何编写基准测试，然后分析一小段代码。然后讨论代码执行跟踪器，垃圾收集器和跟踪运行的应用程序。最后会有剩下的时间，您可以提出问题，并尝试编写您自己的代码。

### Schedule

这里是这一天的时间安排表（大概）。

| 开始时间 | 描述                                       |
| -------- | ------------------------------------------ |
| 09:00    | [欢迎](#welcome) and [介绍](#introduction) |
| 09:30    | [Benchmarking](#benchmarking)              |
| 10:45    | 休息 (15 分钟)                             |
| 11:00    | [性能评估和分析](#profiling)               |
| 12:00    | 午餐 (90 分钟)                             |
| 13:30    | [编译优化](#compiler-optimisation)         |
| 14:30    | [执行追踪器](#execution-tracer)            |
| 15:30    | 休息 (15 分钟)                             |
| 15:45    | [内存和垃圾回收器](#memory-and-gc)         |
| 16:15    | [提示和旅行](#tips-and-tricks)             |
| 16:30    | 练习                                       |
| 16:45    | [最后的问题和结论](#conclusion)            |
| 17:00    | 结束                                       |

## 欢迎 {#welcome}

你好，欢迎! 🎉

该研讨的目的是为您提供诊断和修复 `Go` 应用程序中的性能问题所需的工具。

在这一天里，我们将从一小部分开始 - **学习如何编写基准测试**，然后分析一小段代码。然后扩展到，讨论 `执行跟踪器`，`垃圾收集器` 和跟踪正在运行的应用程序。剩下的将是提问的时间，尝试自己使用代码来实践。

### 讲师

-   Dave Cheney [dave@cheney.net](mailto:dave@cheney.net)

### 开源许可和材料

该研讨会是 [David Cheney](https://twitter.com/davecheney) 和 [Francesc Campoy](https://twitter.com/francesc)。

此文章以 [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/) 作为开源协议。

### 预先工作

下面是您今天需要下载的几个软件

#### 讲习代码库

将源代码下载到本文档，并在以下位置获取代码示例 [high-performance-go-workshop](https://github.com/davecheney/high-performance-go-workshop)

#### 电脑执行环境

该项目工作环境目标为 `Go` 1.12。

[Download Go 1.12](https://golang.org/dl/)

!!! note Note
如果您已经升级到 Go 1.13，也可以了。在次要的 Go 版本之间，优化选择总是会有一些小的变化，我会在继续进行时指出。
!!!

#### Graphviz

在 `pprof` 的部分需要 `dot` 程序，它附带的工具 `graphviz` 套件。

-   Linux: `[sudo] apt-get install graphviz`
-   OSX:
    -   MacPorts: `sudo port install graphviz`
    -   Homebrew: `brew install graphviz`
-   [Windows](https://graphviz.gitlab.io/download/#Windows) (untested)

#### Google Chrome

执行跟踪器上的这一部分需要使用 Google Chrome。它不适用于 Safari，Edge，Firefox 或 IE 4.01。

[Download Google Chrome](https://www.google.com/chrome/)

#### 您的代码以进行分析和优化

当天的最后部分将是公开讲座，您可以在其中试验所学的工具。

### 还有一些事 …​

这不是演讲，而是对话。我们将有很多时间来提问。

如果您听不懂某些内容，或认为听不正确，请提出询问。

## 1. 微处理器性能的过去，现在和未来 {#introduction}

这是一个有关编写高性能代码的研讨会。在其他研讨会上，我谈到了分离的设计和可维护性，但是今天我们在这里谈论性能。

今天，我想做一个简短的演讲，内容是关于我如何思考计算机发展历史以及为什么我认为编写高性能软件很重要。

现实是软件在硬件上运行，因此要谈论编写高性能代码，首先我们需要谈论运行代码的硬件。

### 1.1. Mechanical Sympathy

![](https://dave.cheney.net/high-performance-go-workshop/images/image-20180818145606919.png)

目前有一个常用术语，您会听到像马丁·汤普森（Martin Thompson）或比尔·肯尼迪（Bill Kennedy）这样的人谈论 `Mechanical Sympathy`。
`Mechanical Sympathy` 这个名字来自伟大的赛车 手杰基·斯图尔特（Jackie Stewart），他曾三度获得世界一级方程式赛车冠军。他认为，最好的驾驶员对机器的工作原理有足够的了解，以便他们可以与机器和谐地工作。

要成为一名出色的赛车手，您不需要成为一名出色的机械师，但您需要对汽车的工作原理有一个粗略的了解。

我相信我们作为软件工程师也是如此。我认为会议室中的任何人都不会是专业的 `CPU` 设计人员，但这并不意味着我们可以忽略 `CPU` 设计人员面临的问题。

### 1.2. 六个数量级

有一个常见的网络模型是这样的；

![](https://dave.cheney.net/high-performance-go-workshop/images/jalopnik.png)

当然这是荒谬的，但是它强调了计算机行业发生了多少变化。

作为软件作者，我们这个会议室的所有人都受益于摩尔定律，即 40 年来，每 18 个月将芯片上可用晶体管的数量增加一倍。没有其他行业经历过 _六个数量级 <sup id="_footnoteref_1" class="footnote">\[[1](#_footnotedef_1)\]</sup>_ 在一生的时间内改进其工具。

但这一切都在改变。

### 1.3. 计算机还在变快吗？{#are_computers_still_getting_faster}

因此，最基本的问题是，面对上图所示的统计数据，我们应该问这个问题吗 _计算机还在变快吗_ ?

如果计算机的速度仍在提高，那么也许我们不需要关心代码的性能，只需稍等一下，硬件制造商将为我们解决性能问题。

#### 1.3.1. 让我们看一下数据 {#lets_look_at_the_data}

这是经典的数据，您可以在 `John L. Hennessy` 和 `David A. Patterson` 的 _Computer Architecture, A Quantitative Approach_ 等教科书中找到。该图摘自第 5 版

![](https://community.cadence.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-01-06/2313.processorperf.jpg)

在第 5 版中，轩尼诗（Hennessy）和帕特森（Patterson）提出了计算性能的三个时代

1.  首先是 1970 年代和 80 年代初期，这是形成性的年代。我们今天所知道的微处理器实际上并不存在，计算机是由分立晶体管或小规模集成电路制造的。成本，尺寸以及对材料科学理解的限制是限制因素。
2.  从 80 年代中期到 2004 年，趋势线很明显。 计算机整数性能每年平均提高 52％。 计算机能力每两年翻一番，因此人们将摩尔定律（芯片上的晶体管数量增加一倍）与计算机性能混为一谈。
3.  然后我们进入计算机性能的第三个时代。 事情变慢了。 总变化率为每年 22％。

之前的图表仅持续到 2012 年，但幸运的是在 2012 年 [Jeff Preshing](http://preshing.com/20120208/a-look-back-at-single-threaded-cpu-performance/) 写了 [tool to scrape the Spec website and build your own graph](https://github.com/preshing/analyze-spec-benchmarks).

![](https://dave.cheney.net/high-performance-go-workshop/images/int_graph.png)

因此，这是使用 1995 年 到 2017 年 的 Spec 数据的同一图。

对我而言，与其说我们在 2012 年 的数据中看到的步伐变化，不如说是 _单核_ 性能已接近极限。 这些数字对于浮点数来说稍好一些，但是对于我们在做业务应用程序的房间中来说，这可能并不重要。

#### 1.3.2. 是的，计算机仍在变得越来越慢 {#yes_computer_are_still_getting_faster_slowly}

> 关于摩尔定律终结的第一件事要记住，就是戈登·摩尔告诉我的事情。他说："所有指数都结束了"。 — [John Hennessy](https://www.youtube.com/watch?v=Azt8Nc-mtKM)

这是轩尼诗在 Google Next 18 及其图灵奖演讲中的引文。 他的观点是肯定的，CPU 性能仍在提高。 但是，单线程整数性能仍在每年提高 2-3％ 左右。 以这种速度，它将需要 20 年的复合增长才能使整数性能翻倍。 相比之下，90 年代的表现每天每两年翻一番。

为什么会这样呢？

### 1.4. 时针速度

![](https://dave.cheney.net/high-performance-go-workshop/images/stuttering.png)

2015 年的这张图很好地说明了这一点。 第一行显示了芯片上的晶体管数量。 自 1970 年代以来，这种趋势一直以大致线性的趋势线持续。 由于这是对数/林线图，因此该线性序列表示指数增长。

但是，如果我们看中线，我们看到时钟速度十年来没有增加，我们看到 CPU 速度在 2004 年左右停滞了。

下图显示了散热功率； 即变成电能的电能遵循相同的模式-时钟速度和 cpu 散热是相关的。

### 1.5. 发热

为什么 CPU 会发热？ 这是一台固态设备，没有移动组件，因此此处的摩擦等效果并不（直接）相关。

该图摘自 [data sheet produced by TI](http://www.ti.com/lit/an/scaa035b/scaa035b.pdf)。 在此模型中，N 型设备中的开关被吸引到正电压，P 型设备被正电压击退。

![](https://dave.cheney.net/high-performance-go-workshop/images/cmos-inverter.png)

CMOS 设备的功耗是三个因素的总和，CMOS 功耗是房间，办公桌上和口袋中每个晶体管的功率。

1.  静态功率。当晶体管是静态的，即不改变其状态时，会有少量电流通过晶体管泄漏到地。 晶体管越小，泄漏越多。 泄漏量随温度而增加。当您拥有数十亿个晶体管时，即使是很小的泄漏也会加起来！
2.  动态功率。当晶体管从一种状态转换到另一种状态时，它必须对连接到栅极的各种电容进行充电或放电。 每个晶体管的动态功率是电压乘以电容和变化频率的平方。 降低电压可以减少晶体管消耗的功率，但是较低的电压会使晶体管的开关速度变慢。
3.  撬棍或短路电流。我们喜欢将晶体管视为数字设备，无论其处于开启状态还是处于原子状态，都占据一种状态或另一种状态。 实际上，晶体管是模拟设备。 当开关时，晶体管开始几乎全部截止，并转变或切换到几乎全部导通的状态。 这种转换或切换时间非常快，在现代处理器中约为皮秒，但是当从 Vcc 到地的电阻路径很低时，这仍然代表了一段时间。 晶体管切换的速度越快，其频率就会耗散更多的热量。

### 1.6. Dennard 扩展的终结

要了解接下来发生的事情，我们需要查看 [Robert H. Dennard](https://en.wikipedia.org/wiki/Robert_H._Dennard) 于 1974 年共同撰写的论文。 丹纳德的缩放定律大致上指出，随着晶体管的变小，它们的 [power density](https://en.wikipedia.org/wiki/Power_density) 保持恒定。 较小的晶体管可以在较低的电压下运行，具有较低的栅极电容，并且开关速度更快，这有助于减少动态功率。

那么，结果如何呢？

![](http://semiengineering.com/wp-content/uploads/2014/04/Screen-Shot-2014-04-14-at-8.49.48-AM.png)

事实并非如此。 当晶体管的栅极长度接近几个硅原子的宽度时，晶体管尺寸，电压与重要的泄漏之间的关系就破裂了。

它是在 [Micro-32 conference in 1999](https://pdfs.semanticscholar.org/6a82/1a3329a60def23235c75b152055c36d40437.pdf) 假定的，如果我们遵循了提高时钟速度和缩小晶体管尺寸的趋势线，那么在处理器一代之内晶体管结将接近核反应堆堆芯的温度。显然，这是荒谬的。奔腾 4 [marked the end of the line](https://arstechnica.com/uncategorized/2004/10/4311-2/) 适用于单核高频消费类 CPU。

返回此图，我们看到时钟速度停止的原因是 `CPU` 超出了我们冷却时钟的能力。 到 2006 年，减小晶体管的尺寸不再提高其功率效率。

现在我们知道，减小 CPU 功能的大小主要是为了降低功耗。 降低功耗不仅意味着“绿色”，例如回收利用，还可以拯救地球。 主要目标是保持功耗，从而保持散热，[below levels that will damage the CPU](https://en.wikipedia.org/wiki/Electromigration#Practical_implications_of_electromigration).

![](https://dave.cheney.net/high-performance-go-workshop/images/stuttering.png)

但是，图中的一部分在不断增加，即管芯上的晶体管数量。cpu 的行进具有尺寸特征，在相同的给定面积内有更多的晶体管，既有正面影响，也有负面影响。

同样，如您在插入物中所看到的，直到大约 5 年前，每个晶体管的成本一直在下降，然后每个晶体管的成本又开始回升。

![](https://whatsthebigdata.files.wordpress.com/2016/08/moores-law.png)

制造较小的晶体管不仅变得越来越昂贵，而且变得越来越困难。 2016 年 的这份报告显示了芯片制造商认为在 2013 年 会发生什么的预测。两年后，他们错过了所有预测，尽管我没有此报告的更新版本，但没有迹象表明他们将能够扭转这一趋势。

英特尔，台积电，AMD 和三星都要花费数十亿美元，因为它们必须建造新的晶圆厂，购买所有新的工艺工具。因此，尽管每个芯片的晶体管数量持续增加，但其单位成本却开始增加。

!!! note Note
甚至以纳米为单位的术语 `栅极长度` 也变得模棱两可。 各种制造商以不同的方式测量其晶体管的尺寸，从而使它们在没有交付的情况下可以展示比竞争对手少的数量。这是 CPU 制造商的非 GAAP 收益报告模型。
!!!

### 1.7. 更多的核心

![](https://i.redd.it/y5cdp7nhs2uy.jpg)

达到温度和频率限制后，不再可能使单个内核的运行速度快两倍。 但是，如果添加另一个内核，则可以提供两倍的处理能力-如果软件可以支持的话。

实际上，CPU 的核心数量主要由散热决定。 Dennard 缩放的末尾意味着 CPU 的时钟速度是 1 到 4 Ghz 之间的任意数字，具体取决于它的温度。在谈论基准测试时，我们会很快看到这一点。

### 1.8. 阿姆达尔定律 {#amdahls_law}

CPU 并没有变得越来越快，但是随着超线程和多核它们变得越来越宽。 移动部件为双核，台式机部件为四核，服务器部件为数十个内核。 这将是计算机性能的未来吗？ 不幸的是没有。

阿姆达尔定律以 IBM/360 的设计者吉姆·阿姆达尔（Gene Amdahl）的名字命名，它是一个公式，它给出了在固定工作负载下任务执行延迟的理论上的加速，这可以通过改善资源的系统来实现。

![](https://upload.wikimedia.org/wikipedia/commons/e/ea/AmdahlsLaw.svg)

阿姆达尔定律告诉我们，程序的最大速度受程序顺序部分的限制。 如果您编写的程序的执行力的 95％ 可以并行运行，即使有成千上万的处理器，则程序执行的最大速度也将限制为 20 倍。

考虑一下您每天使用的程序，它们的执行量中有多少是可以解析的？

### 1.9. 动态优化

由于时钟速度停滞不前，并且由于抛出额外的内核而产生的回报有限，因此，提速来自何处？ 它们来自芯片本身的体系结构改进。 这些是五到七年的大型项目，名称如下 [Nehalem, Sandy Bridge, and Skylake](https://en.wikipedia.org/wiki/List_of_Intel_CPU_microarchitectures#Pentium_4_/_Core_Lines).

在过去的二十年中，性能的改善大部分来自体系结构的改善:

#### 1.9.1. 乱序执行

乱序，也称为超标量，执行是一种从 CPU 正在执行的代码中提取所谓的 _指令级并行性_ 的方法。 现代 CPU 在硬件级别有效地执行 SSA，以识别操作之间的数据依赖性，并在可能的情况下并行运行独立的指令。

但是，任何一段代码固有的并行性数量是有限的。它也非常耗电。大多数现代 CPU 在每个内核上都部署了六个执行单元，因为在流水线的每个阶段将每个执行单元连接到所有其他执行单元的成本为 n 平方。

#### 1.9.2\. Speculative execution

除最小的微控制器外，所有 CPU 均使用 _指令管道_ 来重叠指令 获取/解码/执行/提交 周期中的部分。

![](https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Fivestagespipeline.png/800px-Fivestagespipeline.png)

指令流水线的问题是分支指令，平均每 5 到 8 条指令出现一次。当 CPU 到达分支时，它不能在分支之外寻找其他指令来执行，并且直到知道程序计数器也将在何处分支之前，它才能开始填充其管道。推测执行使 CPU 可以“猜测”分支仍要处理的路径，_同时仍在处理分支指令！_

如果 CPU 正确预测了分支，则它可以保持其指令流水线满。如果 CPU 无法预测正确的分支，则当它意识到错误时，必须回滚对其 _architectural state_ 所做的任何更改。由于我们都在通过 Spectre 样式漏洞进行学习，因此有时这种回滚并没有像希望的那样无缝。

当分支预测率较低时，投机执行可能会非常耗电。如果分支预测错误，不仅 CPU 回溯到预测错误的地步，而且浪费在错误分支上的能量也被浪费了。

所有这些优化导致我们看到的单线程性能的提高，但要付出大量晶体管和功率的代价。

!!! note Note
Cliff Click 的 [精彩演讲](https://www.youtube.com/watch?v=OFgxAFdxYAQ) 认为乱序，并且推测性执行对于尽早开始缓存未命中最有用，从而减少了观察到的缓存延迟。
!!!

### 1.10. 现代 CPU 已针对批量操作进行了优化

> 现代处理器就像是由硝基燃料驱动的有趣的汽车，它们在四分之一英里处表现出色。不幸的是，现代编程语言就像蒙特卡洛一样，充满了曲折。- 大卫·昂加（David Ungar）

这是来自有影响力的计算机科学家，SELF 编程语言的开发人员 David Ungar 的引言，在很旧的演讲中就引用了 [I found online](http://www.ai.mit.edu/projects/dynlangs/wizards-panels.html).

因此，现代 CPU 已针对批量传输和批量操作进行了优化。 在每个级别，操作的设置成本都会鼓励您进行大量工作。 一些例子包括

-   内存不是按字节加载，而是按高速缓存行的倍数加载，这就是为什么对齐变得不再像以前的计算机那样成为问题的原因。
-   MMX 和 SSE 等向量指令允许一条指令同时针对多个数据项执行，前提是您的程序可以以这种形式表示。

### 1.11. 现代处理器受内存延迟而不是内存容量的限制

如果 CPU 占用的状况还不够糟，那么从内存方面来的消息就不会好多了。

连接到服务器的物理内存在几何上有所增加。 我在 1980 年代的第一台计算机具有数千字节的内存。 当我读高中时，我所有的论文都是用 3.8 MB 的 386 写在 386 上的。 现在，查找具有数十或数百 GB RAM 的服务器已变得司空见惯，而云提供商则将其推向了 TB 的 TB。

![](https://www.extremetech.com/wp-content/uploads/2018/01/mem_gap.png)

但是，处理器速度和内存访问时间之间的差距继续扩大。

![](https://pbs.twimg.com/media/BmBr2mwCIAAhJo1.png)

但是，就丢失处理器等待内存的处理器周期而言，物理内存仍与以往一样遥不可及，因为内存无法跟上 CPU 速度的提高。

因此，大多数现代处理器受内存延迟而不是容量的限制。

### 1.12. 缓存控制着我们周围的一切

![](https://www.extremetech.com/wp-content/uploads/2014/08/latency.png)

几十年来，解决处理器/内存上限的解决方案是添加缓存-一块较小的快速内存，位置更近，现在直接集成到 CPU 中。

但;

-   数十年来，L1 一直停留在每个核心 32kb
-   L2 在最大的英特尔部分上已缓慢爬升到 512kb
-   L3 现在在 4-32mb 范围内，但其访问时间可变

![](https://i3.wp.com/computing.llnl.gov/tutorials/linux_clusters/images/E5v4blockdiagram.png)

受高速缓存限制的大小是因为它们 [physically large on the CPU die](http://www.itrs.net/Links/2000UpdateFinal/Design2000final.pdf)，会消耗大量功率。 要使缓存未命中率减半，您必须将缓存大小提高 _四倍_。

### 1.13. 免费午餐结束了

2005 年，C++ 委员会负责人 Herb Sutter 撰写了一篇题为 [免费午餐结束](http://www.gotw.ca/publications/concurrency-ddj.htm) 的文章。 萨特（Sutter）在他的文章中讨论了我涵盖的所有要点，并断言未来的程序员将不再能够依靠较快的硬件来修复较慢的程序或较慢的编程语言。

十多年后的今天，毫无疑问，赫伯·萨特（Herb Sutter）是正确的。内存很慢，缓存太小，CPU 时钟速度倒退了，单线程 CPU 的简单世界早已一去不复返了。

摩尔定律仍然有效，但是对于我们这个房间里的所有人来说，免费午餐已经结束。

### 1.14. 结束

> 我要引用的数字是到 2010 年：30GHz，100 亿个晶体管和每秒 1 兆指令。— [Pat Gelsinger, Intel CTO, April 2002](https://www.cnet.com/news/intel-cto-chip-heat-becoming-critical-issue/)

很明显，如果没有材料科学方面的突破，CPU 性能恢复到同比 52％ 增长的可能性几乎很小。普遍的共识是，故障不在于材料科学本身，而在于晶体管的使用方式。用硅表示的顺序指令流的逻辑模型导致了这种昂贵的最终结果。

在线上有许多演示文稿可以重述这一点。 它们都具有相同的预测-将来的计算机将不会像今天这样编程。 有人认为它看起来更像是带有数百个非常笨拙，非常不连贯的处理器的图形卡。 其他人则认为，超长指令字（VLIW）计算机将成为主流。 所有人都同意，我们当前的顺序编程语言将与此类处理器不兼容。

我的观点是这些预测是正确的，此时硬件制造商挽救我们的前景严峻。 但是，我们可以为今天拥有的硬件优化当前程序的范围是 _巨大的_。 里克·哈德森（Rick Hudson）在 GopherCon 2015 大会上谈到 [以"良好的循环"重新参与](https://talks.golang.org/2015/go-gc.pdf)，该软件可以与我们今天拥有的硬件一起工作，而不是仅适用于这种硬件 。

查看我之前显示的图表，从 2015 年到 2018 年，整数性能最多提高了 5-8％，而内存延迟却最多，Go 团队将垃圾收集器的暂停时间减少了 [两个数量级](https://blog.golang.org/ismmkeynote)。 与使用 Go 1.6 的相同硬件上的同一程序相比，Go 1.11 程序具有更好的 GC 延迟。 这些都不是来自硬件。

因此，为了在当今世界的当今硬件上获得最佳性能，您需要一种编程语言，该语言应：

-   之所以编译而不是解释，是因为解释后的编程语言与 CPU 分支预测变量和推测性执行之间的交互作用很差。
-   您需要一种语言来允许编写有效的代码，它需要能够谈论位和字节，并且必须有效地说明整数的长度，而不是假装每个数字都是理想的浮点数。
-   您需要一种使程序员能够有效地谈论内存，思考结构与 Java 对象的语言，因为所有的指针追逐都会给 CPU 高速缓存带来压力，而高速缓存未命中会消耗数百个周期。
-   随应用程序的性能而扩展到多个内核的编程语言取决于它使用缓存的效率以及在多个内核上并行化工作的效率。

显然，我们在这里谈论 Go，我相信 Go 拥有了我刚才描述的许多特征。

#### 1.14.1. 这对我们意味着什么？ {#what_does_that_mean_for_us}

> 只有三种优化：少做些。少做一次。更快地做。
>
> 最大的收益来自 1，但我们将所有时间都花在 3 上。 — [Michael Fromberger](https://twitter.com/creachadair/status/1039602865831010305)

本讲座的目的是说明，当您谈论程序或系统的性能时，完全是在软件中。等待更快的硬件来挽救一天真是愚蠢的事情。

但是有个好消息，我们可以在软件上进行大量改进，而这就是我们今天要讨论的。

#### 1.14.2. 进一步阅读

-   [The Future of Microprocessors, Sophie Wilson](https://www.youtube.com/watch?v=zX4ZNfvw1cw) JuliaCon 2018
-   [50 Years of Computer Architecture: From Mainframe CPUs to DNN TPUs, David Patterson](https://www.youtube.com/watch?v=HnniEPtNs-4)
-   [The Future of Computing, John Hennessy](https://web.stanford.edu/~hennessy/Future%20of%20Computing.pdf)
-   [The future of computing: a conversation with John Hennessy](https://www.youtube.com/watch?v=Azt8Nc-mtKM) (Google I/O '18)

## 2\. Benchmarking

> 测量两次，取一次。 — Ancient proverb

在尝试改善一段代码的性能之前，首先我们必须了解其当前性能。

本节重点介绍如何使用 Go 测试框架构建有用的基准，并提供了避免陷阱的实用技巧。

### 2.1. 标杆基准规则

在进行基准测试之前，必须具有稳定的环境才能获得可重复的结果。

-   机器必须处于闲置状态-不要在共享硬件上进行配置，不要在等待较长基准测试运行时浏览网络。
-   注意节能和热缩放。这些在现代笔记本电脑上几乎是不可避免的。
-   避免使用虚拟机和共享云托管；对于一致的测量，它们可能太嘈杂。

如果负担得起，请购买专用的性能测试硬件。机架安装，禁用所有电源管理和热量缩放功能，并且永远不要在这些计算机上更新软件。 最后一点是从系统管理的角度来看糟糕的建议，但是如果软件更新改变了内核或库的执行方式 -想想 Spectre 补丁- 这将使以前的任何基准测试结果无效。

对于我们其他人，请进行前后采样，然后多次运行以获取一致的结果。

### 2.2\. Using the testing package for benchmarking

`testing` 包内置了对编写基准测试的支持。 如果我们有一个简单的函数，像这样：

```go
func Fib(n int) int {
	switch n {
	case 0:
		return 0
	case 1:
		return 1
	default:
		return Fib(n-1) + Fib(n-2)
	}
}
```

我们可以使用 `testing` 包通过这种形式为函数编写一个 _基准_。

```go
func BenchmarkFib20(b *testing.B) {
	for n := 0; n < b.N; n++ {
		Fib(20) // run the Fib function b.N times
	}
}
```

!!! tip
基准测试功能与您的测试一起存在于 `_test.go` 文件中。
!!!

Benchmarks are similar to tests, the only real difference is they take a `*testing.B` rather than a `*testing.T`. Both of these types implement the `testing.TB` interface which provides crowd favorites like `Errorf()`, `Fatalf()`, and `FailNow()`.

基准测试类似于测试，唯一的不同是基准测试采用的是 `*testing.B`，而不是 `*testing.T`。这两种类型都实现了 `testing.TB` 接口，该接口提供了诸如 `Errorf()`，`Fatalf()` 和 `FailNow()` 之类的方法。

#### 2.2.1. 运行软件包的基准测试 {#running_a_packages_benchmarks}

As benchmarks use the `testing` package they are executed via the `go test` subcommand. However, by default when you invoke `go test`, benchmarks are excluded.

当基准测试使用 `测试` 软件包时，它们通过 `go test` 子命令执行。 但是，默认情况下，当您调用 `go test` 时，将排除基准测试。

要在包中显式运行基准测试，请使用 `-bench` 标志。`-bench` 采用与您要运行的基准测试名称匹配的正则表达式，因此调用包中所有基准测试的最常见方法是 `-bench=.` 这是一个例子：

```bash
% go test -bench=. ./examples/fib/
goos: darwin
goarch: amd64
BenchmarkFib20-8           30000             40865 ns/op
PASS
ok      _/Users/dfc/devel/high-performance-go-workshop/examples/fib     1.671s
```

!!! note
`go test` 还将在匹配基准之前运行软件包中的所有测试，因此，如果软件包中有很多测试，或者它们花费很长时间，则可以通过 `go test` 提供的 `-run` 参数来排除它们，正则表达式不匹配； 即。

```bash
go test -run=^$
```
!!!

#### 2.2.2. 基准如何运作

Each benchmark function is called with different value for `b.N`, this is the number of iterations the benchmark should run for.

`b.N` starts at 1, if the benchmark function completes in under 1 second—​the default—​then `b.N` is increased and the benchmark function run again.

`b.N` increases in the approximate sequence; 1, 2, 3, 5, 10, 20, 30, 50, 100, and so on. The benchmark framework tries to be smart and if it sees small values of `b.N` are completing relatively quickly, it will increase the the iteration count faster.

Looking at the example above, `BenchmarkFib20-8` found that around 30,000 iterations of the loop took just over a second. From there the benchmark framework computed that the average time per operation was 40865ns.

| |

The `-8` suffix relates to the value of `GOMAXPROCS` that was used to run this test. This number, like `GOMAXPROCS`, defaults to the number of CPUs visible to the Go process on startup. You can change this value with the `-cpu` flag which takes a list of values to run the benchmark with.

```bash
% go test -bench=. -cpu=1,2,4 ./examples/fib/
goos: darwin
goarch: amd64
BenchmarkFib20             30000             39115 ns/op
BenchmarkFib20-2           30000             39468 ns/op
BenchmarkFib20-4           50000             40728 ns/op
PASS
ok      _/Users/dfc/devel/high-performance-go-workshop/examples/fib     5.531s
```

This shows running the benchmark with 1, 2, and 4 cores. In this case the flag has little effect on the outcome because this benchmark is entirely sequential.

#### 2.2.3\. Improving benchmark accuracy

The `fib` function is a slightly contrived example—​unless your writing a TechPower web server benchmark—​it’s unlikely your business is going to be gated on how quickly you can compute the 20th number in the Fibonaci sequence. But, the benchmark does provide a faithful example of a valid benchmark.

Specifically you want your benchmark to run for several tens of thousand iterations so you get a good average per operation. If your benchmark runs for only 100’s or 10’s of iterations, the average of those runs may have a high standard deviation. If your benchmark runs for millions or billions of iterations, the average may be very accurate, but subject to the vaguaries of code layout and alignment.

To increase the number of iterations, the benchmark time can be increased with the `-benchtime` flag. For example:

```bash
% go test -bench=. -benchtime=10s ./examples/fib/
goos: darwin
goarch: amd64
BenchmarkFib20-8          300000             39318 ns/op
PASS
ok      _/Users/dfc/devel/high-performance-go-workshop/examples/fib     20.066s
```

Ran the same benchmark until it reached a value of `b.N` that took longer than 10 seconds to return. As we’re running for 10x longer, the total number of iterations is 10x larger. The result hasn’t changed much, which is what we expected.

Why is the total time reporteded to be 20 seconds, not 10?

If you have a benchmark which runs for millons or billions of iterations resulting in a time per operation in the micro or nano second range, you may find that your benchmark numbers are unstable because thermal scaling, memory locality, background processing, gc activity, etc.

For times measured in 10 or single digit nanoseconds per operation the relativistic effects of instruction reordering and code alignment will have an impact on your benchmark times.

To address this run benchmarks multiple times with the `-count` flag:

```bash
% go test -bench=Fib1 -count=10 ./examples/fib/
goos: darwin
goarch: amd64
BenchmarkFib1-8         2000000000               1.99 ns/op
BenchmarkFib1-8         1000000000               1.95 ns/op
BenchmarkFib1-8         2000000000               1.99 ns/op
BenchmarkFib1-8         2000000000               1.97 ns/op
BenchmarkFib1-8         2000000000               1.99 ns/op
BenchmarkFib1-8         2000000000               1.96 ns/op
BenchmarkFib1-8         2000000000               1.99 ns/op
BenchmarkFib1-8         2000000000               2.01 ns/op
BenchmarkFib1-8         2000000000               1.99 ns/op
BenchmarkFib1-8         1000000000               2.00 ns/op
```

A benchmark of `Fib(1)` takes around 2 nano seconds with a variance of +/- 2%.

New in Go 1.12 is the `-benchtime` flag now takes a number of iterations, eg. `-benchtime=20x` which will run your code exactly `benchtime` times.

Try running the fib bench above with a `-benchtime` of 10x, 20x, 50x, 100x, and 300x. What do you see?

| | If you find that the defaults that `go test` applies need to be tweaked for a particular package, I suggest codifying those settings in a `Makefile` so everyone who wants to run your benchmarks can do so with the same settings. |

### 2.3\. Comparing benchmarks with benchstat

In the previous section I suggested running benchmarks more than once to get more data to average. This is good advice for any benchmark because of the effects of power management, background processes, and thermal management that I mentioned at the start of the chapter.

I’m going to introduce a tool by Russ Cox called [benchstat](https://godoc.org/golang.org/x/perf/cmd/benchstat).

```bash
% go get golang.org/x/perf/cmd/benchstat
```

Benchstat can take a set of benchmark runs and tell you how stable they are. Here is an example of `Fib(20)` on battery power.

```bash
% go test -bench=Fib20 -count=10 ./examples/fib/ | tee old.txt
goos: darwin
goarch: amd64
BenchmarkFib20-8           50000             38479 ns/op
BenchmarkFib20-8           50000             38303 ns/op
BenchmarkFib20-8           50000             38130 ns/op
BenchmarkFib20-8           50000             38636 ns/op
BenchmarkFib20-8           50000             38784 ns/op
BenchmarkFib20-8           50000             38310 ns/op
BenchmarkFib20-8           50000             38156 ns/op
BenchmarkFib20-8           50000             38291 ns/op
BenchmarkFib20-8           50000             38075 ns/op
BenchmarkFib20-8           50000             38705 ns/op
PASS
ok      _/Users/dfc/devel/high-performance-go-workshop/examples/fib     23.125s
% benchstat old.txt
name     time/op
Fib20-8  38.4µs ± 1%
```

`benchstat` tells us the mean is 38.8 microseconds with a +/- 2% variation across the samples. This is pretty good for battery power.

-   The first run is the slowest of all because the operating system had the CPU clocked down to save power.

-   The next two runs are the fastest, because the operating system as decided that this isn’t a transient spike of work and it has boosted up the clock speed to get through the work as quick as possible in the hope of being able to go back to sleep.

-   The remaining runs are the operating system and the bios trading power consumption for heat production.

#### 2.3.1\. Improve `Fib` {#improve_fib}

Determining the performance delta between two sets of benchmarks can be tedious and error prone. Benchstat can help us with this.

| |

Saving the output from a benchmark run is useful, but you can also save the _binary_ that produced it. This lets you rerun benchmark previous iterations. To do this, use the `-c` flag to save the test binary—​I often rename this binary from `.test` to `.golden`.

<pre>% go test -c
% mv fib.test fib.golden</pre>

|

The previous `Fib` fuction had hard coded values for the 0th and 1st numbers in the fibonaci series. After that the code calls itself recursively. We’ll talk about the cost of recursion later today, but for the moment, assume it has a cost, especially as our algorithm uses exponential time.

As simple fix to this would be to hard code another number from the fibonacci series, reducing the depth of each recusive call by one.

```go
func Fib(n int) int {
	switch n {
	case 0:
		return 0
	case 1:
		return 1
	case 2:
		return 1
	default:
		return Fib(n-1) + Fib(n-2)
	}
}
```

| | This file also includes a comprehensive test for `Fib`. Don’t try to improve your benchmarks without a test that verifies the current behaviour. |

To compare our new version, we compile a new test binary and benchmark both of them and use `benchstat` to compare the outputs.

```bash
% go test -c
% ./fib.golden -test.bench=. -test.count=10 > old.txt
% ./fib.test -test.bench=. -test.count=10 > new.txt
% benchstat old.txt new.txt
name     old time/op  new time/op  delta
Fib20-8  44.3µs ± 6%  25.6µs ± 2%  -42.31%  (p=0.000 n=10+10)
```

There are three things to check when comparing benchmarks

-   The variance ± in the old and new times. 1-2% is good, 3-5% is ok, greater than 5% and some of your samples will be considered unreliable. Be careful when comparing benchmarks where one side has a high variance, you may not be seeing an improvement.

-   p value. p values lower than 0.05 are good, greater than 0.05 means the benchmark may not be statistically significant.

-   Missing samples. benchstat will report how many of the old and new samples it considered to be valid, sometimes you may find only, say, 9 reported, even though you did `-count=10`. A 10% or lower rejection rate is ok, higher than 10% may indicate your setup is unstable and you may be comparing too few samples.

### 2.4\. Avoiding benchmarking start up costs

Sometimes your benchmark has a once per run setup cost. `b.ResetTimer()` will can be used to ignore the time accrued in setup.

```go
func BenchmarkExpensive(b *testing.B) {
        boringAndExpensiveSetup()
        b.ResetTimer() (1)
        for n := 0; n < b.N; n++ {
                // function under test
        }
}
```

| **1** | Reset the benchmark timer |

If you have some expensive setup logic _per loop_ iteration, use `b.StopTimer()` and `b.StartTimer()` to pause the benchmark timer.

```go
func BenchmarkComplicated(b *testing.B) {
        for n := 0; n < b.N; n++ {
                b.StopTimer() (1)
                complicatedSetup()
                b.StartTimer() (2)
                // function under test
        }
}
```

| **1** | Pause benchmark timer |
| **2** | Resume timer |

### 2.5\. Benchmarking allocations

Allocation count and size is strongly correlated with benchmark time. You can tell the `testing` framework to record the number of allocations made by code under test.

```go
func BenchmarkRead(b *testing.B) {
        b.ReportAllocs()
        for n := 0; n < b.N; n++ {
                // function under test
        }
}
```

Here is an example using the `bufio` package’s benchmarks.

```bash
% go test -run=^$ -bench=. bufio
goos: darwin
goarch: amd64
pkg: bufio
BenchmarkReaderCopyOptimal-8            20000000               103 ns/op
BenchmarkReaderCopyUnoptimal-8          10000000               159 ns/op
BenchmarkReaderCopyNoWriteTo-8            500000              3644 ns/op
BenchmarkReaderWriteToOptimal-8          5000000               344 ns/op
BenchmarkWriterCopyOptimal-8            20000000                98.6 ns/op
BenchmarkWriterCopyUnoptimal-8          10000000               131 ns/op
BenchmarkWriterCopyNoReadFrom-8           300000              3955 ns/op
BenchmarkReaderEmpty-8                   2000000               789 ns/op            4224 B/op          3 allocs/op
BenchmarkWriterEmpty-8                   2000000               683 ns/op            4096 B/op          1 allocs/op
BenchmarkWriterFlush-8                  100000000               17.0 ns/op             0 B/op          0 allocs/op
```

| |

You can also use the `go test -benchmem` flag to force the testing framework to report allocation statistics for all benchmarks run.

```bash
% go test -run=^$ -bench=. -benchmem bufio
goos: darwin
goarch: amd64
pkg: bufio
BenchmarkReaderCopyOptimal-8            20000000                93.5 ns/op            16 B/op          1 allocs/op
BenchmarkReaderCopyUnoptimal-8          10000000               155 ns/op              32 B/op          2 allocs/op
BenchmarkReaderCopyNoWriteTo-8            500000              3238 ns/op           32800 B/op          3 allocs/op
BenchmarkReaderWriteToOptimal-8          5000000               335 ns/op              16 B/op          1 allocs/op
BenchmarkWriterCopyOptimal-8            20000000                96.7 ns/op            16 B/op          1 allocs/op
BenchmarkWriterCopyUnoptimal-8          10000000               124 ns/op              32 B/op          2 allocs/op
BenchmarkWriterCopyNoReadFrom-8           500000              3219 ns/op           32800 B/op          3 allocs/op
BenchmarkReaderEmpty-8                   2000000               748 ns/op            4224 B/op          3 allocs/op
BenchmarkWriterEmpty-8                   2000000               662 ns/op            4096 B/op          1 allocs/op
BenchmarkWriterFlush-8                  100000000               16.9 ns/op             0 B/op          0 allocs/op
PASS
ok      bufio   20.366s
```

### 2.6\. Watch out for compiler optimisations

This example comes from [issue 14813](https://github.com/golang/go/issues/14813#issue-140603392).

```go
const m1 = 0x5555555555555555
const m2 = 0x3333333333333333
const m4 = 0x0f0f0f0f0f0f0f0f
const h01 = 0x0101010101010101

func popcnt(x uint64) uint64 {
	x -= (x >> 1) & m1
	x = (x & m2) + ((x >> 2) & m2)
	x = (x + (x >> 4)) & m4
	return (x * h01) >> 56
}

func BenchmarkPopcnt(b *testing.B) {
	for i := 0; i < b.N; i++ {
		popcnt(uint64(i))
	}
}
```

How fast do you think this function will benchmark? Let’s find out.

```bash
% go test -bench=. ./examples/popcnt/
goos: darwin
goarch: amd64
BenchmarkPopcnt-8       2000000000               0.30 ns/op
PASS</pre>
```

0.3 of a nano second; that’s basically one clock cycle. Even assuming that the CPU may have a few instructions in flight per clock tick, this number seems unreasonably low. What happened?

To understand what happened, we have to look at the function under benchmake, `popcnt`. `popcnt` is a leaf function — it does not call any other functions — so the compiler can inline it.

Because the function is inlined, the compiler now can see it has no side effects. `popcnt` does not affect the state of any global variable. Thus, the call is eliminated. This is what the compiler sees:

```go
func BenchmarkPopcnt(b *testing.B) {
	for i := 0; i < b.N; i++ {
		// optimised away
	}
}
```

On all versions of the Go compiler that i’ve tested, the loop is still generated. But Intel CPUs are really good at optimising loops, especially empty ones.

#### 2.6.1\. Exercise, look at the assembly {#exercise_look_at_the_assembly}

Before we go on, lets look at the assembly to confirm what we saw

```
% go test -gcflags=-S
```

Use `gcflags="-l -S"` to disable inlining, how does that affect the assembly output

> Optimisation is a good thing
> The thing to take away is the same optimisations that _make real code fast_, by removing unnecessary computation, are the same ones that remove benchmarks that have no observable side effects.
> This is only going to get more common as the Go compiler improves.

#### 2.6.2\. Fixing the benchmark

Disabling inlining to make the benchmark work is unrealistic; we want to build our code with optimisations on.

To fix this benchmark we must ensure that the compiler cannot _prove_ that the body of `BenchmarkPopcnt` does not cause global state to change.

```go
var Result uint64

func BenchmarkPopcnt(b *testing.B) {
	var r uint64
	for i := 0; i < b.N; i++ {
		r = popcnt(uint64(i))
	}
	Result = r
}
```

This is the recommended way to ensure the compiler cannot optimise away body of the loop.

First we _use_ the result of calling `popcnt` by storing it in `r`. Second, because `r` is declared locally inside the scope of `BenchmarkPopcnt` once the benchmark is over, the result of `r` is never visible to another part of the program, so as the final act we assign the value of `r` to the package public variable `Result`.

Because `Result` is public the compiler cannot prove that another package importing this one will not be able to see the value of `Result` changing over time, hence it cannot optimise away any of the operations leading to its assignment.

What happens if we assign to `Result` directly? Does this affect the benchmark time? What about if we assign the result of `popcnt` to `_`?

> In our earlier `Fib` benchmark we didn’t take these precautions, should we have done so?

### 2.7\. Benchmark mistakes

The `for` loop is crucial to the operation of the benchmark.

Here are two incorrect benchmarks, can you explain what is wrong with them?

```
func BenchmarkFibWrong(b *testing.B) {
	Fib(b.N)
}
```

```
func BenchmarkFibWrong2(b *testing.B) {
	for n := 0; n < b.N; n++ {
		Fib(n)
	}
}
```

Run these benchmarks, what do you see?

### 2.8\. Profiling benchmarks

The `testing` package has built in support for generating CPU, memory, and block profiles.

-   `-cpuprofile=$FILE` writes a CPU profile to `$FILE`.

-   `-memprofile=$FILE`, writes a memory profile to `$FILE`, `-memprofilerate=N` adjusts the profile rate to `1/N`.

-   `-blockprofile=$FILE`, writes a block profile to `$FILE`.

Using any of these flags also preserves the binary.

```
% go test -run=XXX -bench=. -cpuprofile=c.p bytes
% go tool pprof c.p
```

### 2.9\. Discussion

Are there any questions?

Perhaps it is time for a break.

## 3\. Performance measurement and profiling

In the previous section we looked at benchmarking individual functions which is useful when you know ahead of time where the bottlekneck is. However, often you will find yourself in the position of asking

> Why is this program taking so long to run?

Profiling _whole_ programs which is useful for answering high level questions like. In this section we’ll use profiling tools built into Go to investigate the operation of the program from the inside.

### 3.1\. pprof

The first tool we’re going to be talking about today is _pprof_. [pprof](https://github.com/google/pprof) descends from the [Google Perf Tools](https://github.com/gperftools/gperftools) suite of tools and has been integrated into the Go runtime since the earliest public releases.

`pprof` consists of two parts:

-   `runtime/pprof` package built into every Go program

-   `go tool pprof` for investigating profiles.

### 3.2\. Types of profiles

pprof supports several types of profiling, we’ll discuss three of these today:

-   CPU profiling.

-   Memory profiling.

-   Block (or blocking) profiling.

-   Mutex contention profiling.

#### 3.2.1\. CPU profiling

CPU profiling is the most common type of profile, and the most obvious.

When CPU profiling is enabled the runtime will interrupt itself every 10ms and record the stack trace of the currently running goroutines.

Once the profile is complete we can analyse it to determine the hottest code paths.

The more times a function appears in the profile, the more time that code path is taking as a percentage of the total runtime.

#### 3.2.2\. Memory profiling

Memory profiling records the stack trace when a _heap_ allocation is made.

Stack allocations are assumed to be free and are _not_tracked_ in the memory profile.

Memory profiling, like CPU profiling is sample based, by default memory profiling samples 1 in every 1000 allocations. This rate can be changed.

Because of memory profiling is sample based and because it tracks _allocations_ not _use_, using memory profiling to determine your application’s overall memory usage is difficult.

_Personal Opinion:_ I do not find memory profiling useful for finding memory leaks. There are better ways to determine how much memory your application is using. We will discuss these later in the presentation.

#### 3.2.3\. Block profiling

Block profiling is quite unique to Go.

A block profile is similar to a CPU profile, but it records the amount of time a goroutine spent waiting for a shared resource.

This can be useful for determining _concurrency_ bottlenecks in your application.

Block profiling can show you when a large number of goroutines _could_ make progress, but were _blocked_. Blocking includes:

-   Sending or receiving on a unbuffered channel.

-   Sending to a full channel, receiving from an empty one.

-   Trying to `Lock` a `sync.Mutex` that is locked by another goroutine.

Block profiling is a very specialised tool, it should not be used until you believe you have eliminated all your CPU and memory usage bottlenecks.

#### 3.2.4\. Mutex profiling

Mutex profiling is simlar to Block profiling, but is focused exclusively on operations that lead to delays caused by mutex contention.

I don’t have a lot of experience with this type of profile but I have built an example to demonstrate it. We’ll look at that example shortly.

### 3.3\. One profile at at time

Profiling is not free.

Profiling has a moderate, but measurable impact on program performance—especially if you increase the memory profile sample rate.

Most tools will not stop you from enabling multiple profiles at once.

> Do not enable more than one kind of profile at a time.
> If you enable multiple profile’s at the same time, they will observe their own interactions and throw off your results.

### 3.4\. Collecting a profile

The Go runtime’s profiling interface lives in the `runtime/pprof` package. `runtime/pprof` is a very low level tool, and for historic reasons the interfaces to the different kinds of profile are not uniform.

As we saw in the previous section, pprof profiling is built into the `testing` package, but sometimes its inconvenient, or difficult, to place the code you want to profile in the context of at `testing.B` benchmark and must use the `runtime/pprof` API directly.

A few years ago I wrote a [small package][0], to make it easier to profile an existing application.

```go
import "github.com/pkg/profile"

func main() {
	defer profile.Start().Stop()
	// ...
}
```

We’ll use the profile package throughout this section. Later in the day we’ll touch on using the `runtime/pprof` interface directly.

### 3.5\. Analysing a profile with pprof

Now that we’ve talked about what pprof can measure, and how to generate a profile, let’s talk about how to use pprof to analyse a profile.

The analysis is driven by the `go pprof` subcommand

<pre>go tool pprof /path/to/your/profile</pre>

This tool provides several different representations of the profiling data; textual, graphical, even flame graphs.

> If you’ve been using Go for a while, you might have been told that `pprof` takes two arguments. Since Go 1.9 the profile file contains all the information needed to render the profile. You do no longer need the binary which produced the profile. 🎉

#### 3.5.1\. Further reading

-   [Profiling Go programs](http://blog.golang.org/profiling-go-programs) (Go Blog)

-   [Debugging performance issues in Go programs](https://software.intel.com/en-us/blogs/2014/05/10/debugging-performance-issues-in-go-programs)

#### 3.5.2\. CPU profiling (exercise) {#cpu_profiling_exercise}

Let’s write a program to count words:

```go
package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"unicode"
)

func readbyte(r io.Reader) (rune, error) {
	var buf [1]byte
	_, err := r.Read(buf[:])
	return rune(buf[0]), err
}

func main() {
	f, err := os.Open(os.Args[1])
	if err != nil {
		log.Fatalf("could not open file %q: %v", os.Args[1], err)
	}

	words := 0
	inword := false
	for {
		r, err := readbyte(f)
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatalf("could not read file %q: %v", os.Args[1], err)
		}
		if unicode.IsSpace(r) && inword {
			words++
			inword = false
		}
		inword = unicode.IsLetter(r)
	}
	fmt.Printf("%q: %d words\n", os.Args[1], words)
}
```

Let’s see how many words there are in Herman Melville’s classic [Moby Dick](https://www.gutenberg.org/ebooks/2701) (sourced from Project Gutenberg)

```bash
% go build && time ./words moby.txt
"moby.txt": 181275 words

real    0m2.110s
user    0m1.264s
sys     0m0.944s
```

Let’s compare that to unix’s `wc -w`

```bash
% time wc -w moby.txt
215829 moby.txt

real    0m0.012s
user    0m0.009s
sys     0m0.002s
```

So the numbers aren’t the same. `wc` is about 19% higher because what it considers a word is different to what my simple program does. That’s not important—​both programs take the whole file as input and in a single pass count the number of transitions from word to non word.

Let’s investigate why these programs have different run times using pprof.

#### 3.5.3\. Add CPU profiling

First, edit `main.go` and enable profiling

```go
import (
        "github.com/pkg/profile"
)

func main() {
        defer profile.Start().Stop()
        // ...
```

Now when we run the program a `cpu.pprof` file is created.

```bash
% go run main.go moby.txt
2018/08/25 14:09:01 profile: cpu profiling enabled, /var/folders/by/3gf34_z95zg05cyj744_vhx40000gn/T/profile239941020/cpu.pprof
"moby.txt": 181275 words
2018/08/25 14:09:03 profile: cpu profiling disabled, /var/folders/by/3gf34_z95zg05cyj744_vhx40000gn/T/profile239941020/cpu.pprof
```

Now we have the profile we can analyse it with `go tool pprof`

```bash
% go tool pprof /var/folders/by/3gf34_z95zg05cyj744_vhx40000gn/T/profile239941020/cpu.pprof
Type: cpu
Time: Aug 25, 2018 at 2:09pm (AEST)
Duration: 2.05s, Total samples = 1.36s (66.29%)
Entering interactive mode (type "help" for commands, "o" for options)
(pprof) top
Showing nodes accounting for 1.42s, 100% of 1.42s total
      flat  flat%   sum%        cum   cum%
     1.41s 99.30% 99.30%      1.41s 99.30%  syscall.Syscall
     0.01s   0.7%   100%      1.42s   100%  main.readbyte
         0     0%   100%      1.41s 99.30%  internal/poll.(*FD).Read
         0     0%   100%      1.42s   100%  main.main
         0     0%   100%      1.41s 99.30%  os.(*File).Read
         0     0%   100%      1.41s 99.30%  os.(*File).read
         0     0%   100%      1.42s   100%  runtime.main
         0     0%   100%      1.41s 99.30%  syscall.Read
         0     0%   100%      1.41s 99.30%  syscall.read
```

The `top` command is one you’ll use the most. We can see that 99% of the time this program spends in `syscall.Syscall`, and a small part in `main.readbyte`.

We can also visualise this call the with the `web` command. This will generate a directed graph from the profile data. Under the hood this uses the `dot` command from Graphviz.

However, in Go 1.10 (possibly 1.11) Go ships with a version of pprof that natively supports a http sever

```bash
% go tool pprof -http=:8080 /var/folders/by/3gf34_z95zg05cyj744_vhx40000gn/T/profile239941020/cpu.pprof
```

Will open a web browser;

-   Graph mode

-   Flame graph mode

On the graph the box that consumes the _most_ CPU time is the largest — we see `sys call.Syscall` at 99.3% of the total time spent in the program. The string of boxes leading to `syscall.Syscall` represent the immediate callers — there can be more than one if multiple code paths converge on the same function. The size of the arrow represents how much time was spent in children of a box, we see that from `main.readbyte` onwards they account for near 0 of the 1.41 second spent in this arm of the graph.

_Question_: Can anyone guess why our version is so much slower than `wc`?

#### 3.5.4\. Improving our version

The reason our program is slow is not because Go’s `syscall.Syscall` is slow. It is because syscalls in general are expensive operations (and getting more expensive as more Spectre family vulnerabilities are discovered).

Each call to `readbyte` results in a syscall.Read with a buffer size of 1. So the number of syscalls executed by our program is equal to the size of the input. We can see that in the pprof graph that reading the input dominates everything else.

```go
func main() {
	defer profile.Start(profile.MemProfile, profile.MemProfileRate(1)).Stop()
	// defer profile.Start(profile.MemProfile).Stop()

	f, err := os.Open(os.Args[1])
	if err != nil {
		log.Fatalf("could not open file %q: %v", os.Args[1], err)
	}

	b := bufio.NewReader(f)
	words := 0
	inword := false
	for {
		r, err := readbyte(b)
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatalf("could not read file %q: %v", os.Args[1], err)
		}
		if unicode.IsSpace(r) && inword {
			words++
			inword = false
		}
		inword = unicode.IsLetter(r)
	}
	fmt.Printf("%q: %d words\n", os.Args[1], words)
}
```

By inserting a `bufio.Reader` between the input file and `readbyte` will

Compare the times of this revised program to `wc`. How close is it? Take a profile and see what remains.

#### 3.5.5\. Memory profiling

The new `words` profile suggests that something is allocating inside the `readbyte` function. We can use pprof to investigate.

```go
defer profile.Start(profile.MemProfile).Stop()
```

Then run the program as usual

```go
% go run main2.go moby.txt
2018/08/25 14:41:15 profile: memory profiling enabled (rate 4096), /var/folders/by/3gf34_z95zg05cyj744_vhx40000gn/T/profile312088211/mem.pprof
"moby.txt": 181275 words
2018/08/25 14:41:15 profile: memory profiling disabled, /var/folders/by/3gf34_z95zg05cyj744_vhx40000gn/T/profile312088211/mem.pprof
```

![](/public/img/high-performance-go-workshop/pprof-1.svg)

As we suspected the allocation was coming from `readbyte` — this wasn’t that complicated, readbyte is three lines long:

Use pprof to determine where the allocation is coming from.

```go
func readbyte(r io.Reader) (rune, error) {
        var buf [1]byte (1)
        _, err := r.Read(buf[:])
        return rune(buf[0]), err
}
```

**1.** Allocation is here

We’ll talk about why this is happening in more detail in the next section, but for the moment what we see is every call to readbyte is allocating a new one byte long _array_ and that array is being allocated on the heap.

What are some ways we can avoid this? Try them and use CPU and memory profiling to prove it.

##### Alloc objects vs. inuse objects

Memory profiles come in two varieties, named after their `go tool pprof` flags

-   `-alloc_objects` reports the call site where each allocation was made.

-   `-inuse_objects` reports the call site where an allocation was made _iff_ it was reachable at the end of the profile.

To demonstrate this, here is a contrived program which will allocate a bunch of memory in a controlled manner.

```go
const count = 100000

var y []byte

func main() {
	defer profile.Start(profile.MemProfile, profile.MemProfileRate(1)).Stop()
	y = allocate()
	runtime.GC()
}

// allocate allocates count byte slices and returns the first slice allocated.
func allocate() []byte {
	var x [][]byte
	for i := 0; i < count; i++ {
		x = append(x, makeByteSlice())
	}
	return x[0]
}

// makeByteSlice returns a byte slice of a random length in the range [0, 16384).
func makeByteSlice() []byte {
	return make([]byte, rand.Intn(2^14))
}
```

The program is annotation with the `profile` package, and we set the memory profile rate to `1` --that is, record a stack trace for every allocation. This is slows down the program a lot, but you’ll see why in a minute.

```bash
% go run main.go
2018/08/25 15:22:05 profile: memory profiling enabled (rate 1), /var/folders/by/3gf34_z95zg05cyj744_vhx40000gn/T/profile730812803/mem.pprof
2018/08/25 15:22:05 profile: memory profiling disabled, /var/folders/by/3gf34_z95zg05cyj744_vhx40000gn/T/profile730812803/mem.pprof
```

Lets look at the graph of allocated objects, this is the default, and shows the call graphs that lead to the allocation of every object during the profile.

```bash
% go tool pprof -http=:8080 /var/folders/by/3gf34_z95zg05cyj744_vhx40000gn/T/profile891268605/mem.pprof
```

![](/public/img/high-performance-go-workshop/pprof-2.svg)

Not surprisingly more than 99% of the allocations were inside `makeByteSlice`. Now lets look at the same profile using `-inuse_objects`

```bash
% go tool pprof -http=:8080 /var/folders/by/3gf34_z95zg05cyj744_vhx40000gn/T/profile891268605/mem.pprof
```

!()[/public/img/high-performance-go-workshop/pprof-3.svg]

What we see is not the objects that were _allocated_ during the profile, but the objects that remain _in use_, at the time the profile was taken — this ignores the stack trace for objects which have been reclaimed by the garbage collector.

#### 3.5.6\. Block profiling

The last profile type we’ll look at is block profiling. We’ll use the `ClientServer` benchmark from the `net/http` package

```
% go test -run=XXX -bench=ClientServer$ -blockprofile=/tmp/block.p net/http
% go tool pprof -http=:8080 /tmp/block.p
```

![](/public/img/high-performance-go-workshop/pprof-4.svg)

#### 3.5.7\. Thread creation profiling

Go 1.11 (?) added support for profiling the creation of operating system threads.

Add thread creation profiling to `godoc` and observe the results of profiling `godoc -http=:8080 -index`.

#### 3.5.8\. Framepointers

Go 1.7 has been released and along with a new compiler for amd64, the compiler now enables frame pointers by default.

The frame pointer is a register that always points to the top of the current stack frame.

Framepointers enable tools like `gdb(1)`, and `perf(1)` to understand the Go call stack.

We won’t cover these tools in this workshop, but you can read and watch a presentation I gave on seven different ways to profile Go programs.

-   [Seven ways to profile a Go program](https://talks.godoc.org/github.com/davecheney/presentations/seven.slide) (slides)

-   [Seven ways to profile a Go program](https://www.youtube.com/watch?v=2h_NFBFrciI) (video, 30 mins)

-   [Seven ways to profile a Go program](https://www.bigmarker.com/remote-meetup-go/Seven-ways-to-profile-a-Go-program) (webcast, 60 mins)

#### 3.5.9\. Exercise

-   Generate a profile from a piece of code you know well. If you don’t have a code sample, try profiling `godoc`.

    ```
    % go get golang.org/x/tools/cmd/godoc
    % cd $GOPATH/src/golang.org/x/tools/cmd/godoc
    % vim main.go
    ```

-   If you were to generate a profile on one machine and inspect it on another, how would you do it?

## [](#compiler-optimisation)[4\. Compiler optimisations](#compiler-optimisation)

This section covers some of the optimisations that the Go compiler performs.

For example;

-   Escape analysis

-   Inlining

-   Dead code elimination

are all handled in the front end of the compiler, while the code is still in its AST form; then the code is passed to the SSA compiler for further optimisation.

### 4.1\. History of the Go compiler

The Go compiler started as a fork of the Plan9 compiler tool chain circa 2007\. The compiler at that time bore a strong resemblance to Aho and Ullman’s [_Dragon Book_](https://www.goodreads.com/book/show/112269.Principles_of_Compiler_Design).

In 2015 the then Go 1.5 compiler was mechanically translated from [C into Go](https://golang.org/doc/go1.5#c).

A year later, Go 1.7 introduced a [new compiler backend](https://blog.golang.org/go1.7) based on [SSA](https://en.wikipedia.org/wiki/Static_single_assignment_form) techniques replaced the previous Plan 9 style code generation. This new backend introduced many opportunities for generic and architecture specific optimistions.

### 4.2\. Escape analysis

The first optimisation we’re doing to discuss is _escape analysis_.

To illustrate what escape analysis does recall that the [Go spec](https://golang.org/ref/spec) does not mention the heap or the stack. It only mentions that the language is garbage collected in the introduction, and gives no hints as to how this is to be achieved.

A compliant Go implementation of the Go spec _could_ store every allocation on the heap. That would put a lot of pressure on the the garbage collector, but it is in no way incorrect — for several years, gccgo had very limited support for escape analysis so could effectively be considered to be operating in this mode.

However, a goroutine’s stack exists as a cheap place to store local variables; there is no need to garbage collect things on the stack. Therefore, where it is safe to do so, an allocation placed on the stack will be more efficient.

In some languages, for example C and C++, the choice of allocating on the stack or on the heap is a manual exercise for the programmer—​heap allocations are made with `malloc` and `free`, stack allocation is via `alloca`. Mistakes using these mechanisms are a common cause of memory corruption bugs.

In Go, the compiler automatically moves a value to the heap if it lives beyond the lifetime of the function call. It is said that the value _escapes_ to the heap.

```
type Foo struct {
	a, b, c, d int
}

func NewFoo() *Foo {
	return &Foo{a: 3, b: 1, c: 4, d: 7}
}
```

In this example the `Foo` allocated in `NewFoo` will be moved to the heap so its contents remain valid after `NewFoo` has returned.

This has been present since the earliest days of Go. It isn’t so much an optimisation as an automatic correctness feature. Accidentally returning the address of a stack allocated variable is not possible in Go.

But the compiler can also do the opposite; it can find things which would be assumed to be allocated on the heap, and move them to stack.

Let’s have a look at an example

```
func Sum() int {
	const count = 100
	numbers := make([]int, count)
	for i := range numbers {
		numbers[i] = i + 1
	}

	var sum int
	for _, i := range numbers {
		sum += i
	}
	return sum
}

func main() {
	answer := Sum()
	fmt.Println(answer)
}
```

`Sum` adds the `int`s between 1 and 100 and returns the result.

Because the `numbers` slice is only referenced inside `Sum`, the compiler will arrange to store the 100 integers for that slice on the stack, rather than the heap. There is no need to garbage collect `numbers`, it is automatically freed when `Sum` returns.

#### 4.2.1\. Prove it! {#prove_it}

To print the compilers escape analysis decisions, use the `-m` flag.

```
% go build -gcflags=-m examples/esc/sum.go
# command-line-arguments
examples/esc/sum.go:22:13: inlining call to fmt.Println
examples/esc/sum.go:8:17: Sum make([]int, count) does not escape
examples/esc/sum.go:22:13: answer escapes to heap
examples/esc/sum.go:22:13: io.Writer(os.Stdout) escapes to heap
examples/esc/sum.go:22:13: main []interface {} literal does not escape
<autogenerated>:1: os.(*File).close .this does not escape
```

Line 8 shows the compiler has correctly deduced that the result of `make([]int, 100)` does not escape to the heap. The reason it did no

The reason line 22 reports that `answer` escapes to the heap is `fmt.Println` is a _variadic_ function. The parameters to a variadic function are _boxed_ into a slice, in this case a `[]interface{}`, so `answer` is placed into a interface value because it is referenced by the call to `fmt.Println`. Since Go 1.6 the garbage collector requires _all_ values passed via an interface to be pointers, what the compiler sees is _approximately_:

```
var answer = Sum()
fmt.Println([]interface{&answer}...)
```

We can confirm this using the `-gcflags="-m -m"` flag. Which returns

```
% go build -gcflags='-m -m' examples/esc/sum.go 2>&1 | grep sum.go:22
examples/esc/sum.go:22:13: inlining call to fmt.Println func(...interface {}) (int, error) { return fmt.Fprintln(io.Writer(os.Stdout), fmt.a...) }
examples/esc/sum.go:22:13: answer escapes to heap
examples/esc/sum.go:22:13:      from ~arg0 (assign-pair) at examples/esc/sum.go:22:13
examples/esc/sum.go:22:13: io.Writer(os.Stdout) escapes to heap
examples/esc/sum.go:22:13:      from io.Writer(os.Stdout) (passed to call[argument escapes]) at examples/esc/sum.go:22:13
examples/esc/sum.go:22:13: main []interface {} literal does not escape
```

In short, don’t worry about line 22, its not important to this discussion.

#### 4.2.2\. Exercises

-   Does this optimisation hold true for all values of `count`?

-   Does this optimisation hold true if `count` is a variable, not a constant?

-   Does this optimisation hold true if `count` is a parameter to `Sum`?

#### 4.2.3\. Escape analysis (continued) {#escape_analysis_continued}

This example is a little contrived. It is not intended to be real code, just an example.

```
type Point struct{ X, Y int }

const Width = 640
const Height = 480

func Center(p *Point) {
	p.X = Width / 2
	p.Y = Height / 2
}

func NewPoint() {
	p := new(Point)
	Center(p)
	fmt.Println(p.X, p.Y)
}
```

`NewPoint` creates a new `*Point` value, `p`. We pass `p` to the `Center` function which moves the point to a position in the center of the screen. Finally we print the values of `p.X` and `p.Y`.

```
% go build -gcflags=-m examples/esc/center.go
# command-line-arguments
examples/esc/center.go:11:6: can inline Center
examples/esc/center.go:18:8: inlining call to Center
examples/esc/center.go:19:13: inlining call to fmt.Println
examples/esc/center.go:11:13: Center p does not escape
examples/esc/center.go:19:15: p.X escapes to heap
examples/esc/center.go:19:20: p.Y escapes to heap
examples/esc/center.go:19:13: io.Writer(os.Stdout) escapes to heap
examples/esc/center.go:17:10: NewPoint new(Point) does not escape
examples/esc/center.go:19:13: NewPoint []interface {} literal does not escape
<autogenerated>:1: os.(*File).close .this does not escape
```

Even though `p` was allocated with the `new` function, it will not be stored on the heap, because no reference `p` escapes the `Center` function.

_Question_: What about line 19, if `p` doesn’t escape, what is escaping to the heap?

Write a benchmark to provide that `Sum` does not allocate.

### 4.3\. Inlining

In Go function calls in have a fixed overhead; stack and preemption checks.

Some of this is ameliorated by hardware branch predictors, but it’s still a cost in terms of function size and clock cycles.

Inlining is the classical optimisation that avoids these costs.

Until Go 1.11 inlining only worked on _leaf functions_, a function that does not call another. The justification for this is:

-   If your function does a lot of work, then the preamble overhead will be negligible. That’s why functions over a certain size (currently some count of instructions, plus a few operations which prevent inlining all together (eg. switch before Go 1.7)

-   Small functions on the other hand pay a fixed overhead for a relatively small amount of useful work performed. These are the functions that inlining targets as they benefit the most.

The other reason is that heavy inlining makes stack traces harder to follow.

#### 4.3.1\. Inlining (example) {#inlining_example}

```
func Max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func F() {
	const a, b = 100, 20
	if Max(a, b) == b {
		panic(b)
	}
}
```

Again we use the `-gcflags=-m` flag to view the compilers optimisation decision.

```
% go build -gcflags=-m examples/inl/max.go
# command-line-arguments
examples/inl/max.go:4:6: can inline Max
examples/inl/max.go:11:6: can inline F
examples/inl/max.go:13:8: inlining call to Max
examples/inl/max.go:20:6: can inline main
examples/inl/max.go:21:3: inlining call to F
examples/inl/max.go:21:3: inlining call to Max
```

The compiler printed two lines.

-   The first at line 3, the declaration of `Max`, telling us that it can be inlined.

-   The second is reporting that the body of `Max` has been inlined into the caller at line 12.

#### 4.3.2\. What does inlining look like? {#what_does_inlining_look_like}

Compile `max.go` and see what the optimised version of `F()` became.

```
% go build -gcflags=-S examples/inl/max.go 2>&1 | grep -A5 '"".F STEXT'
"".F STEXT nosplit size=2 args=0x0 locals=0x0
        0x0000 00000 (/Users/dfc/devel/high-performance-go-workshop/examples/inl/max.go:11)     TEXT    "".F(SB), NOSPLIT|ABIInternal, $0-0
        0x0000 00000 (/Users/dfc/devel/high-performance-go-workshop/examples/inl/max.go:11)     FUNCDATA        $0, gclocals·33cdeccccebe80329f1fdbee7f5874cb(SB)
        0x0000 00000 (/Users/dfc/devel/high-performance-go-workshop/examples/inl/max.go:11)     FUNCDATA        $1, gclocals·33cdeccccebe80329f1fdbee7f5874cb(SB)
        0x0000 00000 (/Users/dfc/devel/high-performance-go-workshop/examples/inl/max.go:11)     FUNCDATA        $3, gclocals·33cdeccccebe80329f1fdbee7f5874cb(SB)
        0x0000 00000 (/Users/dfc/devel/high-performance-go-workshop/examples/inl/max.go:13)     PCDATA  $2, $0
```

This is the body of `F` once `Max` has been inlined into it — there’s nothing happening in this function. I know there’s a lot of text on the screen for nothing, but take my word for it, the only thing happening is the `RET`. In effect `F` became:

```
func F() {
        return
}
```

| | What are FUNCDATA and PCDATA?

The output from `-S` is not the final machine code that goes into your binary. The linker does some processing during the final link stage. Lines like `FUNCDATA` and `PCDATA` are metadata for the garbage collector which are moved elsewhere when linking. If you’re reading the output of `-S`, just ignore `FUNCDATA` and `PCDATA` lines; they’re not part of the final binary.

For the rest of the presentation I’ll be using a small shell script to reduce the clutter in the assembly output.

```
asm() {
        go build -gcflags=-S 2>&1 $@ | grep -v PCDATA | grep -v FUNCDATA | less
}
```

|

_Without_ using the `//go:noinline` comment, rewrite `Max` such that it still returns the right answer, but is no longer considered inlineable by the compiler.

Here’s one way to do it

```
include::../examples/inl/max_noinline.go
```

Let’s see what the compiler thinks of it

```
% go build -gcflags=-m max_noinline.go
# command-line-arguments
./max_noinline.go:16:6: can inline F (1)
./max_noinline.go:25:6: can inline main
./max_noinline.go:26:3: inlining call to F
```

| **1** | The `can inline Max` line is now missing |

We can double check this with two `-m` flags

```
% go build -gcflags=-m=2 max_noinline.go
# command-line-arguments
./max_noinline.go:6:6: cannot inline Max: unhandled op SELECT (1)
./max_noinline.go:16:6: can inline F as: func() { <node DCLCONST>; <node DCLCONST>; if Max(a, b) == b { panic(b) } } (2)
./max_noinline.go:25:6: can inline main as: func() { F() }
./max_noinline.go:26:3: inlining call to F func() { <node DCLCONST>; <node DCLCONST>; if Max(a, b) == b { panic(b) } }
```

| **1** | `Max` is no longer inlinable because it contains a `select` statement |
| **2** | Note this is the code that the compiler sees, this is why `Max is inline twice` |

#### 4.3.3\. Discussion

Why did I declare `a` and `b` in `F()` to be constants?

Experiment with the output of What happens if `a` and `b` are declared as are variables? What happens if `a` and `b` are passing into `F()` as parameters?

| | `-gcflags=-S` doesn’t prevent the final binary being build in your working directory. If you find that subsequent runs of `go build …​` produce no output, delete the `./max` binary in your working directory. |

#### 4.3.4\. Adjusting the level of inlining

Adjusting the _inlining level_ is performed with the `-gcflags=-l` flag. Somewhat confusingly passing a single `-l` will disable inlining, and two or more will enable inlining at more aggressive settings.

-   `-gcflags=-l`, inlining disabled.

-   nothing, regular inlining.

-   `-gcflags='-l -l'` inlining level 2, more aggressive, might be faster, may make bigger binaries.

-   `-gcflags='-l -l -l'` inlining level 3, more aggressive again, binaries definitely bigger, maybe faster again, but might also be buggy.

-   `-gcflags=-l=4` (four `-l`s) in Go 1.11 will enable the experimental [_mid stack_ inlining optimisation](https://github.com/golang/go/issues/19348#issuecomment-393654429). I believe as of Go 1.12 it has no effect.

#### 4.3.5\. Mid Stack inlining

Since Go 1.12 so called _mid stack_ inlining has been enabled (it was previously available in preview in Go 1.11 with the `-gcflags='-l -l -l -l'` flag).

We can see an example of mid stack inlining in the previous example. In Go 1.11 and earlier `F` would not have been a leaf function — it called `max`. However because of inlining improvements `F` is now inlined into its caller. This is for two reasons; . When `max` is inlined into `F`, `F` contains no other function calls thus it becomes a potential _leaf function_, assuming its complexity budget has not been exceeded. . Because `F` is a simple function—​inlining and dead code elimination has eliminated much of its complexity budget—​it is eligable for _mid stack_ inlining irrispective of calling `max`.

| |

Mid stack inlining can be used to inline the fast path of a function, eliminating the function call overhead in the fast path. [This recent CL which landed in for Go 1.13](https://go-review.googlesource.com/c/go/+/152698) shows this technique applied to `sync.RWMutex.Unlock()`.

|

### 4.4\. Dead code elimination

Why is it important that `a` and `b` are constants?

To understand what happened lets look at what the compiler sees once its inlined `Max` into `F`. We can’t get this from the compiler easily, but it’s straight forward to do it by hand.

Before:

```
func Max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func F() {
	const a, b = 100, 20
	if Max(a, b) == b {
		panic(b)
	}
}
```

After:

```
func F() {
	const a, b = 100, 20
	var result int
	if a > b {
		result = a
	} else {
		result = b
	}
	if result == b {
		panic(b)
	}
}
```

Because `a` and `b` are constants the compiler can prove at compile time that the branch will never be false; `100` is always greater than `20`. So the compiler can further optimise `F` to

```
func F() {
	const a, b = 100, 20
	var result int
	if true {
		result = a
	} else {
		result = b
	}
	if result == b {
		panic(b)
	}
}
```

Now that the result of the branch is know then then the contents of `result` are also known. This is call _branch elimination_.

```
func F() {
        const a, b = 100, 20
        const result = a
        if result == b {
                panic(b)
        }
}
```

Now the branch is eliminated we know that `result` is always equal to `a`, and because `a` was a constant, we know that `result` is a constant. The compiler applies this proof to the second branch

```
func F() {
        const a, b = 100, 20
        const result = a
        if false {
                panic(b)
        }
}
```

And using branch elimination again the final form of `F` is reduced to.

```
func F() {
        const a, b = 100, 20
        const result = a
}
```

And finally just

```
func F() {
}
```

#### 4.4.1\. Dead code elimination (cont.) {#dead_code_elimination_cont}

Branch elimination is one of a category of optimisations known as _dead code elimination_. In effect, using static proofs to show that a piece of code is never reachable, colloquially known as _dead_, therefore it need not be compiled, optimised, or emitted in the final binary.

We saw how dead code elimination works together with inlining to reduce the amount of code generated by removing loops and branches that are proven unreachable.

You can take advantage of this to implement expensive debugging, and hide it behind

```
const debug = false
```

Combined with build tags this can be very useful.

#### 4.4.2\. Further reading

-   [Using // +build to switch between debug and release builds](http://dave.cheney.net/2014/09/28/using-build-to-switch-between-debug-and-release)

-   [How to use conditional compilation with the go build tool](http://dave.cheney.net/2013/10/12/how-to-use-conditional-compilation-with-the-go-build-tool)

### 4.5\. Prove pass

A few releases ago the SSA backend gained a, so called, prove pass. Prove, the verb form of Proof, establishes the relationship between variables.

Let’s look at an example to explain what prove is doing.

```
package main

func foo(x int) bool {
	if x > 5 { (1)
		if x > 3 { (2)
			return true
		}
		panic("x less than 3")
	}
	return false
}

func main() {
	foo(-1)
}
```

| **1** | At this point the compiler knows that x is greater than 5 |
| **2** | Therefore x is _also_ greater than 3, this the branch is always taken. |

#### 4.5.1\. Prove it (ha!) {#prove_it_ha}

Just as with inining and escape analysis we can ask the compiler to show us the working of the prove pass. We do this with the `-d` flag passed to `go tool compile` via `-gcflags`

```
% go build -gcflags=-d=ssa/prove/debug=on foo.go
# command-line-arguments
./foo.go:5:10: Proved Greater64
```

Line 5 is `if x > 3`. The compiler is saying that is has proven that the branch will always be true.

Experiment with the output of What happens if `a` and `b` are declared as are variables? What happens if `a` and `b` are passing into `F()` as parameters?

### 4.6\. Compiler intrinsics

Go allows you to write functions in assembly if required. The technique involves a forwarding declared function—​a function without a body—​and a corresponding assembly function.

decl.go

```
package asm

// Add returns the sum of a and b.
func Add(a int64, b int64) int64
```

Here we’re declaring an `Add` function which takes two `int64’s and returns a third. Note the`Add` function has no body. If we were to compile it we would see something like this

```
% go build
# high-performance-go-workshop/examples/asm [high-performance-go-workshop/examples/asm.test]
./decl.go:4:6: missing function body
```

To satisfy the compiler we must supply the assembly for this function, which we can do via a `.s` file in the same package.

add.s

```
TEXT ·Add(SB),$0
	MOVQ a+0(FP), AX
	ADDQ b+8(FP), AX
	MOVQ AX, ret+16(FP)
	RET
```

Now we can build, test, and use our `asm.Add` function just like normal Go code.

But there’s a problem, assembly functions **cannot be inlined**. This has long been a complaint by Go developers who need to use assembly either for performance, or for operations which are not exposed in the language; vector instructions, atomic primatives and so on, which when written as assembly functions pay a high overhead cost because they cannot be inlined.

There have been various proposals for an inline assembly syntax for Go, similar to GCC’s `asm(…​)` directive, but they have not been accepted by the Go developers. Instead, Go has added _intrinsic functions_.

An intrinsic function is regular Go code written in regular Go, however the compiler contains specific drop in replacements for the functions.

The two packages that make use of this this are

-   `math/bits`

-   `sync/atomic`

These replacements are implemented in the compiler backend; if your architecture supports a faster way of doing an operation it will be transparently replaced with the comparable instruction during compilation.

As well as generating more efficient code, because intrinsic functions are just normal Go code, the rules of inlining, and mid stack inlining apply to them.

#### 4.6.1\. Atomic counter example

```
package main

import (
	"sync/atomic"
)

type counter uint64

func (c *counter) get() uint64 {
	return atomic.LoadUint64((*uint64)(c))
}
func (c *counter) inc() uint64 {
	return atomic.AddUint64((*uint64)(c), 1)
}
func (c *counter) reset() uint64 {
	return atomic.SwapUint64((*uint64)(c), 0)
}

var c counter

func f() uint64 {
	c.inc()
	c.get()
	return c.reset()
}

func main() {
	f()
}
```

This means examples like the one above compile to efficient native code on most platforms.

```
"".f STEXT nosplit size=36 args=0x8 locals=0x0
        0x0000 00000 (/tmp/counter.go:21)       TEXT    "".f(SB), NOSPLIT|ABIInternal, $0-8
        0x0000 00000 (<unknown line number>)    NOP
        0x0000 00000 (/tmp/counter.go:22)       MOVL    $1, AX
        0x0005 00005 (/tmp/counter.go:13)       LEAQ    "".c(SB), CX
        0x000c 00012 (/tmp/counter.go:13)       LOCK
        0x000d 00013 (/tmp/counter.go:13)       XADDQ   AX, (CX) (1)
        0x0011 00017 (/tmp/counter.go:23)       XCHGL   AX, AX
        0x0012 00018 (/tmp/counter.go:10)       MOVQ    "".c(SB), AX (2)
        0x0019 00025 (<unknown line number>)    NOP
        0x0019 00025 (/tmp/counter.go:16)       XORL    AX, AX
        0x001b 00027 (/tmp/counter.go:16)       XCHGQ   AX, (CX) (3)
        0x001e 00030 (/tmp/counter.go:24)       MOVQ    AX, "".~r0+8(SP)
        0x0023 00035 (/tmp/counter.go:24)       RET
        0x0000 b8 01 00 00 00 48 8d 0d 00 00 00 00 f0 48 0f c1  .....H.......H..
        0x0010 01 90 48 8b 05 00 00 00 00 31 c0 48 87 01 48 89  ..H......1.H..H.
        0x0020 44 24 08 c3                                      D$..
        rel 8+4 t=15 "".c+0
        rel 21+4 t=15 "".c+0
```

| **1** | `c.inc()` |
| **2** | `c.get()` |
| **3** | `c.reset()` |

##### Further reading

-   [Mid-stack inlining in the Go compiler presentation by David Lazar](https://docs.google.com/presentation/d/1Wcblp3jpfeKwA0Y4FOmj63PW52M_qmNqlQkNaLj0P5o/edit#slide=id.p)

-   [Proposal: Mid-stack inlining in the Go compiler](https://github.com/golang/proposal/blob/master/design/19348-midstack-inlining.md)

<mark>TODO: double check</mark>

### 4.7\. Compiler flags Exercises

Compiler flags are provided with:

```
go build -gcflags=$FLAGS
```

Investigate the operation of the following compiler functions:

-   `-S` prints the (Go flavoured) assembly of the _package_ being compiled.

-   `-l` controls the behaviour of the inliner; `-l` disables inlining, `-l -l` increases it (more `-l` 's increases the compiler’s appetite for inlining code). Experiment with the difference in compile time, program size, and run time.

-   `-m` controls printing of optimisation decision like inlining, escape analysis. `-m`-m` prints more details about what the compiler was thinking.

-   `-l -N` disables all optimisations.

-   `-d=ssa/prove/debug=on`, this also takes values of 2 and above, see what prints

-   The `-d` flag takes other values, you can find out what they are with the command `go tool compile -d help`. Experiment and see what you can discovrer.

| | If you find that subsequent runs of `go build …​` produce no output, delete the output binary in your working directory. |

#### 4.7.1\. Further reading

-   [Codegen Inspection by Jaana Burcu Dogan](http://go-talks.appspot.com/github.com/rakyll/talks/gcinspect/talk.slide#1)

## [](#execution-tracer)[5\. Execution Tracer](#execution-tracer)

The execution tracer was developed by [Dmitry Vyukov](https://github.com/dvyukov) for Go 1.5 and remained under documented, and under utilised, for several years.

Unlike sample based profiling, the execution tracer is integrated into the Go runtime, so it does just know what a Go program is doing at a particular point in time, but _why_.

### 5.1\. What is the execution tracer, why do we need it? {#what_is_the_execution_tracer_why_do_we_need_it}

I think its easiest to explain what the execution tracer does, and why it’s important by looking at a piece of code where the pprof, `go tool pprof` performs poorly.

The `examples/mandelbrot` directory contains a simple mandelbrot generator. This code is derived from [Francesc Campoy’s mandelbrot package](https://github.com/campoy/mandelbrot).

```
cd examples/mandelbrot
go build && ./mandelbrot
```

If we build it, then run it, it generates something like this

![](https://dave.cheney.net/high-performance-go-workshop/images/mandelbrot.png)

#### 5.1.1\. How long does it take? {#how_long_does_it_take}

So, how long does this program take to generate a 1024 x 1024 pixel image?

The simplest way I know how to do this is to use something like `time(1)`.

```
% time ./mandelbrot
real    0m1.654s
user    0m1.630s
sys     0m0.015s
```

| | Don’t use `time go run mandebrot.go` or you’ll time how long it takes to _compile_ the program as well as run it. |

#### 5.1.2\. What is the program doing? {#what_is_the_program_doing}

So, in this example the program took 1.6 seconds to generate the mandelbrot and write to to a png.

Is that good? Could we make it faster?

One way to answer that question would be to use Go’s built in pprof support to profile the program.

Let’s try that.

### 5.2\. Generating the profile

To turn generate a profile we need to either

1.  Use the `runtime/pprof` package directly.

2.  Use a wrapper like `github.com/pkg/profile` to automate this.

### 5.3\. Generating a profile with runtime/pprof {#generating_a_profile_with_runtimepprof}

To show you that there’s no magic, let’s modify the program to write a CPU profile to `os.Stdout`.

```

import "runtime/pprof"

func main() {
	pprof.StartCPUProfile(os.Stdout)
	defer pprof.StopCPUProfile()
```

By adding this code to the top of the `main` function, this program will write a profile to `os.Stdout`.

```
cd examples/mandelbrot-runtime-pprof
go run mandelbrot.go > cpu.pprof
```

| | We can use `go run` in this case because the cpu profile will only include the execution of `mandelbrot.go`, not its compilation. |

#### 5.3.1\. Generating a profile with github.com/pkg/profile {#generating_a_profile_with_github_compkgprofile}

The previous slide showed a super cheap way to generate a profile, but it has a few problems.

-   If you forget to redirect the output to a file then you’ll blow up that terminal session. 😞 (hint: `reset(1)` is your friend)

-   If you write anything else to `os.Stdout`, for example, `fmt.Println` you’ll corrupt the trace.

The recommended way to use `runtime/pprof` is to [write the trace to a file](https://godoc.org/runtime/pprof#hdr-Profiling_a_Go_program). But, then you have to make sure the trace is stopped, and file is closed before your program stops, including if someone `^C’s it.

So, a few years ago I wrote a [package](https://godoc.org/github.gom/pkg/profile) to take care of it.

```

import "github.com/pkg/profile"

func main() {
	defer profile.Start(profile.CPUProfile, profile.ProfilePath(".")).Stop()
```

If we run this version, we get a profile written to the current working directory

```
% go run mandelbrot.go
2017/09/17 12:22:06 profile: cpu profiling enabled, cpu.pprof
2017/09/17 12:22:08 profile: cpu profiling disabled, cpu.pprof
```

| | Using `pkg/profile` is not mandatory, but it takes care of a lot of the boilerplate around collecting and recording traces, so we’ll use it for the rest of this workshop. |

#### 5.3.2\. Analysing the profile

Now we have a profile, we can use `go tool pprof` to analyse it.

```
% go tool pprof -http=:8080 cpu.pprof
```

In this run we see that the program ran for 1.81s seconds (profiling adds a small overhead). We can also see that pprof only captured data for 1.53 seconds, as pprof is sample based, relying on the operating system’s `SIGPROF` timer.

| | Since Go 1.9 the `pprof` trace contains all the information you need to analyse the trace. You no longer need to also have the matching binary which produced the trace. 🎉 |

We can use the `top` pprof function to sort functions recorded by the trace

```
% go tool pprof cpu.pprof
Type: cpu
Time: Mar 24, 2019 at 5:18pm (CET)
Duration: 2.16s, Total samples = 1.91s (88.51%)
Entering interactive mode (type "help" for commands, "o" for options)
(pprof) top
Showing nodes accounting for 1.90s, 99.48% of 1.91s total
Showing top 10 nodes out of 35
      flat  flat%   sum%        cum   cum%
     0.82s 42.93% 42.93%      1.63s 85.34%  main.fillPixel
     0.81s 42.41% 85.34%      0.81s 42.41%  main.paint
     0.11s  5.76% 91.10%      0.12s  6.28%  runtime.mallocgc
     0.04s  2.09% 93.19%      0.04s  2.09%  runtime.memmove
     0.04s  2.09% 95.29%      0.04s  2.09%  runtime.nanotime
     0.03s  1.57% 96.86%      0.03s  1.57%  runtime.pthread_cond_signal
     0.02s  1.05% 97.91%      0.04s  2.09%  compress/flate.(*compressor).deflate
     0.01s  0.52% 98.43%      0.01s  0.52%  compress/flate.(*compressor).findMatch
     0.01s  0.52% 98.95%      0.01s  0.52%  compress/flate.hash4
     0.01s  0.52% 99.48%      0.01s  0.52%  image/png.filter
```

We see that the `main.fillPixel` function was on the CPU the most when pprof captured the stack.

Finding `main.paint` on the stack isn’t a surprise, this is what the program does; it paints pixels. But what is causing `paint` to spend so much time? We can check that with the _cummulative_ flag to `top`.

```
(pprof) top --cum
Showing nodes accounting for 1630ms, 85.34% of 1910ms total
Showing top 10 nodes out of 35
      flat  flat%   sum%        cum   cum%
         0     0%     0%     1840ms 96.34%  main.main
         0     0%     0%     1840ms 96.34%  runtime.main
     820ms 42.93% 42.93%     1630ms 85.34%  main.fillPixel
         0     0% 42.93%     1630ms 85.34%  main.seqFillImg
     810ms 42.41% 85.34%      810ms 42.41%  main.paint
         0     0% 85.34%      210ms 10.99%  image/png.(*Encoder).Encode
         0     0% 85.34%      210ms 10.99%  image/png.Encode
         0     0% 85.34%      160ms  8.38%  main.(*img).At
         0     0% 85.34%      160ms  8.38%  runtime.convT2Inoptr
         0     0% 85.34%      150ms  7.85%  image/png.(*encoder).writeIDATs
```

This is sort of suggesting that `main.fillPixed` is actually doing most of the work.

> You can also visualise the profile with the `web` command, which looks like this:
> ![](/public/img/high-performance-go-workshop/pprof-5.svg)

### 5.4\. Tracing vs Profiling

Hopefully this example shows the limitations of profiling. Profiling told us what the profiler saw; `fillPixel` was doing all the work. There didn’t look like there was much that could be done about that.

So now it’s a good time to introduce the execution tracer which gives a different view of the same program.

#### 5.4.1\. Using the execution tracer

Using the tracer is as simple as asking for a `profile.TraceProfile`, nothing else changes.

```

import "github.com/pkg/profile"

func main() {
	defer profile.Start(profile.TraceProfile, profile.ProfilePath(".")).Stop()
```

When we run the program, we get a `trace.out` file in the current working directory.

```
% go build mandelbrot.go
% % time ./mandelbrot
2017/09/17 13:19:10 profile: trace enabled, trace.out
2017/09/17 13:19:12 profile: trace disabled, trace.out

real    0m1.740s
user    0m1.707s
sys     0m0.020s
```

Just like pprof, there is a tool in the `go` command to analyse the trace.

```
% go tool trace trace.out
2017/09/17 12:41:39 Parsing trace...
2017/09/17 12:41:40 Serializing trace...
2017/09/17 12:41:40 Splitting trace...
2017/09/17 12:41:40 Opening browser. Trace viewer s listening on http://127.0.0.1:57842
```

This tool is a little bit different to `go tool pprof`. The execution tracer is reusing a lot of the profile visualisation infrastructure built into Chrome, so `go tool trace` acts as a server to translate the raw execution trace into data which Chome can display natively.

#### 5.4.2\. Analysing the trace

We can see from the trace that the program is only using one cpu.

```
func seqFillImg(m *img) {
	for i, row := range m.m {
		for j := range row {
			fillPixel(m, i, j)
		}
	}
}
```

This isn’t a surprise, by default `mandelbrot.go` calls `fillPixel` for each pixel in each row in sequence.

Once the image is painted, see the execution switches to writing the `.png` file. This generates garbage on the heap, and so the trace changes at that point, we can see the classic saw tooth pattern of a garbage collected heap.

The trace profile offers timing resolution down to the _microsecond_ level. This is something you just can’t get with external profiling.

| | go tool trace

Before we go on there are some things we should talk about the usage of the trace tool.

-   The tool uses the javascript debugging support built into Chrome. Trace profiles can only be viewed in Chrome, they won’t work in Firefox, Safari, IE/Edge. Sorry.

-   Because this is a Google product, it supports keyboard shortcuts; use `WASD` to navigate, use `?` to get a list.

-   Viewing traces can take a **lot** of memory. Seriously, 4Gb won’t cut it, 8Gb is probably the minimum, more is definitely better.

-   If you’ve installed Go from an OS distribution like Fedora, the support files for the trace viewer may not be part of the main `golang` deb/rpm, they might be in some `-extra` package.

|

### 5.5\. Using more than one CPU

We saw from the previous trace that the program is running sequentially and not taking advantage of the other CPUs on this machine.

Mandelbrot generation is known as _embarassingly_parallel_. Each pixel is independant of any other, they could all be computed in parallel. So, let’s try that.

```
% go build mandelbrot.go
% time ./mandelbrot -mode px
2017/09/17 13:19:48 profile: trace enabled, trace.out
2017/09/17 13:19:50 profile: trace disabled, trace.out

real    0m1.764s
user    0m4.031s
sys     0m0.865s
```

So the runtime was basically the same. There was more user time, which makes sense, we were using all the CPUs, but the real (wall clock) time was about the same.

Let’s look a the trace.

As you can see this trace generated _much_ more data.

-   It looks like lots of work is being done, but if you zoom right in, there are gaps. This is believed to be the scheduler.

-   While we’re using all four cores, because each `fillPixel` is a relatively small amount of work, we’re spending a lot of time in scheduling overhead.

### 5.6\. Batching up work

Using one goroutine per pixel was too fine grained. There wasn’t enough work to justify the cost of the goroutine.

Instead, let’s try processing one row per goroutine.

```
% go build mandelbrot.go
% time ./mandelbrot -mode row
2017/09/17 13:41:55 profile: trace enabled, trace.out
2017/09/17 13:41:55 profile: trace disabled, trace.out

real    0m0.764s
user    0m1.907s
sys     0m0.025s
```

This looks like a good improvement, we almost halved the runtime of the program. Let’s look at the trace.

As you can see the trace is now smaller and easier to work with. We get to see the whole trace in span, which is a nice bonus.

-   At the start of the program we see the number of goroutines ramp up to around 1,000\. This is an improvement over the 1 << 20 that we saw in the previous trace.

-   Zooming in we see `onePerRowFillImg` runs for longer, and as the goroutine _producing_ work is done early, the scheduler efficiently works through the remaining runnable goroutines.

### 5.7\. Using workers

`mandelbrot.go` supports one other mode, let’s try it.

```
% go build mandelbrot.go
% time ./mandelbrot -mode workers
2017/09/17 13:49:46 profile: trace enabled, trace.out
2017/09/17 13:49:50 profile: trace disabled, trace.out

real    0m4.207s
user    0m4.459s
sys     0m1.284s
```

So, the runtime was much worse than any previous. Let’s look at the trace and see if we can figure out what happened.

Looking at the trace you can see that with only one worker process the producer and consumer tend to alternate because there is only one worker and one consumer. Let’s increase the number of workers

```
% go build mandelbrot.go
% time ./mandelbrot -mode workers -workers 4
2017/09/17 13:52:51 profile: trace enabled, trace.out
2017/09/17 13:52:57 profile: trace disabled, trace.out

real    0m5.528s
user    0m7.307s
sys     0m4.311s
```

So that made it worse! More real time, more CPU time. Let’s look at the trace to see what happened.

That trace is a mess. There were more workers available, but the seemed to spend all their time fighting over the work to do.

This is because the channel is _unbuffered_. An unbuffered channel cannot send until there is someone ready to receive.

-   The producer cannot send work until there is a worker ready to receive it.

-   Workers cannot receive work until there is someone ready to send, so they compete with each other when they are waiting.

-   The sender is not privileged, it cannot take priority over a worker that is already running.

What we see here is a lot of latency introduced by the unbuffered channel. There are lots of stops and starts inside the scheduler, and potentially locks and mutexes while waiting for work, this is why we see the `sys` time higher.

### 5.8\. Using buffered channels

```

import "github.com/pkg/profile"

func main() {
	defer profile.Start(profile.TraceProfile, profile.ProfilePath(".")).Stop()
```

```
% go build mandelbrot.go
% time ./mandelbrot -mode workers -workers 4
2017/09/17 14:23:56 profile: trace enabled, trace.out
2017/09/17 14:23:57 profile: trace disabled, trace.out

real    0m0.905s
user    0m2.150s
sys     0m0.121s
```

Which is pretty close to the per row mode above.

Using a buffered channel the trace showed us that:

-   The producer doesn’t have to wait for a worker to arrive, it can fill up the channel quickly.

-   The worker can quickly take the next item from the channel without having to sleep waiting on work to be produced.

Using this method we got nearly the same speed using a channel to hand off work per pixel than we did previously scheduling on goroutine per row.

Modify `nWorkersFillImg` to work per row. Time the result and analyse the trace.

### 5.9\. Mandelbrot microservice

It’s 2019, generating Mandelbrots is pointless unless you can offer them on the internet as a serverless microservice. Thus, I present to you, _Mandelweb_

```
% go run examples/mandelweb/mandelweb.go
2017/09/17 15:29:21 listening on http://127.0.0.1:8080/
```

[http://127.0.0.1:8080/mandelbrot](http://127.0.0.1:8080/mandelbrot)

#### 5.9.1\. Tracing running applications

In the previous example we ran the trace over the whole program.

As you saw, traces can be very large, even for small amounts of time, so collecting trace data continually would generate far too much data. Also, tracing can have an impact on the speed of your program, especially if there is a lot of activity.

What we want is a way to collect a short trace from a running program.

Fortuntately, the `net/http/pprof` package has just such a facility.

#### 5.9.2\. Collecting traces via http

Hopefully everyone knows about the `net/http/pprof` package.

```
import _ "net/http/pprof"
```

When imported, the `net/http/pprof` will register tracing and profiling routes with `http.DefaultServeMux`. Since Go 1.5 this includes the trace profiler.

| | `net/http/pprof` registers with `http.DefaultServeMux`. If you are using that `ServeMux` implicitly, or explicitly, you may inadvertently expose the pprof endpoints to the internet. This can lead to source code disclosure. You probably don’t want to do this. |

We can grab a five second trace from mandelweb with `curl` (or `wget`)

```
% curl -o trace.out http://127.0.0.1:8080/debug/pprof/trace?seconds=5
```

#### 5.9.3\. Generating some load

The previous example was interesting, but an idle webserver has, by definition, no performance issues. We need to generate some load. For this I’m using [`hey` by JBD](https://github.com/rakyll/hey).

```
% go get -u github.com/rakyll/hey
```

Let’s start with one request per second.

```
% hey -c 1 -n 1000 -q 1 http://127.0.0.1:8080/mandelbrot
```

And with that running, in another window collect the trace

```
% curl -o trace.out http://127.0.0.1:8080/debug/pprof/trace?seconds=5
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 66169    0 66169    0     0  13233      0 --:--:--  0:00:05 --:--:-- 17390
% go tool trace trace.out
2017/09/17 16:09:30 Parsing trace...
2017/09/17 16:09:30 Serializing trace...
2017/09/17 16:09:30 Splitting trace...
2017/09/17 16:09:30 Opening browser.
Trace viewer is listening on http://127.0.0.1:60301
```

#### 5.9.4\. Simulating overload

Let’s increase the rate to 5 requests per second.

```
% hey -c 5 -n 1000 -q 5 http://127.0.0.1:8080/mandelbrot
```

And with that running, in another window collect the trace

<pre>% curl -o trace.out http://127.0.0.1:8080/debug/pprof/trace?seconds=5
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                Dload  Upload   Total   Spent    Left  Speed
100 66169    0 66169    0     0  13233      0 --:--:--  0:00:05 --:--:-- 17390
% go tool trace trace.out
2017/09/17 16:09:30 Parsing trace...
2017/09/17 16:09:30 Serializing trace...
2017/09/17 16:09:30 Splitting trace...
2017/09/17 16:09:30 Opening browser. Trace viewer is listening on http://127.0.0.1:60301</pre>

#### 5.9.5\. Extra credit, the Sieve of Eratosthenes {#extra_credit_the_sieve_of_eratosthenes}

The [concurrent prime sieve](https://github.com/golang/go/blob/master/doc/play/sieve.go) is one of the first Go programs written.

Ivan Daniluk [wrote a great post on visualising](http://divan.github.io/posts/go_concurrency_visualize/) it.

Let’s take a look at its operation using the execution tracer.

#### 5.9.6\. More resources

-   Rhys Hiltner, [Go’s execution tracer](https://www.youtube.com/watch?v=mmqDlbWk_XA) (dotGo 2016)

-   Rhys Hiltner, [An Introduction to "go tool trace"](https://www.youtube.com/watch?v=V74JnrGTwKA) (GopherCon 2017)

-   Dave Cheney, [Seven ways to profile Go programs](https://www.youtube.com/watch?v=2h_NFBFrciI) (GolangUK 2016)

-   Dave Cheney, [High performance Go workshop](https://dave.cheney.net/training#high-performance-go)]

-   Ivan Daniluk, [Visualizing Concurrency in Go](https://www.youtube.com/watch?v=KyuFeiG3Y60) (GopherCon 2016)

-   Kavya Joshi, [Understanding Channels](https://www.youtube.com/watch?v=KBZlN0izeiY) (GopherCon 2017)

-   Francesc Campoy, [Using the Go execution tracer](https://www.youtube.com/watch?v=ySy3sR1LFCQ)

## [](#memory-and-gc)[6\. Memory and Garbage Collector](#memory-and-gc)

Go is a garbage collected language. This is a design principle, it will not change.

As a garbage collected language, the performance of Go programs is often determined by their interaction with the garbage collector.

Next to your choice of algorithms, memory consumption is the most important factor that determines the performance and scalability of your application.

This section discusses the operation of the garbage collector, how to measure the memory usage of your program and strategies for lowering memory usage if garbage collector performance is a bottleneck.

### 6.1\. Garbage collector world view

The purpose of any garbage collector is to present the illusion that there is an infinite amount of memory available to the program.

You may disagree with this statement, but this is the base assumption of how garbage collector designers work.

A stop the world, mark sweep GC is the most efficient in terms of total run time; good for batch processing, simulation, etc. However, over time the Go GC has moved from a pure stop the world collector to a concurrent, non compacting, collector. This is because the Go GC is designed for low latency servers and interactive applications.

The design of the Go GC favors _lower_latency_ over _maximum_throughput_; it moves some of the allocation cost to the mutator to reduce the cost of cleanup later.

### 6.2\. Garbage collector design

The design of the Go GC has changed over the years

-   Go 1.0, stop the world mark sweep collector based heavily on tcmalloc.

-   Go 1.3, fully precise collector, wouldn’t mistake big numbers on the heap for pointers, thus leaking memory.

-   Go 1.5, new GC design, focusing on _latency_ over _throughput_.

-   Go 1.6, GC improvements, handling larger heaps with lower latency.

-   Go 1.7, small GC improvements, mainly refactoring.

-   Go 1.8, further work to reduce STW times, now down to the 100 microsecond range.

-   Go 1.10+, [move away from pure cooprerative goroutine scheduling](https://github.com/golang/proposal/blob/master/design/24543-non-cooperative-preemption.md) to lower the latency when triggering a full GC cycle.

### 6.3\. Garbage collector monitoring

A simple way to obtain a general idea of how hard the garbage collector is working is to enable the output of GC logging.

These stats are always collected, but normally suppressed, you can enable their display by setting the `GODEBUG` environment variable.

```
% env GODEBUG=gctrace=1 godoc -http=:8080
gc 1 @0.012s 2%: 0.026+0.39+0.10 ms clock, 0.21+0.88/0.52/0+0.84 ms cpu, 4->4->0 MB, 5 MB goal, 8 P
gc 2 @0.016s 3%: 0.038+0.41+0.042 ms clock, 0.30+1.2/0.59/0+0.33 ms cpu, 4->4->1 MB, 5 MB goal, 8 P
gc 3 @0.020s 4%: 0.054+0.56+0.054 ms clock, 0.43+1.0/0.59/0+0.43 ms cpu, 4->4->1 MB, 5 MB goal, 8 P
gc 4 @0.025s 4%: 0.043+0.52+0.058 ms clock, 0.34+1.3/0.64/0+0.46 ms cpu, 4->4->1 MB, 5 MB goal, 8 P
gc 5 @0.029s 5%: 0.058+0.64+0.053 ms clock, 0.46+1.3/0.89/0+0.42 ms cpu, 4->4->1 MB, 5 MB goal, 8 P
gc 6 @0.034s 5%: 0.062+0.42+0.050 ms clock, 0.50+1.2/0.63/0+0.40 ms cpu, 4->4->1 MB, 5 MB goal, 8 P
gc 7 @0.038s 6%: 0.057+0.47+0.046 ms clock, 0.46+1.2/0.67/0+0.37 ms cpu, 4->4->1 MB, 5 MB goal, 8 P
gc 8 @0.041s 6%: 0.049+0.42+0.057 ms clock, 0.39+1.1/0.57/0+0.46 ms cpu, 4->4->1 MB, 5 MB goal, 8 P
gc 9 @0.045s 6%: 0.047+0.38+0.042 ms clock, 0.37+0.94/0.61/0+0.33 ms cpu, 4->4->1 MB, 5 MB goal, 8 P
```

The trace output gives a general measure of GC activity. The output format of `gctrace=1` is described in [the `runtime` package documentation](https://golang.org/pkg/runtime/#hdr-Environment_Variables).

DEMO: Show `godoc` with `GODEBUG=gctrace=1` enabled

| | Use this env var in production, it has no performance impact. |

Using `GODEBUG=gctrace=1` is good when you _know_ there is a problem, but for general telemetry on your Go application I recommend the `net/http/pprof` interface.

```
import _ "net/http/pprof"
```

Importing the `net/http/pprof` package will register a handler at `/debug/pprof` with various runtime metrics, including:

-   A list of all the running goroutines, `/debug/pprof/heap?debug=1`.

-   A report on the memory allocation statistics, `/debug/pprof/heap?debug=1`.

| |

`net/http/pprof` will register itself with your default `http.ServeMux`.

Be careful as this will be visible if you use `http.ListenAndServe(address, nil)`.

|

DEMO: `godoc -http=:8080`, show `/debug/pprof`.

#### 6.3.1\. Garbage collector tuning

The Go runtime provides one environment variable to tune the GC, `GOGC`.

The formula for GOGC is

```mathjax
\$goal = reachabl\e * (1 + (GOGC)/100)\$
```

For example, if we currently have a 256MB heap, and `GOGC=100` (the default), when the heap fills up it will grow to

```mathjax
\$512MB = 256MB * (1 + 100/100)\$
```

-   Values of `GOGC` greater than 100 causes the heap to grow faster, reducing the pressure on the GC.

-   Values of `GOGC` less than 100 cause the heap to grow slowly, increasing the pressure on the GC.

The default value of 100 is _just_a_guide_. you should choose your own value _after profiling your application with production loads_.

### 6.4\. Reducing allocations

Make sure your APIs allow the caller to reduce the amount of garbage generated.

Consider these two Read methods

```
func (r *Reader) Read() ([]byte, error)
func (r *Reader) Read(buf []byte) (int, error)
```

The first Read method takes no arguments and returns some data as a `[]byte`. The second takes a `[]byte` buffer and returns the amount of bytes read.

The first Read method will _always_ allocate a buffer, putting pressure on the GC. The second fills the buffer it was given.

Can you name examples in the std lib which follow this pattern?

### [6.5\. strings and []bytes](#strings_and_bytes)

In Go `string` values are immutable, `[]byte` are mutable.

Most programs prefer to work `string`, but most IO is done with `[]byte`.

Avoid `[]byte` to string conversions wherever possible, this normally means picking one representation, either a `string` or a `[]byte` for a value. Often this will be `[]byte` if you read the data from the network or disk.

The [`bytes`](https://golang.org/pkg/bytes/) package contains many of the same operations — `Split`, `Compare`, `HasPrefix`, `Trim`, etc — as the [`strings`](https://golang.org/pkg/strings/) package.

Under the hood `strings` uses same assembly primitives as the `bytes` package.

### [6.6\. Using `[]byte` as a map key](#using_byte_as_a_map_key)

It is very common to use a `string` as a map key, but often you have a `[]byte`.

The compiler implements a specific optimisation for this case

```
var m map[string]string
v, ok := m[string(bytes)]
```

This will avoid the conversion of the byte slice to a string for the map lookup. This is very specific, it won’t work if you do something like

```
key := string(bytes)
val, ok := m[key]
```

Let’s see if this is still true. Write a benchmark comparing these two methods of using a `[]byte` as a `string` map key.

### 6.7\. Avoid string concatenation

Go strings are immutable. Concatenating two strings generates a third. Which of the following is fastest?

```
		s := request.ID
		s += " " + client.Addr().String()
		s += " " + time.Now().String()
		r = s
```

```
		var b bytes.Buffer
		fmt.Fprintf(&b, "%s %v %v", request.ID, client.Addr(), time.Now())
		r = b.String()
```

```
		r = fmt.Sprintf("%s %v %v", request.ID, client.Addr(), time.Now())
```

```
		b := make([]byte, 0, 40)
		b = append(b, request.ID...)
		b = append(b, ' ')
		b = append(b, client.Addr().String()...)
		b = append(b, ' ')
		b = time.Now().AppendFormat(b, "2006-01-02 15:04:05.999999999 -0700 MST")
		r = string(b)
```

```
		var b strings.Builder
		b.WriteString(request.ID)
		b.WriteString(" ")
		b.WriteString(client.Addr().String())
		b.WriteString(" ")
		b.WriteString(time.Now().String())
		r = b.String()
```

DEMO: `go test -bench=. ./examples/concat`

### 6.8\. Preallocate slices if the length is known

Append is convenient, but wasteful.

Slices grow by doubling up to 1024 elements, then by approximately 25% after that. What is the capacity of `b` after we append one more item to it?

```
func main() {
	b := make([]int, 1024)
	b = append(b, 99)
	fmt.Println("len:", len(b), "cap:", cap(b))
}
```

If you use the append pattern you could be copying a lot of data and creating a lot of garbage.

If know know the length of the slice beforehand, then pre-allocate the target to avoid copying and to make sure the target is exactly the right size.

Before

```
var s []string
for _, v := range fn() {
        s = append(s, v)
}
return s
```

After

```
vals := fn()
s := make([]string, len(vals))
for i, v := range vals {
        s[i] = v
}
return s
```

### 6.9\. Using sync.Pool

The `sync` package comes with a `sync.Pool` type which is used to reuse common objects.

`sync.Pool` has no fixed size or maximum capacity. You add to it and take from it until a GC happens, then it is emptied unconditionally. This is [by design](https://groups.google.com/forum/#!searchin/golang-dev/gc-aware/golang-dev/kJ_R6vYVYHU/LjoGriFTYxMJ):

> If before garbage collection is too early and after garbage collection too late, then the right time to drain the pool must be during garbage collection. That is, the semantics of the Pool type must be that it drains at each garbage collection. — Russ Cox

sync.Pool in action

```
var pool = sync.Pool{New: func() interface{} { return make([]byte, 4096) }}

func fn() {
	buf := pool.Get().([]byte) // takes from pool or calls New
	// do work
	pool.Put(buf) // returns buf to the pool
}
```

| |

`sync.Pool` is not a cache. It can and will be emptied _at_any_time_.

Do not place important items in a `sync.Pool`, they will be discarded.

|

| |

The design of sync.Pool emptying itself on each GC may change in Go 1.13 which will help improve its utility.

> This CL fixes this by introducing a victim cache mechanism. Instead of clearing Pools, the victim cache is dropped and the primary cache is moved to the victim cache. As a result, in steady-state, there are (roughly) no new allocations, but if Pool usage drops, objects will still be collected within two GCs (as opposed to one). — Austin Clements

[https://go-review.googlesource.com/c/go/+/166961/](https://go-review.googlesource.com/c/go/+/166961/)

|

### 6.10\. Exercises

-   Using `godoc` (or another program) observe the results of changing `GOGC` using `GODEBUG=gctrace=1`.

-   Benchmark byte’s string(byte) map keys

-   Benchmark allocs from different concat strategies.

## [](#tips-and-tricks)[7\. Tips and trips](#tips-and-tricks)

A random grab back of tips and suggestions

This final section contains a number of tips to micro optimise Go code.

### 7.1\. Goroutines

The key feature of Go that makes it a great fit for modern hardware are goroutines.

Goroutines are so easy to use, and so cheap to create, you could think of them as _almost_ free.

The Go runtime has been written for programs with tens of thousands of goroutines as the norm, hundreds of thousands are not unexpected.

However, each goroutine does consume a minimum amount of memory for the goroutine’s stack which is currently at least 2k.

2048 \* 1,000,000 goroutines == 2GB of memory, and they haven’t done anything yet.

Maybe this is a lot, maybe it isn’t given the other usages of your application.

#### 7.1.1\. Know when to stop a goroutine

Goroutines are cheap to start and cheap to run, but they do have a finite cost in terms of memory footprint; you cannot create an infinite number of them.

Every time you use the `go` keyword in your program to launch a goroutine, you must **know** how, and when, that goroutine will exit.

In your design, some goroutines may run until the program exits. These goroutines are rare enough to not become an exception to the rule.

If you don’t know the answer, that’s a potential memory leak as the goroutine will pin its stack’s memory on the heap, as well as any heap allocated variables reachable from the stack.

| | Never start a goroutine without knowing how it will stop. |

#### 7.1.2\. Further reading

-   [Concurrency Made Easy](https://www.youtube.com/watch?v=yKQOunhhf4A&index=16&list=PLq2Nv-Sh8EbZEjZdPLaQt1qh_ohZFMDj8) (video)

-   [Concurrency Made Easy](https://dave.cheney.net/paste/concurrency-made-easy.pdf) (slides)

-   [Never start a goroutine without knowning when it will stop](https://dave.cheney.net/practical-go/presentations/qcon-china.html#_never_start_a_goroutine_without_knowning_when_it_will_stop) (Practical Go, QCon Shanghai 2018)

### 7.2\. Go uses efficient network polling for some requests

The Go runtime handles network IO using an efficient operating system polling mechanism (kqueue, epoll, windows IOCP, etc). Many waiting goroutines will be serviced by a single operating system thread.

However, for local file IO, Go does not implement any IO polling. Each operation on a `*os.File` consumes one operating system thread while in progress.

Heavy use of local file IO can cause your program to spawn hundreds or thousands of threads; possibly more than your operating system allows.

Your disk subsystem does not expect to be able to handle hundreds or thousands of concurrent IO requests.

| |

To limit the amount of concurrent blocking IO, use a pool of worker goroutines, or a buffered channel as a semaphore.

```
var semaphore = make(chan struct{}, 10)

func processRequest(work *Work) {
	semaphore <- struct{}{} // acquire semaphore
	// process request
	<-semaphore // release semaphore
}
```

|

### 7.3\. Watch out for IO multipliers in your application

If you’re writing a server process, its primary job is to multiplex clients connected over the network, and data stored in your application.

Most server programs take a request, do some processing, then return a result. This sounds simple, but depending on the result it can let the client consume a large (possibly unbounded) amount of resources on your server. Here are some things to pay attention to:

-   The amount of IO requests per incoming request; how many IO events does a single client request generate? It might be on average 1, or possibly less than one if many requests are served out of a cache.

-   The amount of reads required to service a query; is it fixed, N+1, or linear (reading the whole table to generate the last page of results).

If memory is slow, relatively speaking, then IO is so slow that you should avoid doing it at all costs. Most importantly avoid doing IO in the context of a request—don’t make the user wait for your disk subsystem to write to disk, or even read.

### 7.4\. Use streaming IO interfaces

Where-ever possible avoid reading data into a `[]byte` and passing it around.

Depending on the request you may end up reading megabytes (or more!) of data into memory. This places huge pressure on the GC, which will increase the average latency of your application.

Instead use `io.Reader` and `io.Writer` to construct processing pipelines to cap the amount of memory in use per request.

For efficiency, consider implementing `io.ReaderFrom` / `io.WriterTo` if you use a lot of `io.Copy`. These interface are more efficient and avoid copying memory into a temporary buffer.

### 7.5\. Timeouts, timeouts, timeouts {#timeouts_timeouts_timeouts}

Never start an IO operating without knowing the maximum time it will take.

You need to set a timeout on every network request you make with `SetDeadline`, `SetReadDeadline`, `SetWriteDeadline`.

### 7.6\. Defer is expensive, or is it? {#defer_is_expensive_or_is_it}

`defer` is expensive because it has to record a closure for defer’s arguments.

```
defer mu.Unlock()
```

is equivalent to

```
defer func() {
        mu.Unlock()
}()
```

`defer` is expensive if the work being done is small, the classic example is `defer` ing a mutex unlock around a struct variable or map lookup. You may choose to avoid `defer` in those situations.

This is a case where readability and maintenance is sacrificed for a performance win.

Always revisit these decisions.

### 7.7\. Avoid Finalisers

Finalisation is a technique to attach behaviour to an object which is just about to be garbage collected.

Thus, finalisation is non deterministic.

For a finaliser to run, the object must not be reachable by _anything_. If you accidentally keep a reference to the object in the map, it won’t be finalised.

Finalisers run as part of the gc cycle, which means it is unpredictable when they will run and puts them at odds with the goal of reducing gc operation.

A finaliser may not run for a long time if you have a large heap and have tuned your appliation to create minimal garbage.

### 7.8\. Minimise cgo

cgo allows Go programs to call into C libraries.

C code and Go code live in two different universes, cgo traverses the boundary between them.

This transition is not free and depending on where it exists in your code, the cost could be substantial.

cgo calls are similar to blocking IO, they consume a thread during operation.

Do not call out to C code in the middle of a tight loop.

#### 7.8.1\. Actually, maybe avoid cgo {#actually_maybe_avoid_cgo}

cgo has a high overhead.

For best performance I recommend avoiding cgo in your applications.

-   If the C code takes a long time, cgo overhead is not as important.

-   If you’re using cgo to call a very short C function, where the overhead is the most noticeable, rewrite that code in Go — by definition it’s short.

-   If you’re using a large piece of expensive C code is called in a tight loop, why are you using Go?

Is there anyone who’s using cgo to call expensive C code frequently?

##### Further reading

-   [cgo is not Go](http://dave.cheney.net/2016/01/18/cgo-is-not-go)

### 7.9\. Always use the latest released version of Go

Old versions of Go will never get better. They will never get bug fixes or optimisations.

-   Go 1.4 should not be used.

-   Go 1.5 and 1.6 had a slower compiler, but it produces faster code, and has a faster GC.

-   Go 1.7 delivered roughly a 30% improvement in compilation speed over 1.6, a 2x improvement in linking speed (better than any previous version of Go).

-   Go 1.8 will deliver a smaller improvement in compilation speed (at this point), but a significant improvement in code quality for non Intel architectures.

-   Go 1.9-1.12 continue to improve the performance of generated code, fix bugs, and improve inlining and improve debuging.

| | Old version of Go receive no updates. **Do not use them**. Use the latest and you will get the best performance. |

#### 7.9.1\. Further reading

-   [Go 1.7 toolchain improvements](http://dave.cheney.net/2016/04/02/go-1-7-toolchain-improvements)

-   [Go 1.8 performance improvements](http://dave.cheney.net/2016/09/18/go-1-8-performance-improvements-one-month-in)

#### 7.9.2\. Move hot fields to the top of the struct

### 7.10\. Discussion

Any questions?

## Final Questions and Conclusion

> Readable means reliable — Rob Pike

Start with the simplest possible code.

_Measure_. Profile your code to identify the bottlenecks, _do not guess_.

If performance is good, _stop_. You don’t need to optimise everything, only the hottest parts of your code.

As your application grows, or your traffic pattern evolves, the performance hot spots will change.

Don’t leave complex code that is not performance critical, rewrite it with simpler operations if the bottleneck moves elsewhere.

Always write the simplest code you can, the compiler is optimised for _normal_ code.

Shorter code is faster code; Go is not C++, do not expect the compiler to unravel complicated abstractions.

Shorter code is _smaller_ code; which is important for the CPU’s cache.

Pay very close attention to allocations, avoid unnecessary allocation where possible.

> I can make things very fast if they don’t have to be correct. — Russ Cox

Performance and reliability are equally important.

I see little value in making a very fast server that panics, deadlocks or OOMs on a regular basis.

Don’t trade performance for reliability.

<div id="footnotes">
<hr/>
<div id="_footnotedef_1">

[1](#_footnoteref_1). Hennessy et al: 1.4x annual performance improvment over 40 years.

</div>
</div>
