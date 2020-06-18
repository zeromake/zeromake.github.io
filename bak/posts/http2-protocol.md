---
title: HTTP2 协议解析
date: 2018-08-10 14:05:57+08:00
type: protocol
tags: [protocol, http2]
last_date: 2019-01-26 13:05:57+08:00
---

## 前言

-   最近工作都在做跟 `http2` 协议有关的东西，记录下协议的格式与资料。
-   下篇(~~这篇~~)文章中会简略的写出一个支持高并发的 `golang` 的 `http2` 转发器。
    <!--more-->

## 一、tcp 数据头特征

由于 `HTTP2` 依旧是客户端主动模式，所以协议头只有客户端到服务端的。

**协议头的 ascii 模式**
头为 `32byte` 的二进制可以 `ascii` 模式显示, 完成后直接开始 `Frame` 通信。

`PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n`

## 二、Frame 二进制格式描述

`rfc` 中定义了 10 种 Frame, 下面先把一些需要的静态类型声明

```go
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

### 2.01 FRAME Format

[rfc-frame](https://httpwg.org/specs/rfc7540.html#FramingLayer)

所有的 `Frame` 的头都是 `9bit` 长度。

```shell
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

-   Length: 24bit 长度的转换为 `int`，范围在 `2^14` 到 `2^24-1` 之间。
-   Type: 8bit 的区分 `Frame` 的类型。
-   Flags: 8bit 通过位运算可以放置 8 个标识。
-   R: 1bit 占位必须为 `0x0`。
-   Stream Identifier: 31bit 的无符号 int 。
-   Frame Payload: 长度为上面的 `Length` 的二进制。

**解析示例**

```go
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
// 统一错误输出
type ErrCode uint32

const (
    ErrCodeNo                 ErrCode = 0x0
    ErrCodeProtocol           ErrCode = 0x1
    ErrCodeInternal           ErrCode = 0x2
    ErrCodeFlowControl        ErrCode = 0x3
    ErrCodeSettingsTimeout    ErrCode = 0x4
    ErrCodeStreamClosed       ErrCode = 0x5
    ErrCodeFrameSize          ErrCode = 0x6
    ErrCodeRefusedStream      ErrCode = 0x7
    ErrCodeCancel             ErrCode = 0x8
    ErrCodeCompression        ErrCode = 0x9
    ErrCodeConnect            ErrCode = 0xa
    ErrCodeEnhanceYourCalm    ErrCode = 0xb
    ErrCodeInadequateSecurity ErrCode = 0xc
    ErrCodeHTTP11Required     ErrCode = 0xd
)

var errCodeName = map[ErrCode]string{
    ErrCodeNo:                 "NO_ERROR",
    ErrCodeProtocol:           "PROTOCOL_ERROR",
    ErrCodeInternal:           "INTERNAL_ERROR",
    ErrCodeFlowControl:        "FLOW_CONTROL_ERROR",
    ErrCodeSettingsTimeout:    "SETTINGS_TIMEOUT",
    ErrCodeStreamClosed:       "STREAM_CLOSED",
    ErrCodeFrameSize:          "FRAME_SIZE_ERROR",
    ErrCodeRefusedStream:      "REFUSED_STREAM",
    ErrCodeCancel:             "CANCEL",
    ErrCodeCompression:        "COMPRESSION_ERROR",
    ErrCodeConnect:            "CONNECT_ERROR",
    ErrCodeEnhanceYourCalm:    "ENHANCE_YOUR_CALM",
    ErrCodeInadequateSecurity: "INADEQUATE_SECURITY",
    ErrCodeHTTP11Required:     "HTTP_1_1_REQUIRED",
}

func (e ErrCode) String() string {
    if s, ok := errCodeName[e]; ok {
        return s
    }
    return fmt.Sprintf("unknown error code 0x%x", uint32(e))
}
type connError struct {
    Code   ErrCode // the ConnectionError error code
    Reason string  // additional reason
}

func (e connError) Error() string {
    return fmt.Sprintf("http2: connection error: %v: %v", e.Code, e.Reason)
}

type StreamError struct {
    StreamID uint32
    Code     ErrCode
    Cause    error // optional additional detail
}

func streamError(id uint32, code ErrCode) StreamError {
    return StreamError{StreamID: id, Code: code}
}

func (e StreamError) Error() string {
    if e.Cause != nil {
        return fmt.Sprintf("stream error: stream ID %d; %v; %v", e.StreamID, e.Code, e.Cause)
    }
    return fmt.Sprintf("stream error: stream ID %d; %v", e.StreamID, e.Code)
}
//
func readByte(p []byte) ([]byte, byte, error) {
    if len(p) == 0 {
        return nil, 0, io.ErrUnexpectedEOF
    }
    return p[1:], p[0], nil
}

func readUint32(p []byte) ([]byte, uint32, error) {
    if len(p) < 4 {
        return nil, 0, io.ErrUnexpectedEOF
    }
    return p[4:], binary.BigEndian.Uint32(p[:4]), nil
}

func readFrameHeader(buf []byte, r io.Reader) (*FrameHeader, error) {
    // 读出 9 个字节的 Frame 的头。
    _, err := io.ReadFull(r, buf[:frameHeaderLen])
    if err != nil {
        return nil, err
    }
    return &FrameHeader{
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

### 2.02 DATA Format 0x0

[rfc-data](https://httpwg.org/specs/rfc7540.html#DATA)

```shell
 +---------------+
 |Pad Length? (8)|
 +---------------+-----------------------------------------------+
 |                            Data (*)                         ...
 +---------------------------------------------------------------+
 |                           Padding (*)                       ...
 +---------------------------------------------------------------+
```

-   Pad Length: 8bit 可选，尾部 Padding 的填充字符的长度，可能用于对齐字节，需要 flag |= PADDED
-   Data: body 内容字节
-   Padding: 填充字节

**解析示例**

```go
type DataFrame struct {
    FrameHeader
    Data []byte
}
func ParseDataFrame(fh *FrameHeader, payload []byte) (*DataFrame, error) {
	if fh.StreamID == 0 {
		return nil, ConnError{ErrCodeProtocol, "DATA frame with stream ID 0"}
	}
	f := &DataFrame{FrameHeader: *fh}

	var padSize byte
	if fh.Flags.Has(FlagDataPadded) {
		var err error
		payload, padSize, err = readByte(payload)
		if err != nil {
			return nil, err
		}
	}
	if int(padSize) > len(payload) {
		return nil, ConnError{ErrCodeProtocol, "pad size larger than data payload"}
	}
	f.Data = payload[:len(payload)-int(padSize)]
}
```

**flags**

-   END_STREAM: 0x1 会话流是否结束
-   PADDED: 0x8 是否有填充字节

### 2.03 HEADER Format 0x1

[rfc-headers](https://httpwg.org/specs/rfc7540.html#HEADERS)

```shell
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

-   Pad Length: 8bit 可选，尾部 Padding 的填充字符的长度，可能用于对齐字节，需要 flag |= PADDED
-   E: 设置流是否为独占或依赖，PRIORITY 支持
-   Stream Dependency: 31bit 依赖的 stream identifier，需要 flag |= PRIORITY
-   Weight: 8bit 流的权重 1-255，需要 flag |= PRIORITY
-   Header Block Fragment: 压缩后的 Header 内容二进制
-   Padding: 填充字节

**解析示例**

```go
type HeadersFrame struct {
    FrameHeader
    Priority PriorityParam
    HeaderFragBuf []byte
}
func ParseHeadersFrame(fh *FrameHeader, p []byte) (*HeadersFrame, error) {
    var err error
    hf := &HeadersFrame{
        FrameHeader: *fh,
    }
    if fh.StreamID == 0 {
        return nil, ConnError{ErrCodeProtocol, "HEADERS frame with stream ID 0"}
    }
    var padLength uint8
    if fh.Flags.Has(FlagHeadersPadded) {
        if p, padLength, err = readByte(p); err != nil {
            return nil, err
        }
    }
    if fh.Flags.Has(FlagHeadersPriority) {
        var v uint32
        p, v, err = readUint32(p)
        if err != nil {
            return nil, err
        }
        hf.Priority.StreamDep = v & PadBit
        hf.Priority.Exclusive = (v != hf.Priority.StreamDep) // high bit was set
        p, hf.Priority.Weight, err = readByte(p)
        if err != nil {
            return nil, err
        }
    }
    if len(p)-int(padLength) <= 0 {
        return nil, streamError(fh.StreamID, ErrCodeProtocol)
    }
    hf.HeaderFragBuf = p[:len(p)-int(padLength)]
    return hf, nil
}
```

**flag**

-   END_STREAM: 0x1 是否结束这次流会话(比如 GET 的 header)
-   END_HEADERS: 0x4 header 是否结束，没有结束需要读取下面的 header 分片
-   PADDED: 0x8 是否有填充
-   PRIORITY: 0x20 是否有流依赖

### 2.04 PRIORITY Format 0x2

[rfc-priority](http://http2.github.io/http2-spec/#rfc.section.6.3)

```shell
 +-+-------------------------------------------------------------+
 |E|                  Stream Dependency (31)                     |
 +-+-------------+-----------------------------------------------+
 |   Weight (8)  |
 +-+-------------+
```

-   E: 设置流是否为独占或依赖，PRIORITY 支持
-   Stream Dependency: 31bit 依赖的 stream identifier
-   Weight: 8bit 流的权重 1-255

**解析示例**

```go
type PriorityParam struct {
    StreamDep uint32

    Exclusive bool

    Weight uint8
}
type PriorityFrame struct {
    FrameHeader
    PriorityParam
}
func ParsePriorityFrame(fh *FrameHeader, payload []byte) (*PriorityFrame, error) {
    if fh.StreamID == 0 {
        return nil, connError{
            ErrCodeProtocol,
            "PRIORITY frame with stream ID 0",
        }
    }
    var payloadLength = len(payload)
    if payloadLength != 5 {
        return nil, connError{
            ErrCodeFrameSize,
            fmt.Sprintf(
                "PRIORITY frame payload size was %d; want 5",
                payloadLength,
            ),
        }
    }
    v := binary.BigEndian.Uint32(payload[:4])
    // E 不处理
    streamID := v & PadBit // mask off high bit
    return &PriorityFrame{
        FrameHeader: *fh,
        PriorityParam: PriorityParam{
            Weight:    payload[4],
            StreamDep: streamID,
            Exclusive: streamID != v, // was high bit set?
        },
    }, nil
}
```

### 2.05 RST_STREAM Fromat 0x3

```shell
 +---------------------------------------------------------------+
 |                        Error Code (32)                        |
 +---------------------------------------------------------------+
```

-   Error Code: 32bit 错误码见 [error-codes](https://httpwg.org/specs/rfc7540.html#ErrorCodes)

**解析示例**

```go
type RSTStreamFrame struct {
    FrameHeader
    ErrCode ErrCode
}
func ParseRSTStreamFrame(fh *FrameHeader, p []byte) (*RSTStreamFrame, error) {
    if len(p) != 4 {
        return nil, ConnectionError(ErrCodeFrameSize)
    }
    if fh.StreamID == 0 {
        return nil, ConnectionError(ErrCodeProtocol)
    }
    return &RSTStreamFrame{*fh, ErrCode(binary.BigEndian.Uint32(p[:4]))}, nil
}
```

### 2.06 SETTINGS Format 0x4

[rfc-settings](https://httpwg.org/specs/rfc7540.html#SETTINGS)

```shell
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

-   Identifier: 16 bit 长度的 key。
-   Value: 32 bit 长度的 value。
-   以每一对为存在并且数量不限，有什么样设置见 [SettingValues](https://httpwg.org/specs/rfc7540.html#SettingValues)。

**解析示例**

```go
type SettingID uint16
type Setting struct {
    ID  SettingID
    Val uint32
}

// SettingFrame setting frame
type SettingFrame struct {
	FrameHeader
	Settings map[SettingID]Setting
}
func ParserSettings(header *FrameHeader, payload []byte) (*SettingFrame, error) {
	settings := map[SettingID]Setting{}
	num := len(payload) / 6
	for i := 0; i < num; i++ {
		id := SettingID(binary.BigEndian.Uint16(payload[i*6 : i*6+2]))
		s := Setting{
			ID:  id,
			Val: binary.BigEndian.Uint32(payload[i*6+2 : i*6+6]),
		}
		settings[id] = s
	}
	return &SettingFrame{
		*header,
		settings,
	}, nil
}
```

**Flags**

-   Ack: 0x1

### 2.07 PUSH_PROMISE Format 0x5

[rfc-push_promise](https://httpwg.org/specs/rfc7540.html#PUSH_PROMISE)

```shell
 +---------------+
 |Pad Length? (8)|
 +-+-------------+-----------------------------------------------+
 |R|                  Promised Stream ID (31)                    |
 +-+-----------------------------+-------------------------------+
 |                   Header Block Fragment (*)                 ...
 +---------------------------------------------------------------+
 |                           Padding (*)                       ...
 +---------------------------------------------------------------+
```

-   Pad Length: 8bit 填充大小，需要 flag := PADDED
-   R: 1bit 保留位
-   Promised Stream ID: 31bit 主动推送的下一个流 ID

**解析示例**

```go
type PushPromiseFrame struct {
    FrameHeader
    PromiseID     uint32
    HeaderFragBuf []byte // not owned
}
func ParsePushPromise(fh *FrameHeader, p []byte) (*PushPromiseFrame, error) {
    var err error
    pp := &PushPromiseFrame{
        FrameHeader: *fh,
    }
    if pp.StreamID == 0 {
        return nil, ConnectionError(ErrCodeProtocol)
    }
    var padLength uint8
    if fh.Flags.Has(FlagPushPromisePadded) {
        if p, padLength, err = readByte(p); err != nil {
            return nil, err
        }
    }
    p, pp.PromiseID, err = readUint32(p)
    if err != nil {
        return nil, err
    }
    pp.PromiseID = pp.PromiseID & PadBit
    var payloadLength = len(p)
    if int(padLength) > payloadLength {
        return nil, ConnectionError(ErrCodeProtocol)
    }
    pp.HeaderFragBuf = p[:payloadLength-int(padLength)]
    return pp, nil
}
```

**flag**

-   END_HEADERS: 0x4 与 headers 下的作用相同
-   PADDED: 0x8 是否有填充

### 2.08 PING Format 0x6

[rfc-ping](https://httpwg.org/specs/rfc7540.html#PING)

```shell
 +---------------------------------------------------------------+
 |                                                               |
 |                      Opaque Data (64)                         |
 |                                                               |
 +---------------------------------------------------------------+
```

-   Opaque Data: 64bit 任意内容定长，用于各种协议 ping 时的自定义

**解析示例**

```go
type PingFrame struct {
    FrameHeader
    Data [8]byte
}
func parsePingFrame(fh FrameHeader, payload []byte) (*PingFrame, error) {
    if len(payload) != 8 {
        return nil, ConnectionError(ErrCodeFrameSize)
    }
    if fh.StreamID != 0 {
        return nil, ConnectionError(ErrCodeProtocol)
    }
    f := &PingFrame{FrameHeader: fh}
    copy(f.Data[:], payload)
    return f, nil
}
```

### 2.09 GOAWAY Format 0x7

[rfc-goaway](https://httpwg.org/specs/rfc7540.html#GOAWAY)

```shell
 +-+-------------------------------------------------------------+
 |R|                  Last-Stream-ID (31)                        |
 +-+-------------------------------------------------------------+
 |                      Error Code (32)                          |
 +---------------------------------------------------------------+
 |                  Additional Debug Data (*)                    |
 +---------------------------------------------------------------+
```

-   Last-Stream-ID: 31bit 最后的流 ID。
-   Error Code: 32bit 错误编码。
-   Additional Debug Data: 任意调试数据。

**解析示例**

```go
type GoAwayFrame struct {
    FrameHeader
    LastStreamID uint32
    ErrCode      ErrCode
    DebugData    []byte
}
func parseGoAwayFrame(fh FrameHeader, p []byte) (*GoAwayFrame, error) {
    if fh.StreamID != 0 {
        return nil, ConnectionError(ErrCodeProtocol)
    }
    if len(p) < 8 {
        return nil, ConnectionError(ErrCodeFrameSize)
    }
    return &GoAwayFrame{
        FrameHeader:  fh,
        LastStreamID: binary.BigEndian.Uint32(p[:4]) & PadBit,
        ErrCode:      ErrCode(binary.BigEndian.Uint32(p[4:8])),
        debugData:    p[8:],
    }, nil
}
```

### 2.10 WINDOWUPDATE Format 0x8

[rfc-window_update](https://httpwg.org/specs/rfc7540.html#WINDOW_UPDATE)

```shell
 +-+-------------------------------------------------------------+
 |R|              Window Size Increment (31)                     |
 +-+-------------------------------------------------------------+
```

-   R: 1bit 占位必须为 `0x0`。
-   Window Size Increment: 31bit 的 `uint32`。

**解析示例**

```go
func ParserWindowUpdate(header FrameHeader, payload []byte) uint32 {
    return binary.BigEndian.Uint32(payload[:4]) & PadBit
}
```

### 2.11 CONTINUATION Format 0x9

[rfc-continuation](https://httpwg.org/specs/rfc7540.html#CONTINUATION)

```shell
+---------------------------------------------------------------+
 |                   Header Block Fragment (*)                 ...
 +---------------------------------------------------------------+
```

-   Header Block Fragment: header 的分片压缩字节

**解析示例**

```go
type ContinuationFrame struct {
    FrameHeader
    HeaderFragBuf []byte
}

func parseContinuationFrame(fh FrameHeader, p []byte) (*ContinuationFrame, error) {
    if fh.StreamID == 0 {
        return nil, connError{ErrCodeProtocol, "CONTINUATION frame with stream ID 0"}
    }
    return &ContinuationFrame{fh, p}, nil
}
```

**flags**

-   END_HEADERS: header 分片结束

## 三、Frame 功能逻辑描述

## 四、Frame.StreamID 是怎么完成 HTTP2 的多路复用功能

## 五、hpack 压缩 Header

## 六、分段 Header

## 七、HTTP2 中的 body 发送模式

## 八、参考资料

-   [rfc7540](https://httpwg.org/specs/rfc7540.html)
