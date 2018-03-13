title: ipmsg协议
date: 2018-03-12 16:10:00+08:00
type: protocol
tags: [protocol, ipmsg]
last_date: 2018-03-12 16:10:00+08:00

## 前言

- 最近看了一下 飞鸽传书(ipmsg) 突然对它的协议有了兴趣，这边找了官方的来自行翻译

## 协议版本信息

|  标题    | 说明     |
|:---------:|:---------:|
| 标题     | IP Messenger 通信协议规范(草案14版) |
| 创建于 | 1996/02/21 |
| 最近修改时间 | 2017/06/12 |
| 作者 | H.Shirouzu |
| 官方网站 | [https://ipmsg.org](https://ipmsg.org) |

## 一、概要

这是使用 `TCP&UDP/IP` 的 消息发送，接收服务。

## 二、特点

使用 `TCP/IP` 来跨越各种系统。自动的识别当前网段的网络内(或者指定的其它网段)的成员。
并且通过 IP 连接的所有成员可以进行通信。

## 三、详细

TCP/UDP 都有一个监听端口(默认: 2425) 分工情况见下:

- 消息发送: UDP
- 文件传输和接收: TCP

### 1. 命令

#### 1) 命令类型(32位命令的低8位)

``` c
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

#### 2) 选项标志类型 (32位命令的高24位)

``` c
// 离线模式(与成员识别命令一起使用)
#define IPMSG_ABSENCEOPT    0x00000100UL
// 服务器(预订)
#define IPMSG_SERVEROPT     0x00000200UL
// 成员识别命令
#define IPMSG_DIALUPOPT     0x00010000UL

// 检查发送
#define IPMSG_SENDCHECKOPT  0x00000100UL
// 加密
#define IPMSG_SECRETOPT     0x00000200UL
// 检查加密(版本8追加)
#define IPMSG_PASSWORDOPT   0x00008000UL
// 广播(全局选择)
#define IPMSG_BROADCASTOPT  0x00000400UL
// 多播(多个选择)
#define IPMSG_MULTICASTOPT  0x00000800UL
// 新版本多播，未找到定义
#define IPMSG_NEWMULTIOPT   null
// 不写入日志
#define IPMSG_NOLOGOPT      0x00020000UL
// 启启动时不加入用户列表
#define IPMSG_NOADDLISTOPT  0x00080000UL
// 自动应答
#define IPMSG_AUTORETOPT    0x00002000UL

// 附件
#define IPMSG_FILEATTACHOPT 0x00200000UL
// 密码
#define IPMSG_ENCRYPTOPT    0x00400000UL
// 在密文中包含附件信息和目的地信息
#define IPMSG_ENCEXTMSGOPT  0x04000000UL

// 使用UTF-8
#define IPMSG_CAPUTF8OPT    0x01000000UL
// 消息使用 UTF-8
#define IPMSG_UTF8OPT       0x00800000UL
// 支持嵌入图片的消息
#define IPMSG_CLIPBOARDOPT  0x08000000UL
// 附件加密请求
#define IPMSG_ENCFILEOPT    0x00000800UL
// 支持 IPDict 格式
#define IPMSG_CAPIPDICTOPT  0x02000000UL
// 群主
#define IPMSG_DIR_MASTER    0x10000000UL

// 重传标志(HOSTLIST 获取时使用)
#define IPMSG_RETRYOPT      0x00004000UL
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

#### 4) 附件的文件类型(fileattr低8位)

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

#### 5) 附件文件属性(fileattr高24位)

``` c
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

#### 1) 命令(格式版本1)

Ver(1) : Packet编码 : 用户名 : host名 : Command号 : 追加内容

#### 2) 以当前命令格式发送消息的示例

``` text
1:100:shirouzu:jupiter:32:Hello
```

### 3. 命令处理概要

#### 1) 成员认可

服务启动后，广播 `IPMSG_BR_ENTRY` 命令通知已启动的成员，有新成员加入。

通过这个广播，已启动成员将新成员添加到成员列表中。另外还会回复 `IPMSG_ANSENTRY` 给新成员。(备注: Win版中，根据成员数量和 IP 地址距离，随机等待 0-4 秒)


