---
title: (翻译)size classes 的应用
date: 2021-02-06T00:32:00Z
tags:
  - go
  - performance
  - translate
lastmod: 2021-02-06T04:29:00Z
categories:
  - go
  - translate
slug: a-few-bytes-here-a-few-there
draft: false
---

> [原文地址](https://dave.cheney.net/2021/01/05/a-few-bytes-here-a-few-there-pretty-soon-youre-talking-real-memory)


今天文章来自一个最近流行的测试，思考一下这个基准测试代码片段。<sup id="easy-footnote-ref-1-4231" class="footnote">[1](#easy-footnote-bottom-1-4231)</sup>
```go
func BenchmarkSortStrings(b *testing.B) {
    s := []string{"heart", "lungs", "brain", "kidneys", "pancreas"}
    b.ReportAllocs()
    for i := 0; i < b.N; i++ {
        sort.Strings(s)
    }
}
```

我们经常会使用 `sort.Sort(sort.StringSlice(s))` 和 `sort.Strings` 来包装输入进行了排序，我们希望这个包装不要进行分配新的内存(至少 43% 的 Go 爱好者是这么认为的)。但在最新的 Go 版本中，每一次的迭代都会发生一次栈分配。这是为什么呢？

接口，所有 Go 程序员都应该知道，实现为[两个字段的结构](https://research.swtch.com/interfaces)。每个接口值都包含一个用于保存接口类型的字段，以及一个指向接口的指针。<sup id="easy-footnote-ref-2-4231" class="footnote">[2](#easy-footnote-bottom-2-4231)</sup>

在伪 Go 代码中，接口可能看起来像这样：

```go
type interface struct {
    // the ordinal number for the type of the value
    // assigned to the interface
    type uintptr

    // (usually) a pointer to the value assigned to
    // the interface
    data uintptr
}
```

`interface.data` 可以容纳一个 8 字节(当前机器和编译器为 x64)在大多数情况下，但一个 `[]string` 是 24字节；指向切片基础数组的指针的一个字段；一个字段用于存放长度(len)；还有一个用于存储数组的剩余容量(cap)， 那么 Go 如何将 24 个字节的数据放入 8 个字节进行存放的呢？老把戏，间接引用。`s`，`[]string` 为 24 字节，但指向 `*[]string` 的指针只有 8 个字节。

栈逃逸到堆
--------------------

为了使示例更明确，下面的代码是没有使用 `sort.Strings` 帮助方法的情况下重写的基准测试：

```go
func BenchmarkSortStrings(b *testing.B) {
    s := []string{"heart", "lungs", "brain", "kidneys", "pancreas"}
    b.ReportAllocs()
    for i := 0; i < b.N; i++ {
        var ss sort.StringSlice = s
        var si sort.Interface = ss // 内存分配
        sort.Sort(si)
    }
}
```

为了让接口魔术能够正常工作编译器为我们自动重写为 `var si sort.Interface = &ss`，`ss` 的地址值分配给接口。<sup id="easy-footnote-ref-3-4231" class="footnote">[3](#easy-footnote-bottom-3-4231)</sup> 我们现在的情况是，接口值包含了指向 `ss` 的指针，但它指向哪里？`ss` 在内存中的哪一部分存活？

通过基准报告可以看到 `ss` 被移动到了堆内存中。

```bash
Total:  296.01MB  296.01MB (flat, cum) 99.66%
  8            .     func BenchmarkSortStrings(b *testing.B) {
  9            .            s := []string{"heart", "lungs", "brain", "kidneys", "pancreas"}
  10           .            b.ReportAllocs()
  11           .            for i := 0; i < b.N; i++ {
  12           .                var ss sort.StringSlice = s
  13    296.01MB  296.01MB      var si sort.Interface = ss // 内存分配
  14           .                sort.Sort(si)
  15           .            }
  16           .     }
```

发生分配是因为编译器当前无法检测出 `ss` 比 `si` 有更长的生命周期。Go 编译器讨论者的态度是可以对此进行改进，但这是又一次讨论。就目前而言，`ss` 会发生逃逸到堆上。因此，问题就变成了，每个迭代分配多少个字节？我们为什么不问 `testing` 包。

```bash
% go test -bench=. sort_test.go
goos: darwin
goarch: amd64
cpu: Intel(R) Core(TM) i7-5650U CPU @ 2.20GHz
BenchmarkSortStrings-4          12591951                91.36 ns/op           24 B/op          1 allocs/op
PASS
ok      command-line-arguments  1.260s
```

使用 Go 1.16beta1 amd64，每个操作分配 24 个字节。<sup id="easy-footnote-ref-4-4231" class="footnote">[4](#easy-footnote-bottom-4-4231)</sup>但是，在同一平台上的以前的 Go 版本每个操作消耗 32 个字节

```bash
% go1.15 test -bench=. sort_test.go
goos: darwin
goarch: amd64
BenchmarkSortStrings-4          11453016                96.4 ns/op            32 B/op          1 allocs/op
PASS
ok      command-line-arguments  1.225s
```
这给我们带来了不少曲折，也是这篇文章的主题，已经有一个对于该问题修复将在 Go 1.16 放出。但在我讨论这个问题之前，我需要先讨论 size classes。

Size classes
------------

若要解释 size class 是什么，请考虑 Go 运行时如何在其堆上分配 24 个字节。实现此任务的简单方法是使用指向堆上最后一个分配的字节的指针跟踪到目前为止分配的所有内存。要分配 24 个字节，堆指针递增 24 个，然后将上一个值返回给调用方。只要要求 24 个字节的代码从未写入超过该标记此机制没有开销。可悲的是，在现实生活中，内存分配器不只是分配内存，有时他们必须释放它。

最终，Go 运行时必须释放这 24 个字节，但从运行时的角度来看，它唯一知道的就是它给调用方的起始地址。它不知道该地址分配后有多少字节。为了允许释放，我们假设的 Go 运行时分配器必须记录堆上每个分配的长度。这些长度的分配在哪里分配？当然在堆上。

在我们的方案中，当运行时想要分配内存时，它可以请求比请求多一点，并用它来存储请求的数量。对于切片示例，当我们要求 24 个字节时，我们实际上需要消耗 24 个字节加上一些开销来存储数字 24。这个开销是多少？原来最实际的最小量是一个字。<sup id="easy-footnote-ref-5-4231" class="footnote">[5](#easy-footnote-bottom-5-4231)</sup>

要记录 24 字节的分配，开销为 8 字节。25% 不是很大，但并不可怕，而且随着分配规模的增加，开销将变得微不足道。但是，如果我们想要在堆上只存储一个 `byte`，会发生什么？开销将是我们要求的数据量的八倍！是否有更有效的方法来在堆上分配更少的消耗？

与其我们长度不同的数据进行分配存储，不如将相同的大小的数据一起存储吗？如果所有 24 字节的内容都存储在一起，那么 runtime 自动知道它们的大小。runtime 只需要一个字节以指示是否在使用 24 字节的内存区域。在 Go 中，这些区域称为 size classes 因为所有大小相同的数据都存储在一起（想想学校的班级，所有的学生都是同一年级，而不是像 C++ 的分类）。当 runtime 需要分配少量资源时，它将使用可容纳分配的最小 size classes 来进行分配。

无限的 size classes
------------------------------

现在我们知道 size classes 是如何工作的，显而易见的问题是，它们存储在哪里？理所当然，size classes 存储在堆上。为了最大程度减少开销，runtime 从堆中分配更大的数量（通常是系统页面大小的倍数），然后将该空间分配给单个大小的分配。但是，有一个问题。

如果有固定的分配大小，则分配大面积存储相同的数据的模型会很好<sup id="easy-footnote-ref-6-4231" class="footnote">[6](#easy-footnote-bottom-6-4231)</sup>，最好是较小的，但是在通用语言中，程序可以向 runtime 请求任何大小的分配。<sup id="easy-footnote-ref-7-4231" class="footnote">[7](#easy-footnote-bottom-7-4231)</sup>

例如，假设向 runtime 请求 9 个字节。9 字节大小不常见，因此可能需要为大小为 9 字节设置一个新的 size classes。由于 9 个字节大小并不常见，所以分配的其余部分（ 4kb 或更多） 可能会被浪费。因此，可能 size classes 的集是固定的。如果精确的 size classes 不可用，则分配将向上舍入到下一个 size classes。在我们的示例中，9 字节可能在 12 字节 size classes 中分配。3 个未使用的字节的开销优于大部分未使用的整个 size classes 分配。

现在我们就能够知道
----------------

这是谜题的最后一块。Go 1.15 没有 24 字节 size classes，因此在 32 字节大小类中分配了 `ss` 的堆分配。由于 Martin Mührmann Go 1.16 的工作，它有一个 24 字节大小类，非常适合分配给接口的切片值。

---
<ol id="footnotes">
<li id="easy-footnote-bottom-1-4231">
这不是对排序函数进行基准测试的正确方法，因为在第一次迭代之后，对输入已经排序。但是这个已经超过了本篇文章的范围了
</li>
<li id="easy-footnote-bottom-2-4231">
此语句的准确性取决于正在使用的 Go 版本。例如，Go 1.15 添加了直接在<a href="https://golang.org/doc/go1.15#runtime">接口值中存储某些整数的能力</a>，从而节省了分配和间接。但是，对于大多数值，如果该值不是指针类型，则其地址将取用并存储在接口值中。
</li>
<li id="easy-footnote-bottom-3-4231">
编译器使用接口值的类型字段来跟踪此操作，以便它记住分配给 <code>si</code> 是 <code>sort.StringSlice</code>，而不是 <code>*sort.StringSlice</code>
</li>
<li id="easy-footnote-bottom-4-4231">
在 32 位平台上，这个数字减半，<a href="https://www.tallengestore.com/products/i-never-look-back-darling-it-distracts-from-the-now-edna-mode-inspirational-quote-tallenge-motivational-poster-collection-large-art-prints">但是我们从不回头</a>
</li>
<li id="easy-footnote-bottom-5-4231">
如果您准备将分配限制为 4G，或者 64kb，您可以使用较少的内存来存储分配的大小，但这意味着分配的第一个单词不是自然对齐的，因此在实践中，使用少于一个单词来存储长度标头的节省会因填充而破坏。
</li>
<li id="easy-footnote-bottom-6-4231">
将相同大小的东西存放在一起也是对抗碎片的有效策略。
</li>
<li id="easy-footnote-bottom-7-4231">
这不是一个牵强的方案，字符串有各种形状和大小，并且生成以前从未见过的大小字符串可以像追加空格一样简单。
</li>
</ol>

### 参考文章:

1. [I’m talking about Go at DevFest Siberia 2017](https://dave.cheney.net/2017/08/23/im-talking-about-go-at-devfest-siberia-2017)
2. [If aligned memory writes are atomic, why do we need the sync/atomic package?](https://dave.cheney.net/2018/01/06/if-aligned-memory-writes-are-atomic-why-do-we-need-the-sync-atomic-package)
3. [A real serial console for your Raspberry Pi](https://dave.cheney.net/2014/01/05/a-real-serial-console-for-your-raspberry-pi)
4. [Why is a Goroutine’s stack infinite ?](https://dave.cheney.net/2013/06/02/why-is-a-goroutines-stack-infinite)
