---
title: HTTP2协议解析
date: 2018-08-10 14:05:57+08:00
type: protocol
tags: [protocol, http2]
last_date: 2018-08-10 14:05:57+08:00
...

## 前言

- 最近工作都在做跟 `http2` 协议有关的东西，记录下协议的格式与资料。
- 下篇(~~这篇~~)文章中会简略的写出一个支持高并发的 `golang` 的 `http2` 转发器。

## 一、tcp 数据头特征

由于 `HTTP2` 依旧是客户端主动模式，所以协议头只有客户端到服务端的。

**协议头的ascii模式**
头为 `32byte` 的二进制可以 `ascii` 模式显示, 完成后直接开始 `Frame` 通信。

`PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n`

## 二、Frame 二进制格式描述

`rfc` 中定义了 10 种 Frame, 下面先把一些需要的静态类型声明

``` go
type FrameType uint8

const (
    FrameData         FrameType = 0x0
    FrameHeaders      FrameType = 0x1
    FramePriority     FrameType = 0x2
    FrameRSTStream    FrameType = 0x3
    FrameSettings     FrameType = 0x4
    FramePushPromise  FrameType = 0x5
    FramePing         FrameType = 0x6
    FrameGoAway       FrameType = 0x7
    FrameWindowUpdate FrameType = 0x8
    FrameContinuation FrameType = 0x9
)

type Flags uint8

func (f Flags) Has(v Flags) bool {
    return (f & v) == v
}

const (
    // Data Frame
    FlagDataEndStream Flags = 0x1
    FlagDataPadded    Flags = 0x8

    // Headers Frame
    FlagHeadersEndStream  Flags = 0x1
    FlagHeadersEndHeaders Flags = 0x4
    FlagHeadersPadded     Flags = 0x8
    FlagHeadersPriority   Flags = 0x20

    // Settings Frame
    FlagSettingsAck Flags = 0x1

    // Ping Frame
    FlagPingAck Flags = 0x1

    // Continuation Frame
    FlagContinuationEndHeaders Flags = 0x4

    FlagPushPromiseEndHeaders Flags = 0x4
    FlagPushPromisePadded     Flags = 0x8
)

// or (1<<31) - 1
const PadBit uint32 = 0x7fffffff

```

### 2.1 Frame Format

所有的 `Frame` 的头都是 `9bit` 长度。

``` shell
 +-----------------------------------------------+
 |                 Length (24)                   |
 +---------------+---------------+---------------+
 |   Type (8)    |   Flags (8)   |
 +-+-------------+---------------+-------------------------------+
 |R|                 Stream Identifier (31)                      |
 +=+=============================================================+
 |                   Frame Payload (0...)                      ...
 +---------------------------------------------------------------+
```

- Length: 24bit 长度的转换为 `int`，范围在 `2^14` 到 `2^24-1` 之间。
- Type: 8bit 的区分 `Frame` 的类型。
- Flags: 8bit 通过位运算可以放置8个标识。
- R: 1bit 占位必须为 `0x0`。
- Stream Identifier: 31bit 的无符号 int 。
- Frame Payload: 长度为上面的 `Length` 的二进制。

**解析示例**
``` go
const (
    frameHeaderLen = 9
)
type FrameHeader struct {
	valid bool // caller can access []byte fields in the Frame

	// Type is the 1 byte frame type. There are ten standard frame
	// types, but extension frame types may be written by WriteRawFrame
	// and will be returned by ReadFrame (as UnknownFrame).
	Type FrameType

	// Flags are the 1 byte of 8 potential bit flags per frame.
	// They are specific to the frame type.
	Flags Flags

	// Length is the length of the frame, not including the 9 byte header.
	// The maximum size is one byte less than 16MB (uint24), but only
	// frames up to 16KB are allowed without peer agreement.
	Length uint32

	// StreamID is which stream this frame is for. Certain frames
	// are not stream-specific, in which case this field is 0.
	StreamID uint32
}

func readFrameHeader(buf []byte, r io.Reader) (FrameHeader, error) {
    // 读出 9 个字节的 Frame 的头。
	_, err := io.ReadFull(r, buf[:frameHeaderLen])
	if err != nil {
		return FrameHeader{}, err
	}
	return FrameHeader{
        // 把长度解析为 uint32, 由于长度不足 32 bit 手动通过位操作
        Length:   (uint32(buf[0])<<16 | uint32(buf[1])<<8 | uint32(buf[2])),
        // type 转为 uint8
        Type:     FrameType(buf[3]),
        // flags 也为 uint8
        Flags:    Flags(buf[4]),
        // StreamID 正好长度为 32bit 通过binary.BigEndian.Uint32进行转换。
		StreamID: binary.BigEndian.Uint32(buf[5:]) & PadBit,
		valid:    true,
	}, nil
}

func ReadFrame(r io.Reader) {
    // buf可以考虑通过池子复用
    buf := make([]byte, frameHeaderLen)
    header, err := readFrameHeader(buf, r)
    if err != nil {
        return
    }
    payload := make([]byte, header.Length)
    _, err = io.ReadFull(r, payload)
    if err != nil {
        return
    }
    // Frame Parser
}
```

### 2.2 Settings Format 0x4
``` shell
 +-------------------------------+
 |       Identifier (16)         |
 +-------------------------------+-------------------------------+
 |                        Value (32)                             |
 +---------------------------------------------------------------+
 +-------------------------------+
 |       Identifier (16)         |
 +-------------------------------+-------------------------------+
 |                        Value (32)                             |
 +---------------------------------------------------------------+
 ...
```
- Identifier: 16 bit 长度的 key。
- Value: 32 bit 长度的 value。
- 以每一对为存在并且数量不限，有什么样设置见 [SettingValues](https://httpwg.org/specs/rfc7540.html#SettingValues)。

**解析示例**
``` go
type SettingID uint16
type Setting struct {
    ID  SettingID
    Val uint32
}
func ParserSettings(header FrameHeader, payload []byte) map[SettingID]Setting {
    settings := map[SettingID]Setting{}
    num := len(payload) / 6
    for i := 0; i < num; i++ {
        id := SettingID(binary.BigEndian.Uint16(payload[i*6 : i*6+2]))
        s := Setting{
            ID: id,
            Val: binary.BigEndian.Uint32(payload[i*6+2 : i*6+6]),
        }
        settings[id] = s
    }
    return settings
}
```
**Flags**
- Ack: 0x1


### 2.3 WindowUpdate Format 0x8

``` shell
 +-+-------------------------------------------------------------+
 |R|              Window Size Increment (31)                     |
 +-+-------------------------------------------------------------+
```
- R: 1bit 占位必须为 `0x0`。
- Window Size Increment: 31bit 的 `uint32`。

**解析示例**
``` go
func ParserWindowUpdate(header FrameHeader, payload []byte) uint32 {
    return binary.BigEndian.Uint32(payload[:4]) & PadBit
}
```
### 2.4 Header Format 0x1

``` shell
 +---------------+
 |Pad Length? (8)|
 +-+-------------+-----------------------------------------------+
 |E|                 Stream Dependency? (31)                     |
 +-+-------------+-----------------------------------------------+
 |  Weight? (8)  |
 +-+-------------+-----------------------------------------------+
 |                   Header Block Fragment (*)                 ...
 +---------------------------------------------------------------+
 |                           Padding (*)                       ...
 +---------------------------------------------------------------+
```


## 三、Frame 功能描述

## 四、HTTP2 的第一次消息握手

## 五、普通的一次 HTTP2 请求过程

## 五、Frame.StreamID 是怎么完成 HTTP2 的多路复用功能

## 六、hpack 压缩 Header

## 七、分段 Header

## 八、HTTP2 中的 body 发送模式

## 九、参考资料

- [rfc7540](https://httpwg.org/specs/rfc7540.html)

