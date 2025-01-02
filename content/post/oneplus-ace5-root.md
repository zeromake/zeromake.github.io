---
title: 一加 ace5 root 笔记
date: 2025-01-02 23:04:00 +08:00
tags:
  - ace5
  - oneplus
  - root
lastmod: 2025-01-03 01:08:00 +08:00
categories:
  - root
  - android
slug: oneplus-ace5-root
draft: false
---

## 前言

最近买了一加 ace5 把 2020 年的 k30 pro 变焦版换了，买一加不买红米 k80 的原因很简单就是因为一加随便解锁 BL 而小米已经几乎不可能免费解锁 BL，这里做一下 root 笔记。

<!--more-->

## 一、方案选择

之前在 k30 pro 上使用的都是 [Magisk](https://github.com/topjohnwu/Magisk) 或者 [Kitsune Magisk](https://github.com/HuskyDG/magisk-files)。

因为一加比起小米更加开放内核源码，所以有了其它选择那就是 [KernelSU](https://github.com/tiann/KernelSU) 和 [APatch](https://github.com/bmax121/APatch)。

## 二、解锁 BL

> 不懂命令，不懂工具下载请去使用 [一加全能工具箱](https://optool.daxiaamu.com/optool/)

下载必须的 [platform-tools](https://developer.android.com/tools/releases/platform-tools) 解压放好位置，并添加到 PATH 环境。


因为解锁 BL 会丢失所有数据，如果想要解锁建议在一买来就直接解锁。

到手必须进入系统开启开发者模式，去开启 `OEM 解锁` 和 `USB 调试` 顺便说个事一加手机插入 usb 时不是有 USB 用于选择弹框，如果你选择了仅充电会自动把 `USB 调试` 关掉……

![设置-关于](/public/img/onepus-ace5-root/101.webp)
![设置-版本信息](/public/img/onepus-ace5-root/102.webp)
![设置-版本号](/public/img/onepus-ace5-root/103.webp)

狂点上面图片里的版本号开启开发者模式

![设置-系统与更新](/public/img/onepus-ace5-root/102.webp)
![设置-开发者模式-OEM](/public/img/onepus-ace5-root/103.webp)
![设置-开发者模式-USB调试](/public/img/onepus-ace5-root/104.webp)

**连上电脑运行以下命令**
``` sh
> adb reboot bootloader
```

注意手机上的 adb 连接确认弹窗


**进入 boot 模式后执行以下命令**

``` sh
> fastboot flashing unlock
```

用音量键选择 `UNLOCK THE BOOTLOADER` 电源键确定，然后就解锁了，以后开机都会有黄字警告并且开机会慢一些。


## 三、进行 root

> 建议使用 [一加全能工具箱](https://optool.daxiaamu.com/optool/) 辅助 root

1. 首先去下载对应系统版本的的全量包 [阿木收录的官方地址下载](https://yun.daxiaamu.com/OnePlus_Roms/%E4%B8%80%E5%8A%A0OnePlus%20ACE%205)
2. 下载 [payload-dumper-go](https://github.com/ssut/payload-dumper-go) 解压 payload.bin。
3. 找到 `init_boot.img` 拷贝到手机里，使用 `apatch` 应用修补后获得一个新的 `boot.img`。
4. 把这个 boot.img 在 boot 模式下使用 `fastboot flash init_boot .\boot.img` 刷入。

中间还有很多什么 apatch 设置超级密码之类的，我都省略了可以参考 [APatch 安装指南](https://apatch.dev/zh_CN/install.html)

本来是想用 KernelSU 的但是没有成功，就换了一加全能工具箱简单安装 APatch 然后成功了……

## 四、LSPosed 安装

现在能用的 [JingMatrix/LSPosed](https://github.com/JingMatrix/LSPosed)，需要 [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext) 或者 [ReZygisk](https://github.com/PerformanC/ReZygisk)

由于 ReZygisk 还未释放出正式版，建议使用 ZygiskNext + JingMatrix/LSPosed

这个没啥好说的把模块 zip 下到手机里用 APatch 安装后重启即可


## 五、root 隐藏

> 太长不看版：ZygiskNext 开启 `遵守排除列表`, APatch 开启排除修改，添加 [PlayIntegrityFix](https://github.com/chiteroman/PlayIntegrityFix) + [TrickyStore](https://github.com/5ec1cff/TrickyStore)

最后到了 root 隐藏，国内很多银行软件会自动检测是否 root，更严格的会检查是否解锁了 bl，这里就用两个软件来作为隐藏检测参考。

- Momo: 老牌 root 检测，实际上这个能过大部分也就 ok 了。
- Hunter：看了一下和 Momo 差不多，不过更偏向于其他的检测方式，多了对 shizuku 的文件夹存在检测。


### 5.1 搞完 APatch + LSPosed 的状态

![momo-1](/public/img/onepus-ace5-root/002.webp)
![hunter-1](/public/img/onepus-ace5-root/003.webp)
![hunter-1.1](/public/img/onepus-ace5-root/004.webp)
看到是不是很慌，别急，一个一个来解决

### 5.2 解决 Zygisk 检测


![zygisk-1](/public/img/onepus-ace5-root/005.webp)
![zygisk-2](/public/img/onepus-ace5-root/006.webp)

打开 ZygiskNext 设置，把遵守排除列表开启。

![zygisk-1](/public/img/onepus-ace5-root/007.webp)

参考上图，把需要屏蔽的应用在 APatch 里开启排除修改, 重启以后我们再看看。

![momo-2](/public/img/onepus-ace5-root/009.webp)
![hunter-2](/public/img/onepus-ace5-root/008.webp)

Zygisk 检测不到了。

### 5.3 解决 TEE 和 BL 检测

这个比较简单安装 [PlayIntegrityFix](https://github.com/chiteroman/PlayIntegrityFix) 和 [TrickyStore](https://github.com/5ec1cff/TrickyStore)。

![momo-2](/public/img/onepus-ace5-root/010.webp)

- PlayIntegrityFix 可以解决 BL 检测
- TrickyStore 可以解决 TEE 检测

开启后我们再看看：

![momo-2](/public/img/onepus-ace5-root/011.webp)
![hunter-2](/public/img/onepus-ace5-root/012.webp)

虽然 Hunter 还能找到 APatch 和 Shizuku 但是这应该已经影响不大，前者在 Android 11 已经是可以不给应用列表权限，后者的 Shizuku 你也不是一定要用。

顺便一提如果你一不小心把 root 权限给了 momo 就会被检测到 su，我之前就是不小心点到折腾了老半天。

![momo-3](/public/img/onepus-ace5-root/001.webp)


## 参考

- [APatch 安装指南](https://apatch.dev/zh_CN/install.html)
- [2024年了，现在root还有什么方案](https://dkrain.com/posts/2024%E5%B9%B4%E4%BA%86%EF%BC%8C%E7%8E%B0%E5%9C%A8root%E8%BF%98%E6%9C%89%E4%BB%80%E4%B9%88%E6%96%B9%E6%A1%88/)
- [阿木收录的一加 roms 下载](https://yun.daxiaamu.com/OnePlus_Roms/)
- [一加全能工具箱](https://optool.daxiaamu.com/optool/)
- [Magisk](https://github.com/topjohnwu/Magisk)
- [Kitsune Magisk](https://github.com/HuskyDG/magisk-files)
- [APatch](https://github.com/bmax121/APatch)
- [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
- [ReZygisk](https://github.com/PerformanC/ReZygisk)
- [JingMatrix/LSPosed](https://github.com/JingMatrix/LSPosed)
- [PlayIntegrityFix](https://github.com/chiteroman/PlayIntegrityFix)
- [TrickyStore](https://github.com/5ec1cff/TrickyStore)