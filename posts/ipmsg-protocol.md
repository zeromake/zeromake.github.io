title: ipmsg协议
date: 2018-03-12 16:10:00+08:00
type: protocol
tags: [protocol, ipmsg]
last_date: 2018-03-12 16:10:00+08:00

## 前言
- 最近看了一下 飞鸽传书(ipmsg) 突然对它的协议有了兴趣，这边找了官方的来自行翻译

## 协议版本信息

1. 描述语言: Chinese
2. 标题: IP Messenger 通信协议规范(草案14版)
3. 创建于: 1996/02/21
4. 最近修改时间: 2017/06/12
5. 作者: H.Shirouzu
6. 官方网站: https://ipmsg.org

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
#define IPMSG_NOOPERATION   0x00000000UL
// 开启服务(启动时广播)
#define IPMSG_BR_ENTRY  0x00000001UL
// 关闭服务(结束时广播)
#define IPMSG_BR_EXIT   0x00000002UL
// 在线通知
#define IPMSG_ANSENTRY  0x00000003UL
// 更改为离线模式
#define IPMSG_BR_ABSENCE    0x00000004UL

// 搜索可通信的用户列表
#define IPMSG_BR_ISGETLIST  0x00000010UL
// 上面命令的确认命名，把自己标记为可通信
#define IPMSG_OKGETLIST 0x00000011UL
// 用户列表请求
#define IPMSG_GETLIST   0x00000012UL
// 用户列表传输
#define IPMSG_ANSLIST   0x00000013UL

// 发送消息
#define IPMSG_SENDMSG   0x00000020UL
// 确认消息接收
#define IPMSG_RECVMSG   0x00000021UL

// 加密消息阅读通知
#define IPMSG_READMSG   0x00000030UL
// 加密消息废弃通知
#define IPMSG_DELMSG    0x00000031UL
// 加密消息阅读确认(版本8追加)
#define IPMSG_ANSREADMSG    0x00000032UL

// 附件请求
#define IPMSG_GETFILEDATA   0x00000060UL
// 附件请求放弃
#define IPMSG_RELEASEFILES  0x00000061UL
// 文件夹附件请求
#define IPMSG_GETDIRFILES   0x00000062UL

// 获取 IPMSG 版本
#define IPMSG_GETINFO   0x00000040UL
// 发送 IPMSG 版本
#define IPMSG_SENDINFO  0x00000041UL

// 获取离线信息
#define IPMSG_GETABSENCEINFO    0x00000050UL
// 发送离线信息
#define IPMSG_SENDABSENCEINFO   0x00000051UL

// 获取 RSA 公匙
#define IPMSG_GETPUBKEY 0x00000072UL
// RSA 公匙响应
#define IPMSG_ANSPUBKEY 0x00000073UL

// 群成员在线通知群主
#define IPMSG_DIR_POLL  0x000000b0UL
// 群管理员任命
#define IPMSG_DIR_POLLAGENT 0x000000b1UL
// 群主任命管理员广播请求
#define IPMSG_DIR_BROADCAST 0x000000b2UL
// 群主任命管理员广播响应
#define IPMSG_DIR_ANSBROAD  0x000000b3UL
// 群主更改群成员名单通知
#define IPMSG_DIR_PACKET    0x000000b4UL
// 群主解除管理员请求
#define IPMSG_DIR_REQUEST   0x000000b5UL
// 管理员解除自我管理
#define IPMSG_DIR_AGENTPACKET   0x000000b6UL
```

#### 2) 选项标志类型 (32位命令的高24位)

``` c
// 离线模式(与成员识别命令一起使用)
#define IPMSG_ABSENCEOPT    0x00000100UL
// 服务器(预订)
#define IPMSG_SERVEROPT 0x00000200UL
// 成员识别命令
#define IPMSG_DIALUPOPT 0x00010000UL

```