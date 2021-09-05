---
title: (翻译)终极 channel
date: 2021-09-05 13:43:00 +08:00
tags:
  - go
  - channel
  - translate
lastmod: 2021-09-05 22:10:00 +08:00
categories:
  - go
  - translate
slug: ultimete-channel
draft: false
---
Author(s): [Changkun Ou](https://changkun.de)

Permalink: https://golang.design/research/ultimate-channel

最近，我一直在重新思考图形应用程序的编程模式，并且已经用 Go 编写了一个 3D 图形包,
叫 [polyred](https://poly.red)。
在我设计渲染管道 API 时，一个棘手的问题困扰了我一段时间，最终导致我创建了一个无界通道(unbounded channel)作为解决方案。

<!--more-->

## 问题

在我的设计的开始, 我必须让 [OpenGL](https://github.com/go-gl/gl)
的大部分 API 在主线程上执行，其中就包含臭名昭著的图像绘制调用。图形编程中的常见模式如下:

```go
app := newApp()
driver := initDriver()
ctx := driver.Context()

for !app.IsClosed() {
	ctx.Clear()
	processingDrawCalls(ctx)
	processingInputEvents()
}
```

整个 GUI 应用程序在无限循环中执行，该循环包含两个部分：绘制调用处理和事件处理。 

通常，所有这些代码都在 CPU 上运行，而实际的渲染计算在 GPU 上执行。这意味着，图形驱动程序（例如 OpenGL, Vulkan, Meta, Direct X）提供的图形 API 只是从 CPU 发送到 GPU 的通信命令，甚至是等待 GPU 的响应。
由于特殊原因,[polyred](https://poly.red) 仅限在软件中实现，纯 CPU 实现。因此，执行代码应该充分利用 CPU 并行化的能力。所以使用一个单独的 goroutine 上执行渲染更有意义，这样它就不会阻塞事件处理线程。

*_旁白: 为了保证应用程序的响应速度，最好不要阻塞事件处理，因为可能还有包含系统调用。_

随后，我将渲染循环变成了一个单独的 goroutine，并将渲染结果发送到事件处理循环以刷新到硬件显示器。整个应用程序的工作方式如下：

```go
// WARNING: This example contains a deadlock.
package main

import (
	"fmt"
	"math/rand"
	"time"
)

type ResizeEvent struct {
	width, height int
}

type RenderProfile struct {
	id     int
	width  int
	height int
}

// 绘制通过给定渲染配置文件执行绘图调用
func (p *RenderProfile) Draw() interface{} {
	return fmt.Sprintf("draw-%d-%dx%d", p.id, p.width, p.height)
}

func main() {
	// draw is a channel for receiving finished draw calls.
	draw := make(chan interface{})
	// change is a channel to receive notification of the change of rendering settings.
	change := make(chan ResizeEvent)

	// Rendering Thread
	//
	// Sending draw calls to the event thread in order to draw pictures.
	// The thread sends darw calls to the draw channel, using the same
	// rendering setting id. If there is a change of rendering setting,
	// the event thread notifies the rendering setting change, and here
	// increases the rendering setting id.
	go func() {
		p := &RenderProfile{id: 0, width: 800, height: 500}
		for {
			select {
			case size := <-change:
				// Modify rendering profile.
				p.id++
				p.width = size.width
				p.height = size.height
			default:
				draw <- p.Draw()
			}
		}
	}()

	// Event Thread
	//
	// Process events every 100 ms. Otherwise, process drawcall request
	// upon-avaliable.
	event := time.NewTicker(100 * time.Millisecond)
	for {
		select {
		case id := <-draw:
			println(id)
		case <-event.C:
			// Notify the rendering thread there is a change regarding
			// rendering settings. We simulate a random size at every
			// event processing loop.
			change <- ResizeEvent{
				width:  int(rand.Float64() * 100),
				height: int(rand.Float64() * 100),
			}
		}
	}
}
```

从上面的例子里模拟了事件触发，在事件循环中模拟了 GUI 的窗口调整大小事件触发，每当 GUI 窗口的大小发生变化时，底层渲染应该适应它，例如，重新分配渲染缓冲区。为了让渲染线程了解变化，使用另一个通道从事件线程到渲染线程进行通信。

这看起来是一个完美的设计，但是如果执行程序，会有一个令人讨厌的隐藏死锁，程序将被阻塞直到被手动中断：

```
draw-0-800x500
...
draw-0-800x500
draw-1-60x94
...
draw-1-60x94
^Csignal: interrupt
```

如果我们仔细研究一下程序模式：

1. 在不同的 `goroutine`（线程）上运行的两个无限 `select` 循环（比如 `E` 和 `R`）。
2. 在 `E` 线程接收从 `R` 来的消息。
3. 在 `R` 线程接收从 `E` 来的消息。

你发现了其中的问题吗？问题出现在双向通信中，如果 channel 是无缓冲 channel(必须等待到消费者接收完成)，则会出现 `E` 等待 `R` 完成接收时发生死锁，`R` 也在等待 `E` 完成接收。

也许有人会说可以使用带缓冲的 channel 来解决这个问题:

```diff
-draw := make(chan interface{})
+draw := make(chan interface{}, 100)
-change := make(chan ResizeEvent)
+change := make(chan ResizeEvent, 100)
```

然而不幸的是，该问题依旧会存在。让我们想一下：如果 `E` 触发频繁，并快速使用完 `change` 所有缓冲，然后 channel 又会退回到无缓冲 channel。然后 `E` 开始等待接受完；或者，`R` 正在处理大量的绘制调用，完成后，`R` 尝试将绘制调用发往 `E`。然而这个时候	 `E` 已经在等待 `R` 接收 `change` 消息。因此又回到了上面相同的情况 -- 死锁。

问题该场景是 producer-consumer 场景吗？实际上，这很相似，但是却又不完全相同。producer-consumer 场景侧重于为缓冲区生产内容，消费者使用该缓冲区。如果缓冲区已满，则会让生产者或者消费者进入休眠。但是这里的主要区别在于：在通信的两端，它们同时扮演着生产者和消费者的角色，并互相依赖。

我们有什么办法解决上述的死锁问题呢？本文中将介绍两种方法来解决这个问题。

## 方案 1：发送时选择非阻塞

第一种方案非常的简单。我们利用 select 语句的强大的 default 分支功能：如果有 default 语句，对于任何 channel 的操作都不会阻塞。因此我们将 Draw 的绘制调用发送语句修改为嵌套的 select 语句：

```diff
go func() {
	p := &renderProfile{id: 0, width: 800, height: 500}
	for {
		select {
		case size := <-change:
			// Modify rendering profile.
			p.id++
			p.width = size.width
			p.height = size.height
		default:
-			draw <- p.Draw()
+			select {
+			case draw <- p.Draw():
+			default:
+			}
		}
	}
}()
```
在这种情况下，如果 `draw <- p.Draw()` 发生了阻塞，新加入的 `select` 语句不会阻塞发送并走 default 语句，这样就解决了死锁问题。

但是这个方案有两个缺点：

1. 如果跳过绘制调用，渲染将丢失一帧。因为下一个循环会开始计算新的帧。
2. 事件线程会保持阻塞，直到渲染线程中的帧渲染完成。因为新的 select 语句只有在所有渲染计算完成后才能发生消息。

这两个缺点是本质上是存在的，使用这种方法，似乎没有更好的方法来改进它。我们还能做什么来改善这个方案呢？

## 方案 2: 无界 Channel

我们可能会想到这样一个想法：我们可以创建一个无限容量的缓冲通道，即无界 channel 吗？虽然从语言上直接创建这样的 channel 是不行的，但是我们可以通过代码逻辑轻松构建这样的模式：

```go
// MakeChan returns a sender and a receiver of a buffered channel
// with infinite capacity.
func MakeChan() (chan<- interface{}, <-chan interface{}) {
	in, out := make(chan interface{}), make(chan interface{})

	go func() {
		var q []interface{}
		for {
			e, ok := <-in
			if !ok {
				close(out)
				return
			}
			q = append(q, e)
			for len(q) > 0 {
				select {
				case out <- q[0]:
					q = q[1:]
				case e, ok := <-in:
					if ok {
						q = append(q, e)
						break
					}
					for _, e := range q {
						out <- e
					}
					close(out)
					return
				}
			}
		}
	}()
	return in, out
}
```
在上面的实现中，我们创建了两个无缓冲通道。为了不阻塞通信，从方法调用中创建了一个单独的 goroutine。每当有发送操作时，它都会附加到缓冲区 `q`。为了将值发送给接收者，一个嵌套的选择循环检查是否可以发送。如果没有，它会不断将数据附加到队列中`q`。

当输入通道关闭时，队列上的额外循环 `q` 用于运行所有缓存元素，然后关闭输出通道。

因此，使用无界通道解决死锁的另一个方法是：

```diff
func main() {
-	draw := make(chan interface{})
+	drawIn, drawOut := MakeChan()

	...

	// Rendering Thread
	go func() {
		...
		for {
			select {
			case size := <-change:
				...
			default:
-				draw <- p.Draw()
+				drawIn <- p.Draw()
			}
		}
	}()

	// Event Thread
	event := time.NewTicker(100 * time.Millisecond)
	for {
		select {
-		case id := <-draw:
+		case id := <-drawOut:
			println(id)
		case <-event.C:
			...
		}
	}
}
```

这个无界通道与常用的标准图形 API 模式非常相似：CommandBuffer，一个缓存一系列绘制调用的缓冲区，并批量执行一组绘制调用。

## 通用通道抽象

我们已经讨论了 select 语句中的一种死锁形式以及两种可能的解决方法。在第二种方法中，我们讨论了一种实现无界信道构建的可能方法。该实现构造了一个 `interface{}` 类型化通道。

我们可能会问自己，对于这个特定的例子，在 Go 语言中使用无界是否有意义？Go 团队有没有考虑过这种用法？

第二个问题的答案是：是的。他们的讨论可以看 [golang/go#20352](https://golang.org/issue/20352)。
讨论表明无界 channel 确实服务于某个应用程序，但明显的缺点可能会损害应用程序。主要缺点是无界通道可能会耗尽内存 (OOM)。如果存在并发错误，正在运行的应用程序将不断从操作系统中获取内存并最终导致 OOM。开发人员认为应该在语言中添加一个无界通道，主要是因为该 `MakeChan` 函数正在返回一个 `interface{}` 类型化通道，这将弱类型化缺陷带入静态类型化 Go 代码中。最终，围棋团队的 Ian Lance Taylor [澄清了](https://golang.org/issue/20352#issuecomment-365438524)无界通道可能有某种用途，但不值得添加到语言中。只要我们有泛型，就可以在库中轻松实现类型安全的无界通道，回答第一个问题。

从 Go 1.18 开始，很快我们就有了类型参数，上面的难点终于可以解决了。在这里，我提供了一个通用的通道抽象，它能够构造一个类型安全的、任意大小的通道：

```go
// MakeChan is a generic implementation that returns a sender and a
// receiver of an arbitrarily sized channel of an arbitrary type.
//
// If the given size is positive, the returned channel is a regular
// fix-sized buffered channel.
// If the given size is zero, the returned channel is an unbuffered channel.
// If the given size is -1, the returned an unbounded channel contains an
// internal buffer with infinite capacity.
func MakeChan[T any](size int) (chan<- T, <-chan T) {
	switch {
	case size == 0:
		ch := make(chan T)
		return ch, ch
	case size > 0:
		ch := make(chan T, size)
		return ch, ch
	case size != -1:
		panic("unbounded buffer size should be specified using -1")
	default:
		// size == -1
	}

	in, out := make(chan T), make(chan T)

	go func() {
		var q []T
		for {
			e, ok := <-in
			if !ok {
				close(out)
				return
			}
			q = append(q, e)
			for len(q) > 0 {
				select {
				case out <- q[0]:
					q = q[1:]
				case e, ok := <-in:
					if ok {
						q = append(q, e)
						break
					}
					for _, e := range q {
						out <- e
					}
					close(out)
					return
				}
			}
		}
	}()
	return in, out
}
```

```go
func main() {
	in, out := MakeChan[int](1)
	// Or:
	// in, out := MakeChan[int](0)
	// in, out := MakeChan[int](-1)

	go func() { in <- 42 }()
	println(<-out)
}
```

*_此代码可在 go2go playground 上执行:_ https://go2goplay.golang.org/p/krLWm7ZInnL

## Conclusion

在本文中，我们通过一个真实世界的死锁示例讨论了具有任意容量的通道的通用实现。我们可能会再问：它是完美的吗？

嗯，答案是不够完美的。作为通道的泛化，还应该支持其他常见的操作，例如 `len()`, `cap()`, 和 `close()`。如果我们仔细考虑关闭通道的语义，它实际上只是关闭输入到该通道的能力。因此，实现该 `close()` 功能是必须的。

然而，`len()` 对于数组、切片和映射来说，这不是线程安全的操作，但很明显它必须对通道是线程安全的，否则，无法以原子方式获取通道长度。尽管如此，获得通道的长度真的有意义吗？正如我们所知，通道通常用于同步目的。如果有一个 `len(ch)` 与发送/接收操作同时发生，则无法保证 `len()`。 长度在 `len()` 返回时立即过时。[language specification](https://golang.org/ref/spec)，或者 [Go's memory model](https://golang.org/ref/mem)中均未讨论此场景。毕竟，我们真的需要一个 `len()` 最终通道抽象的操作吗？答案不言自明。

## 进一步阅读建议

- Ian Lance Taylor. Type Parameters. March 19, 2021. https://golang.org/design/43651-type-parameters
- rgooch. proposal: spec: add support for unlimited capacity channels. 13 May 2017. https://golang.org/issue/20352
- The Go Authors. The Go Programming Language Specification. Feb 10, 2021. https://golang.org/ref/spec
- The Go Authors. The Go Memory Model. May 31, 2014. https://golang.org/ref/mem
