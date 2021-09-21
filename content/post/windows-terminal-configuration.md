---
title: Windows 的终端配置(给 git-windows 添加 msys2 包管理器)
date: 2021-08-14 00:28:00 +08:00
tags:
  - fish
  - zsh
  - configuration
  - git
  - git-sdk
  - msys2
  - tmux
lastmod: 2021-08-14 00:28:00 +08:00
categories:
  - windows
  - terminal
slug: windows-terminal-configuration
draft: false
---

## 前言

1. 因为 macbook pro 本性能不够(主要是没有独显带不动双 4k 有点卡)，又摸了个 r9000p 当然这个也完全只能装 windows10 了。
2. 所以需要在 windows10 上重新配置开发环境，这篇博文讲我的终端配置历程，主要是在 windows10 上使用 zsh。

## 一、使用 cygwin

[cygwin](https://www.cygwin.com/) 是一个方案，~~我安装以后使用 `apt-cyg` 安装了 `zsh`，单用 `zsh` 还好，加上 [ohmyzsh](https://github.com/ohmyzsh/ohmyzsh) 就会启动卡上 10~20s，不知道为什么，后面放弃了。~~ 后面使用官方的安装工具去装倒是比较正常了，和下面的 `msys2` 差不多，但是有文件权限，而且 tmux 的渲染还算正常，`msys2` 的 `tmux` 渲染有些显示上的问题。

## 二、使用 git-sdk

[git-sdk](https://github.com/git-for-windows/git-sdk-64) 是基于 `git-for-windows` 的一个方案，但是在我使用的时候，由于更新频繁，bug 很多，安装了 zsh 也经常出现启动 zsh+ohmyzsh 出现各种命令不存在，这个也是没法在日常中使用的。

## 三、使用 git-for-windows

[git-for-windows](https://github.com/git-for-windows/git) 是使用 `msys2` 制作的一个 windows10 的一个 git 发行版里面带有 `bash` 和一些基础的命令，但是并没有 `zsh`，我是在看到 [这篇博文](http://i.lckiss.com/?p=6268) 时发现 `msys2` 的包可以直接用。

下载 `msys2` 包管理器需要的资源包
```sh
curl -o pacman-6.0.0-7-x86_64.pkg.tar.zst -L https://mirror.msys2.org/msys/x86_64/pacman-6.0.0-7-x86_64.pkg.tar.zst
curl -o pacman-mirrors-20210706-1-any.pkg.tar.zst -L https://mirror.msys2.org/msys/x86_64/pacman-mirrors-20210706-1-any.pkg.tar.zst
curl -o msys2-keyring-1~20210213-2-any.pkg.tar.zst -L https://mirror.msys2.org/msys/x86_64/msys2-keyring-1~20210213-2-any.pkg.tar.zst
# 正常来说只需要上面三个包但是由于缺少 zstd 解压工具还需要 zstd 包
curl -o zstd-1.5.0-1-x86_64.pkg.tar.zst -L https://mirror.msys2.org/msys/x86_64/zstd-1.5.0-1-x86_64.pkg.tar.zst
# 但是又因为 zstd 包也是 zstd 打包又需要另一个不是 zstd 打包的解压工具来解压
curl -o zstd-v1.50.win64.zip -L https://github.com/facebook/zstd/releases/download/v1.5.0/zstd-v1.5.0-win64.zip
```

解压并安装这几个包
```sh
unzip ./zstd-v1.50.win64.zip "zstd-v1.5.0-win64/zstd.exe" -d .
./zstd-v1.5.0-win64/zstd.exe -d -o zstd-1.5.0-1-x86_64.pkg.tar zstd-1.5.0-1-x86_64.pkg.tar.zst
tar -xvf zstd-1.5.0-1-x86_64.pkg.tar -C /
tar -xvf msys2-keyring-1~20210213-2-any.pkg.tar.zst -C /
tar -xvf pacman-mirrors-20210706-1-any.pkg.tar.zst -C /
tar -xvf pacman-6.0.0-7-x86_64.pkg.tar.zst -C /
```


[pacman](https://packages.msys2.org/package/pacman?repo=msys&variant=x86_64), [pacman-mirrors](https://packages.msys2.org/package/pacman-mirrors?repo=msys&variant=x86_64), [msys2-keyring](https://packages.msys2.org/package/msys2-keyring?repo=msys&variant=x86_64)

安装完成后就可以执行 `pacman` 了，但是依旧不能用来装软件，直接更新包数据库会报以下错误。
```sh
$ pacman -Sy
警告：找不到公钥环。你执行 'pacman-key --init' 了吗？
:: 正在同步软件包数据库...
 mingw32                1373.2 KiB   457 KiB/s 00:03 [###########################] 100%
 mingw64                1380.4 KiB   429 KiB/s 00:03 [###########################] 100%
 ucrt64                 1521.1 KiB   496 KiB/s 00:03 [###########################] 100%
 clang64                1357.2 KiB   458 KiB/s 00:03 [###########################] 100%
 msys                    374.0 KiB   189 KiB/s 00:02 [###########################] 100%
错误：mingw32: 密钥 "5F944B027F7FE2091985AA2EFA11531AA0AA7F57" 未知
错误：密钥环不可写
错误：mingw64: 密钥 "5F944B027F7FE2091985AA2EFA11531AA0AA7F57" 未知
错误：密钥环不可写
错误：ucrt64: 密钥 "5F944B027F7FE2091985AA2EFA11531AA0AA7F57" 未知
错误：密钥环不可写
错误：clang64: 密钥 "5F944B027F7FE2091985AA2EFA11531AA0AA7F57" 未知
错误：密钥环不可写
错误：msys: 密钥 "5F944B027F7FE2091985AA2EFA11531AA0AA7F57" 未知
错误：密钥环不可写
错误：failed to synchronize all databases (无效或已损坏的数据库 (PGP 签名))
```

需要执行以下命令
```sh
$ pacman-key --init && pacman-key --populate msys2
gpg: /etc/pacman.d/gnupg/trustdb.gpg: trustdb created
gpg: no ultimately trusted keys found
gpg: starting migration from earlier GnuPG versions
gpg: porting secret keys from '/etc/pacman.d/gnupg/secring.gpg' to gpg-agent
gpg: migration succeeded
==> 正在生成 pacman 主密钥。这可能需要一段时间。
gpg: Generating pacman keyring master key...
gpg: key 9AC158487D6E37D6 marked as ultimately trusted
gpg: directory '/etc/pacman.d/gnupg/openpgp-revocs.d' created
gpg: revocation certificate stored as '/etc/pacman.d/gnupg/openpgp-revocs.d/BC2F4FC1BC5EE78C37AA2AC89AC158487D6E37D6.rev'
gpg: Done
==> 正在更新可信数据库...
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u
==> 正在从 msys2.gpg 添加密匙...
==> 正在本地签名密匙环中的可信密匙...
.........
```

再次执行就能正常了

``` sh
$ pacman -Sy
:: 正在同步软件包数据库...
 mingw32                1373.2 KiB   457 KiB/s 00:03 [###########################] 100%
 mingw64                1380.4 KiB   429 KiB/s 00:03 [###########################] 100%
 ucrt64                 1521.1 KiB   496 KiB/s 00:03 [###########################] 100%
 clang64                1357.2 KiB   458 KiB/s 00:03 [###########################] 100%
 msys                    374.0 KiB   189 KiB/s 00:02 [###########################] 100%
```

先把 `pacman` 写入 pacman 数据库防止后面需要更新 `pacman` 但是又因为 `pacman.exe` 是主进程无法退出，`bash` 也会，听说有办法但是没有找到对应的方法都没生效。

```sh
$ pacman -S pacman --dbonly
```

然后就正常的通过 `pacman` 工具安装 `zsh` 就行了。
``` bash
$ pacman -S zsh --overwrite "*"
```

## 四、使用 msys2

[msys2](https://www.msys2.org/) 实际上 `git-windows` 都是基于这个 msys2 的，倒是不用处理上面的那些问题了，就是占用空间有点大，顺便一提 `msys2` 的软件包里的文件连接方式都是硬链接，导致一个 git 包本来不到 10m 的直接变成几百m了。

## 五、使用 wsl

wsl1 和 wsl2 都个有优点，自行选择，由于是直接为 linux 比起上面的模拟方案几乎不存在各种奇怪的问题，像 cygwin 经常各种工具执行不正常，msys2 倒是还算正常但是执行速度比正常的 linux 差上好几个档次（fish 的 git 补全会卡到 7s 以后）。


## 参考

- [install zsh with git-bash on Windows 10](http://i.lckiss.com/?p=6268)
