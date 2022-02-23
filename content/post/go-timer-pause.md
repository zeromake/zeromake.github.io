---
title: go 的定时器暂停与恢复
date: 2022-01-11T04:01:00Z
tags:
  - go
  - timer
lastmod: 2022-01-11T04:01:00Z
categories:
  - go
slug: go-timer-pause
draft: false
---

## 前言

最近在工作中遇到游戏里经常有延时逻辑，需要延迟多少秒后给客户端发送消息让客户端进行动画与逻辑，在这个基础上，来了一个加需求，用户在这些过程中打开了弹窗，希望暂停动画与逻辑，而在这里就碰上了一些对定时器的优化与实践。


## 一、time.Timer 和 time.Sleep 的优缺点。


|特性|time.Timer|time.Sleep|
|:---:|:----------:|:-----------:|
| 不阻塞调度   | yes | yes |
| 不阻塞逻辑   | yes | no  |
| 可中断      | yes | no  |
| 中断后可恢复 | yes | no  |

我这边的服务端的延时逻辑几乎都是 `time.Sleep` 坏处是无法中断也就是上面说到的问题，是无法满足的，所以全部都得改造为 `time.Timer`。

## 二、time.Timer 和 time.Ticker 的优缺点。


`time.Timer` 和 `time.Ticker` 暴露的方法几乎相同 `Stop`，`Reset`，连参数也一样，但是返回是不一样的，`time.Timer` 比 `time.Ticker` 多了一个 `bool` 的返回值，可以参考 [Timer 的 api 文档](https://pkg.go.dev/time#NewTimer)，由于 `time.Timer` 比 `time.Ticker` 的可操作性更高，例如多个延迟操作的延迟时间不同，延迟时间需要加上逻辑操作时间，这里打算使用 `time.Timer`。




## 三、time.Timer 的一些特性应用。

`time.Timer.C` 是一个 `chan time.Time` 而且在 `Stop` 时不会关闭，所以在 `<-time.Timer.C` 的地方如果 `Stop` 了就会阻塞住。

如果需要中断这个阻塞的 `chan` 的可以：

```go
ctx, cancel := context.WithCancel(context.Background())
timer := time.NewTimer(time.Minute)
timer.Stop()
select {
    // 把上面的 cancel 保存起来可以在其它协程里中断阻塞的定时器
    case <-ctx.Done():
    // 这里会无限阻塞
    case <-timer.C:
}
```

## 四、使用 time.Timer 做游戏消息推送的暂停与恢复。

```go
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/atomic"
)

type Context struct {
	c        context.Context
	timer    *time.Timer
	state    *atomic.Bool
	duration *atomic.Duration
}

func (c *Context) Context() context.Context {
	return c.c
}

func (c *Context) Reset(duration time.Duration) {
	if c.state.Load() {
        // 没有中断到这次的定时器，存好 duration 恢复时使用
		log.Println("pause reset")
		c.duration.Store(duration)
		return
	}
	c.duration.Store(duration)
	c.timer.Reset(duration)
}

func (c *Context) TimerC() <-chan time.Time {
	return c.timer.C
}

func (c *Context) Pause() bool {
	if c.state.Load() {
		return true
	}
	c.state.Store(true)
	ok := c.timer.Stop()
	return ok
}

func (c *Context) Resume() bool {
	if !c.state.Load() {
		return true
	}
	c.state.Store(false)
	duration := c.duration.Load()
	if duration <= 0 {
		duration = time.Second
	} else {
		c.duration.Store(0)
	}
	return !c.timer.Reset(duration)
}

func initSignal(cancel func()) {
	var gracefulStop = make(chan os.Signal, 1)
	signal.Notify(gracefulStop, syscall.SIGINT, syscall.SIGTERM)
	<-gracefulStop
	cancel()
}

func remote(c *Context) {
	timer := time.NewTimer(time.Minute)
	timer.Stop()
	// 5 秒后暂停
	timer.Reset(time.Second * 5)
	<-timer.C
	// 有概率会让这次定时器发出，Pause 返回是 false(需要在 Pause 调用时定时器刚好触发了这个时候 Timer 已经是 Stop 了)
    // Todo pause 为 false 可以保存定时器还有多久触发
	log.Println("pause", c.Pause())

	// 5 秒后恢复
	timer.Reset(time.Second * 5)
	<-timer.C
	log.Println("resume", c.Resume())
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	go initSignal(cancel)
	timer := time.NewTimer(time.Minute)
	timer.Stop()
	c := &Context{
		c:        ctx,
		timer:    timer,
		state:    atomic.NewBool(false),
		duration: atomic.NewDuration(0),
	}
	// 启动接口操作协程
	go remote(c)
	// 动画逻辑协程
	i := 0
	for {
		// 动画逻辑推送
		log.Println("timer trigger", i)
        // 下一次操作延迟 1s
		c.Reset(time.Second)
		select {
		case <-c.TimerC():
		case <-c.Context().Done():
			log.Println("cancel")
			return
		}
		i++
	}
}
```

正常的输出(中断了当前的定时)：

``` bash
2022/02/23 21:37:21 timer trigger 0
2022/02/23 21:37:22 timer trigger 1
2022/02/23 21:37:23 timer trigger 2
2022/02/23 21:37:24 timer trigger 3
2022/02/23 21:37:25 timer trigger 4
2022/02/23 21:37:26 pause true
2022/02/23 21:37:31 resume true
2022/02/23 21:37:32 timer trigger 5
2022/02/23 21:37:33 timer trigger 6
2022/02/23 21:37:34 timer trigger 7
2022/02/23 21:37:35 timer trigger 8
2022/02/23 21:37:35 cancel
```

pause 时定时器已经触发的输出(可以中断到下一次的定时)：

```bash
2022/02/23 21:37:21 timer trigger 0
2022/02/23 21:37:22 timer trigger 1
2022/02/23 21:37:23 timer trigger 2
2022/02/23 21:37:24 timer trigger 3
2022/02/23 21:37:25 timer trigger 4
2022/02/23 21:37:26 timer trigger 5
2022/02/23 21:37:26 pause reset
2022/02/23 21:37:26 pause false
2022/02/23 21:37:31 resume true
2022/02/23 21:37:32 timer trigger 6
2022/02/23 21:37:33 timer trigger 7
2022/02/23 21:37:34 timer trigger 8
2022/02/23 21:37:34 cancel
```

## 五、第三方时间轮性能测试

官方的 `time.Timer` 的调用时间复杂度在 `O(n)`(go version 1.13 的实现，现在已经秒了一大把第三方时间轮了)，开源实现的时间轮有不少据说实现了 `O(1)` 的操作，光看  [benchmark](https://github.com/junelabs/timer-benchmark):

```bash
goos: windows
goarch: amd64
pkg: benchmark
cpu: AMD Ryzen 7 5800H with Radeon Graphics
Benchmark_antlabs_Timer_AddTimer/N-1m-16                        22906782                52.12 ns/op           80 B/op           1 allocs/op
Benchmark_antlabs_Timer_AddTimer/N-5m-16                        18305853                55.97 ns/op           80 B/op           1 allocs/op
Benchmark_antlabs_Timer_AddTimer/N-10m-16                       18336511                65.23 ns/op           80 B/op           1 allocs/op
Benchmark_Stdlib_AddTimer/N-1m-16                               13629424                98.18 ns/op           81 B/op           1 allocs/op
Benchmark_Stdlib_AddTimer/N-5m-16                               11696430                106.2 ns/op           80 B/op           1 allocs/op
Benchmark_Stdlib_AddTimer/N-10m-16                              11812616                102.5 ns/op           80 B/op           1 allocs/op
Benchmark_RussellLuo_Timingwheel_AddTimer/N-1m-16               12775375                99.33 ns/op           80 B/op           2 allocs/op
Benchmark_RussellLuo_Timingwheel_AddTimer/N-5m-16               12546171                101.0 ns/op           80 B/op           2 allocs/op
Benchmark_RussellLuo_Timingwheel_AddTimer/N-10m-16              12651661                101.8 ns/op           80 B/op           2 allocs/op
Benchmark_ouqiang_Timewheel/N-1m-16                              1000000                1080 ns/op            119 B/op          4 allocs/op
Benchmark_ouqiang_Timewheel/N-5m-16                              1000000                1080 ns/op            119 B/op          4 allocs/op
Benchmark_ouqiang_Timewheel/N-10m-16                             1000000                1088 ns/op            119 B/op          4 allocs/op
PASS
ok      benchmark       71.096s
```

除了 [antlabs/timer](https://github.com/antlabs/timer) 在 `go 1.17` 都被秒了，不过测试的全部都是 `AfterFunc` 不知道走 `channel` 的效率如何。

## 六、注意事项

1. `time.Timer` 等待时一定要配合 `context.Context` 或其它中断方案，否则容易出现阻塞(要么就不共享 Timer 去中断)。
2. `time.Sleep` 的阻塞发生时通过 `pprof` 的 `goroutine` 页面可以很容易的看到，不过一般 `goroutine` 数量不多不好注意。

## 七、参考

- [层级时间轮的 Golang 实现](http://russellluo.com/2018/10/golang-implementation-of-hierarchical-timing-wheels.html)
- [使用 Golang Timer 的正确方式](http://russellluo.com/2018/09/the-correct-way-to-use-timer-in-golang.html)
- [开源时间轮](https://github.com/RussellLuo/timingwheel)
- [Go 语言原本-6.11 计时器](https://golang.design/under-the-hood/zh-cn/part2runtime/ch06sched/timer/)
- [第 74 期 time.Timer 源码分析 (Go 1.14)](https://github.com/talkgo/night/issues/541)
