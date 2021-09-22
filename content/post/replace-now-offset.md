---
title: 替换 time.Now 为自定义函数
date: 2021-09-22T10:02:00Z
tags:
  - go
  - unsafe
  - monkey
  - patch
lastmod: 2021-09-22T10:02:00Z
categories:
  - go
  - monkey
slug: replace-now-offset
draft: false
---

## 前言

我这边业务里有大量的时间过期逻辑，也有不少定时触发的业务，这个时候这些业务完成后到了测试手里他们都有个疑问如何测试时间相关的功能，所以这里就做了各种方案去想办法替换 `time.Now`。

<!--more-->


## 一、自定义函数替换

由于 `go` 里想要获取当前时间只能用 `time.Now` 方法，这是个好事也是个坏事，好事是只需要批量替换 `time.Now` 就可以完成替换为自定义的函数，坏处是使用 [monkey](https://github.com/bouk/monkey) 库去替换后就没办法调用原来的函数了，所以这里就只是声明了一个自定义的函数来替换自己代码里的时间调用。

```go
package customization

import (
	"time"
)

var Time CustomizationTime = &customizationTime{
	loc: time.Local,
}

type CustomizationTime interface {
	// Location 返回时区
	Location() *time.Location
	// Now 根据时区返回时间
	Now() time.Time
	// Parse 根据时区去解析时间
	Parse(layout, value string) (time.Time, error)
	// Format 根据时区格式化时间
	Format(layout string, value time.Time) string
	// Unix 时间戳转为时区的时间
	Unix(sec int64, nanoSec int64) time.Time
}

type customizationTime struct {
	loc *time.Location
	fakeTime time.Duration
}

func (c *customizationTime) Parse(layout, value string) (time.Time, error) {
	return time.ParseInLocation(layout, value, c.loc)
}

func (c *customizationTime) Format(layout string, value time.Time) string {
	return value.In(c.loc).Format(layout)
}

func (c *customizationTime) Unix(sec int64, nanoSec int64) time.Time {
	return time.Unix(sec, nanoSec).In(c.loc)
}

func (c *customizationTime) Location() *time.Location {
	return c.loc
}

func (c *customizationTime) Now() time.Time {
	n := Now()
	if c.fakeTime != 0 {
		n = n.Add(c.fakeTime)
	}
	return n.In(c.location)
}

func Parse(layout, value string) (time.Time, error) {
	return Time.Parse(layout, value)
}

func Format(layout string, value time.Time) string {
	return Time.Format(layout, value)
}

func Unix(sec int64, nanoSec int64) time.Time {
	return Time.Unix(sec, nanoSec)
}

func Now() time.Time {
	return Time.Now()
}
```

然后自己直接批量替换 `time` 包，不过 `time` 里还有很多其他的用途所有这里也不太建议直接替换包名，可以选择使用替换调用代码的方式。以上的方法入侵业务比较严重，但是如果有时区的要求建议至少把 `time.Parse`, `time.Unix` 给自定义，因为这两个不走 `time.Local` 的时区，可能会被坑到。上面的方法在你需要自定义时区时还是比较好用的，如果是完全是 utc 时间就和直接用 `time` 标准库没有区别了，但是除了时区的处理实际上还包含了时间偏移的能力。


下面是一个通过环境变量来偏移时间的方案：

```go
package customization

import (
	"time"
)

func InitTime() {
	str := os.Getenv("FAKETIME")
	var fakeTime time.Duration
	if str != "" {
		last := str[len(str)-1]
		if last >= '0' && last <= '9' {
			str += "s"
		}
		fakeTime, _ = ParseDuration(str)
	}
	Time = &customizationTime{
		loc: time.Local,
		fakeTime: fakeTime,
	}
}

func ParseDuration(s string) (time.Duration, error) {
	last := s[len(s)-1]
	if last == 'd' {
		count, err := strconv.ParseInt(s[:len(s)-1], 10, 64)
		if err != nil {
			return 0, err
		}
		return time.Duration(count) * time.Hour * 24, nil
	}
	return time.ParseDuration(s)
}
```


## 二、使用 monkey.Patch

实际上刚开始我是选择用 `monkey` 但是由于 `time.Now` 不存在另一个可以获取时间的方法 [原因](https://github.com/cch123/supermonkey/issues/12)，所以放弃了，最近发现了 `go:linkname` 方法注释来导出标准库里的私有方法，这样就可以手动的重新实现一个 `time.Now` 了。

```go
package customization

import (
	"time"
	"unsafe"
)

// 主要是这两个私有方法导出来

//go:linkname runtimeNano runtime.nanotime
func runtimeNano() int64

//go:linkname now time.now
func now() (sec int64, nsec int32, mono int64)

var startNano = runtimeNano() - 1

type _time struct {
	wall uint64
	ext  int64
	loc  *time.Location
}


const (
	secondsPerMinute = 60
	secondsPerHour   = 60 * secondsPerMinute
	secondsPerDay    = 24 * secondsPerHour
)

const (
	unixToInternal int64 = (1969*365 + 1969/4 - 1969/100 + 1969/400) * secondsPerDay
	wallToInternal int64 = (1884*365 + 1884/4 - 1884/100 + 1884/400) * secondsPerDay
)

const (
	hasMonotonic = 1 << 63
	minWall      = wallToInternal // year 1885
	nsecShift    = 30
)

func _now() time.Time {
	sec, nsec, mono := now()
	mono -= startNano
	sec += unixToInternal - minWall
	var t *_time
	if uint64(sec)>>33 != 0 {
		t = &_time{uint64(nsec), sec + minWall, time.Local}
	} else {
		t = &_time{hasMonotonic | uint64(sec)<<nsecShift | uint64(nsec), mono, time.Local}
	}
	return *(*time.Time)(unsafe.Pointer(t))
}
```

这里用了 `go:linkname` 导出了几个 `time.Now` 依赖的方法，又使用了 `go` 的一个 `unsafe` 特性：只要结构体类型和顺序一致(类型实际上为该类型的长度一致即可，但是这是高危操作)就可以用 `unsafe.Pointer` 去强制转换，这个在标准库的 `strings.Builder` 里用到了。


然后配合 `monkey` 库就可以替换了，[monkey](https://github.com/bouk/monkey) 已经是归档版本了，这边用了 [supermonkey](https://github.com/cch123/supermonkey)。

```go
package customization

import (
	sm "github.com/cch123/supermonkey"
	"time"
)

var fakeTime = time.Hour

func patchNow() time.Time {
    return _now().add(fakeTime)
}

func init() {
	sm.Patch(time.Now, patchNow)
}

```


## 参考

- [使用monkey补丁替换golang的标准库](http://xiaorui.cc/archives/5128)
- [一次 Golang 的 time.Now 优化之旅](https://www.purewhite.io/2021/04/29/golang-time-now-optimize)
- [探究golang的linkname](https://www.jianshu.com/p/92dfe2d17b25)
