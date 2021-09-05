---
title: ipmsg 协议
date: 2018-03-12T08:10:00.000Z
tags:
  - protocol
  - ipmsg
lastmod: 2018-04-02T09:46:00.000Z
categories:
  - protocol
slug: ipmsg-protocol
draft: false
---

## 前言

-   最近看了一下 飞鸽传书(ipmsg) 突然对它的协议有了兴趣，这边找了官方的来自行翻译

<!--more-->

## 协议版本信息

|     标题     |                  说明                  |
| :----------: | :------------------------------------: |
|     标题     | IP Messenger 通信协议规范(草案 14 版)  |
|    创建于    |               1996/02/21               |
| 最近修改时间 |               2017/06/12               |
|     作者     |               H.Shirouzu               |
|   官方网站   | [https://ipmsg.org](https://ipmsg.org) |

## 一、概要

这是使用 `TCP&UDP/IP` 的 消息发送，接收服务。

## 二、特点

使用 `TCP/IP` 来跨越各种系统。自动的识别当前网段的网络内(或者指定的其它网段)的成员。
并且通过 IP 连接的所有成员可以进行通信。

## 三、详细

TCP/UDP 都有一个监听端口(默认: 2425) 分工情况见下:

-   消息发送: UDP
-   文件传输和接收: TCP

### 1. 命令

#### 1) 命令类型(32 位命令的低 8 位)

```c
// 无操作
#define IPMSG_NOOPERATION       0x00000000UL
// 开启服务(启动时广播)
#define IPMSG_BR_ENTRY          0x00000001UL
// 关闭服务(结束时广播)
#define IPMSG_BR_EXIT           0x00000002UL
// 在线通知
#define IPMSG_ANSENTRY          0x00000003UL
// 更改为离线模式
#define IPMSG_BR_ABSENCE        0x00000004UL

// 搜索可通信的用户列表
#define IPMSG_BR_ISGETLIST      0x00000010UL
// 上面命令的确认命名，把自己标记为可通信
#define IPMSG_OKGETLIST         0x00000011UL
// 用户列表请求
#define IPMSG_GETLIST           0x00000012UL
// 用户列表传输
#define IPMSG_ANSLIST           0x00000013UL

// 发送消息
#define IPMSG_SENDMSG           0x00000020UL
// 确认消息接收
#define IPMSG_RECVMSG           0x00000021UL

// 加密消息阅读通知
#define IPMSG_READMSG           0x00000030UL
// 加密消息废弃通知
#define IPMSG_DELMSG            0x00000031UL
// 加密消息阅读确认(版本8追加)
#define IPMSG_ANSREADMSG        0x00000032UL

// 附件请求
#define IPMSG_GETFILEDATA       0x00000060UL
// 附件请求放弃
#define IPMSG_RELEASEFILES      0x00000061UL
// 文件夹附件请求
#define IPMSG_GETDIRFILES       0x00000062UL

// 获取 IPMSG 版本
#define IPMSG_GETINFO           0x00000040UL
// 发送 IPMSG 版本
#define IPMSG_SENDINFO          0x00000041UL

// 获取离线信息
#define IPMSG_GETABSENCEINFO    0x00000050UL
// 发送离线信息
#define IPMSG_SENDABSENCEINFO   0x00000051UL

// 获取 RSA 公匙
#define IPMSG_GETPUBKEY         0x00000072UL
// RSA 公匙响应
#define IPMSG_ANSPUBKEY         0x00000073UL

// 群成员在线通知群主
#define IPMSG_DIR_POLL          0x000000b0UL
// 群管理员任命
#define IPMSG_DIR_POLLAGENT     0x000000b1UL
// 群主任命管理员广播请求
#define IPMSG_DIR_BROADCAST     0x000000b2UL
// 群主任命管理员广播响应
#define IPMSG_DIR_ANSBROAD      0x000000b3UL
// 群主更改群成员名单通知
#define IPMSG_DIR_PACKET        0x000000b4UL
// 群主解除管理员请求
#define IPMSG_DIR_REQUEST       0x000000b5UL
// 管理员解除自我管理
#define IPMSG_DIR_AGENTPACKET   0x000000b6UL
```

#### 2) 选项标志类型 (32 位命令的高 24 位)

```c
// 离线模式(与成员识别命令一起使用)
#define IPMSG_ABSENCEOPT        0x00000100UL
// 服务器(预订)
#define IPMSG_SERVEROPT         0x00000200UL
// 成员识别命令
#define IPMSG_DIALUPOPT         0x00010000UL

// 检查发送
#define IPMSG_SENDCHECKOPT      0x00000100UL
// 加密
#define IPMSG_SECRETOPT         0x00000200UL
// 检查加密(版本8追加)
#define IPMSG_PASSWORDOPT       0x00008000UL
// 广播(全局选择)
#define IPMSG_BROADCASTOPT      0x00000400UL
// 多播(多个选择)
#define IPMSG_MULTICASTOPT      0x00000800UL
// 新版本多播，未找到定义
#define IPMSG_NEWMULTIOPT       null
// 不写入日志
#define IPMSG_NOLOGOPT          0x00020000UL
// 启启动时不加入用户列表
#define IPMSG_NOADDLISTOPT      0x00080000UL
// 自动应答
#define IPMSG_AUTORETOPT        0x00002000UL

// 附件
#define IPMSG_FILEATTACHOPT     0x00200000UL
// 密码
#define IPMSG_ENCRYPTOPT        0x00400000UL
// 在密文中包含附件信息和目的地信息
#define IPMSG_ENCEXTMSGOPT      0x04000000UL

// 使用UTF-8
#define IPMSG_CAPUTF8OPT        0x01000000UL
// 消息使用 UTF-8
#define IPMSG_UTF8OPT           0x00800000UL
// 支持嵌入图片的消息
#define IPMSG_CLIPBOARDOPT      0x08000000UL
// 附件加密请求
#define IPMSG_ENCFILEOPT        0x00000800UL
// 支持 IPDict 格式
#define IPMSG_CAPIPDICTOPT      0x02000000UL
// 群主
#define IPMSG_DIR_MASTER        0x10000000UL

// 重传标志(HOSTLIST 获取时使用)
#define IPMSG_RETRYOPT          0x00004000UL
```

#### 3) 密码扩展标志(扩展名使用十六进制表达式组合)

```c
// 非对称(RSA 1024bit)加密功能
#define IPMSG_RSA_1024          0x00000002UL
// 非对称(RSA 2048bit)加密功能
#define IPMSG_RSA_2048          0x00000004UL
// 非对称(RSA 4096bit)加密功能, 这个未在协议中说明，但在源码中已有
#define IPMSG_RSA_4096          0x00000008UL
// 对称(RC2 40bit)加密功能, 未找到声明
#define IPMSG_RC2_40            null
// 对称(Blowfish 128bit)加密功能
#define IPMSG_BLOWFISH_128      0x00020000UL
// 对称(AES 256bit)加密功能
#define IPMSG_AES_256           0x00100000UL
// 使用 Packet 号码进行不对称加密 IV
#define IPMSG_PACKETNO_IV       0x00800000UL
// 加密用的公匙使用 base64 转换
#define IPMSG_ENCODE_BASE64     0x01000000UL
// 给明文进行 SHA1 签名
#define IPMSG_SIGN_SHA1         0x20000000UL
// 给明文进行 SHA256 签名
#define IPMSG_SIGN_SHA256       0x40000000UL
// 不对文件传输的正文部分使用不对称加密
#define IPMSG_NOENC_FILEBODY    0x04000000UL
```

#### 4) 附件的文件类型(fileattr 低 8 位)

```c
// 普通文件
#define IPMSG_FILE_REGULAR      0x00000001UL
// 文件夹
#define IPMSG_FILE_DIR          0x00000002UL
// 返回到父级目录
#define IPMSG_FILE_RETPARENT    0x00000003UL
// 软链接
#define IPMSG_FILE_SYMLINK      0x00000004UL
// for UNIX 字符设备
#define IPMSG_FILE_CDEV         0x00000005UL
// for UNIX 伪文件系统
#define IPMSG_FILE_BDEV         0x00000006UL
// for UNIX 管道
#define IPMSG_FILE_FIFO         0x00000007UL
// for Mac
#define IPMSG_FILE_RESFORK      0x00000010UL
// for Windows Clipboard
#define IPMSG_FILE_CLIPBOARD    0x00000020UL

```

#### 5) 附件文件属性(fileattr 高 24 位)

```c
// 只读文件
#define IPMSG_FILE_RONLYOPT     0x00000100UL
// 隐藏文件
#define IPMSG_FILE_HIDDENOPT    0x00001000UL
// for MacOS X 扩展隐藏文件
#define IPMSG_FILE_EXHIDDENOPT  0x00002000UL
// 压缩文件
#define IPMSG_FILE_ARCHIVEOPT   0x00004000UL
// 系统文件
#define IPMSG_FILE_SYSTEMOPT    0x00008000UL
```

#### 6) 附件扩展文件属性

```c
// 用户id
#define IPMSG_FILE_UID          0x00000001UL
// uid by string 用户名
#define IPMSG_FILE_USERNAME     0x00000002UL
// 组id
#define IPMSG_FILE_GID          0x00000003UL
// gid by string 组名
#define IPMSG_FILE_GROUPNAME    0x00000004UL

#define IPMSG_FILE_CLIPBOARDPOS 0x00000008UL
// for UNIX 文件权限
#define IPMSG_FILE_PERM         0x00000010UL
// for UNIX devfile
#define IPMSG_FILE_MAJORNO      0x00000011UL
// for UNIX devfile
#define IPMSG_FILE_MINORNO      0x00000012UL
// for UNIX 文件状态更改时间
#define IPMSG_FILE_CTIME        0x00000013UL
// 内容修改时间
#define IPMSG_FILE_MTIME        0x00000014UL
// 最后读取时间
#define IPMSG_FILE_ATIME        0x00000015UL
// 创建时间
#define IPMSG_FILE_CREATETIME   0x00000016UL

// for Mac 创建人
#define IPMSG_FILE_CREATOR      0x00000020UL
// for Mac 文件类型
#define IPMSG_FILE_FILETYPE     0x00000021UL
// for Mac 查询信息
#define IPMSG_FILE_FINDERINFO   0x00000022UL


#define IPMSG_FILE_ACL          0x00000030UL
// alias fname
#define IPMSG_FILE_ALIASFNAME   0x00000040UL
```

### 2. 命令格式(所有都为表示为字符串)

#### 1) 命令(格式版本 1)

Ver(1) : Packet 编码 : 用户名 : host 名 : Command 号 : 追加内容

#### 2) 以当前命令格式发送消息的示例

普通的不带任何选项的消息:

```text
1:100:shirouzu:jupiter:32:Hello\0
```

其中 Command 可以带各种选项如 `IPMSG_SENDCHECKOPT(检查消息)`:

```c
// 0x00000120UL
unsigned long Command = IPMSG_SENDMSG | IPMSG_SENDCHECKOPT;
```

```text
1:100:shirouzu:jupiter:288:Hello\0
```

所以当拿到 `Command` 需要处理:

```c
// 0x00000020UL
unsigned long com = command & 0xffffff00;
```

### 3. 命令处理概要

#### 1) 成员认可

服务启动后，广播 `IPMSG_BR_ENTRY` 命令通知已启动的成员，有新成员加入。附加可以用于设置昵称。

```text
1:100:shirouzu:jupiter:1:nickname\0
```

通过这个广播，已启动成员将新成员添加到成员列表中。另外还会回复 `IPMSG_ANSENTRY`(与 `IPMSG_BR_ENTRY` 格式相同) 给新成员。(备注: Win 版中，根据成员数量和 IP 地址距离，随机等待 0-4 秒)

```text
1:100:shirouzu:jupiter:3:nickname\0
```

新成员通过收到 `IPMSG_ANSENTRY` 消息可以获得所有已启动成员。
因此除非 `IP` 数据包丢失，否则所有成员都能够获得相同的成员列表。

更改离线模式，昵称等，会使用 `IPMSG_BR_ABSENCE` 广播通知所有成员。(与 `IPMSG_BR_ENTRY` 不同，不会回复 `IPMSG_ANSENTRY`)

```text
1:100:shirouzu:jupiter:4:nickname[离线模式]\0
```

通过 `IPMSG_BR_ENTRY`, `IPMSG_ANSENTRY`, `IPMSG_BR_ABSENCE` 命令，根据离线模式设置 `IPMSG_ANSENCEOPT`, 并在命令附加昵称。此外，未收到网络指定广播的成员(如拨号用户)将设置 `IPMSG_DIALUPOPT`。对于设置了该选项的成员，请手动发送成员识别命令。

(群扩展)在 `IPMSG_BR_ENTRY`, `IPMSG_ANSENTRY`, `IPMSG_BR_ABSENCE` 中，可以发送群名，通过在原有命令的后面添加群名(用 `\0` 分割)来设置群名。这样会把发送命令的成员添加到该群中。

```text
1:100:shirouzu:jupiter:1:nickname\0Group\0
```

(IPv6 广播扩展) `IPMSG_BR_ENTRY`, `IPMSG_BR_ABSENCE` 通过使用 `IPv6` 多播，即使在 `IPv6` 网络中也可以识别不同路由器的成员，利用多播地址 `ff15::979`，启动 `IPV6_JOIN_GROUP` 同时发送 `IPMSG_BR_ENTRY` 到该多播地址。退出时发送 `IPMSG_BR_EXIT` 后执行
`IPV6_LEAVE_GROUP`。
(对于链路中的所有结点使用 `ff02::1`)
请注意，需要在 `IPv6` 路由器间配置可组播可互分发的功能。(视频分发的树形拓扑结构不足)

#### 2) 带公钥指纹的用户名 (版本 10 追加)

使用`2046bitRSA` 和 `SHA-1` 签名的用户，可以使用用户 ID 末尾的公匙添加指纹(稍后描述):

1. 使用户名更加简单
2. 防止公匙欺骗(`IPMSG_ANSPUBKEY` 收信时进行密匙与指纹的一致确认)

可以参考。([发送和接收消息-加密扩展])

按照以下方式使用公匙为用户名签名。

1. 为公匙(\*1)生成(\*2) `SHA-1` 签名(160bit)
2. 追加一个 32bit 的 0 得到一个 192bit 的值
3. 192bit 分割为 64bit \* 3 的三个字段，使用这三个字段进行 XOR。
4. 64bit 值通过 hex 转换为十六进制长度为 16。
5. 在用户名末尾添加用户名 `用户名-签名`。

(\*1)(\*2) 这部分和 SHA-1 使用的方法二进制使用小端格式。(历史问题)

如果 `IPMSG_ENCRYPTOPT` 标记未在 Entry 系统设置，或者 `IPMSG_RSA_2048`/`IPMSG_SIGN_SHA1`未在`IPMSG_GETPUBKEY`/`IPMSG_ANSPUBKEY` 中设置，即使发送带有公匙签名的用户名，也会导致非法数据包，建议丢弃数据包。

#### 3) 消息传输


## 参考

- [ipmsg-protocol](https://ipmsg.org/protocol.txt)