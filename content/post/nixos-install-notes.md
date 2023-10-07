---
title: nixos 安装笔记
date: 2023-10-05 18:32:00 +08:00
tags:
  - nix
  - nixos
  - linux
lastmod: 2023-10-05 21:01:00 +08:00
categories:
  - nix
  - nixos
  - linux
slug: nixos-install-notes
draft: false
---

## 前言

有段时间用 `archlinux`，每次更新系统都是非常的难受，`aur` 用的倒是很爽，最近看到 `nixos` 打算尝试一下，`fhs` 有些时候还是太容易挂了。

<!--more-->

## 一、安装后换源

先添加 unstable 的 channel，毕竟有些软件必须追最新版。

``` sh
> sudo nix-channel --add https://mirrors.ustc.edu.cn/nix-channels/nixos-23.05 nixpkgs
> sudo nix-channel --add https://mirrors.ustc.edu.cn/nix-channels/nixpkgs-unstable nixpkgs-unstable
> sudo nix-channel --update
```

在 `/etc/nixos/configuration.nix` 里添加 `nix.settings.substituters` 设置（默认没有 vim，可以用 nano 编辑）。

``` nix
{
    nix.settings.substituters = ["https://mirrors.ustc.edu.cn/nix-channels/store"];
    nixpkgs.config = {
        # 可以安装不开源软件例如 nvidia 官方驱动，必须开启
        allowUnfree = true;
        # 开启 unstable 支持 systemPackages 里可以 unstable.vscode 安装最新版 vscode
        packageOverrides = pkgs: {
            unstable = import <nixos-unstable> {
                config = config.nixpkgs.config;
            };
        };
    };
    environment = {
        systemPackages = with pkgs; [
            # 系统安装一些必须工具
            vim
            curl
            git
        ];
    };
}
```

最后应用 `/etc/nixos/configuration.nix` 的更改。

```sh
> sudo nixos-rebuild switch
```

## 二、显卡驱动

一般来说安装时会自动安装驱动，如果没有可以参考 wiki 的文章

- [amd](https://nixos.wiki/wiki/AMD_GPU)
- [nvidia](https://nixos.wiki/wiki/Nvidia)
- [intel](https://nixos.wiki/wiki/Intel_Graphics)

笔记本的驱动可以去 [这个仓库](https://github.com/NixOS/nixos-hardware) 看看。

## 三、ssh 配置

开启 ssh 支持，这里会自动去拉取对应的 openssh 包，可以设置 openssh 的监听端口。
```nix
{
    services.openssh = {
        enable = true;
        listenAddresses = [
            {
                addr = "0.0.0.0";
                port = 22;
            };
        ];
        # 关闭 root 登录和密码登录
        settings.PermitRootLogin = "no";
        settings.PasswordAuthentication = false;
    };
    # 配置 authorized_keys 加载路径
    users.users."user" = {
        openssh.authorizedKeys.keyFiles = [
            /etc/nixos/ssh/authorized_keys
            /home/"user"/.ssh/authorized_keys
        ];
    }
}
```

## 四、输入法

```nix
{
    # 安装一些字体
    fonts = {
        fontDir.enable = true;
        fonts = with pkgs; [
            noto-fonts
            source-code-pro
            source-han-sans
            source-han-serif
            sarasa-gothic
        ];
        # 设置 fontconfig 防止出现乱码
        fontconfig = {
            defaultFonts = {
                emoji = [
                    "Noto Color Emoji"
                ];
                monospace = [
                    "Noto Sans Mono CJK SC"
                    "Sarasa Mono SC"
                    "DejaVu Sans Mono"
                ];
                sansSerif = [
                    "Noto Sans CJK SC"
                    "Source Han Sans SC"
                    "DejaVu Sans"
                ];
                serif = [
                    "Noto Serif CJK SC"
                    "Source Han Serif SC"
                    "DejaVu Serif"
                ];
            };
        };
    }
    # 设置 locale 默认值为 zh
    i18n.defaultLocale = "zh_CN.UTF-8";
    # 输入法引擎使用 ibus，输入法使用 rime
    i18n.inputMethod = {
        enabled = "ibus";
        ibus.engines = with pkgs.ibus-engines; [rime];
    };
}
```
然后安装 [rime-cloverpinyin](https://github.com/fkxxyz/rime-cloverpinyin)，由于 nixos 的包管理要求不能修改另一个包，直接参考 github 里下载安装到 home 的 rime 里。

## 参考

**NixOS 系列**

- [#1：你为什么要考虑使用 NixOS？](https://linux.cn/article-15606-1.html)
- [#2：如何在虚拟机上安装 NixOS？](https://linux.cn/article-15624-1.html)
- [#3：在 NixOS 中安装和删除软件包](https://linux.cn/article-15645-1.html)
- [#4：安装 NixOS 后要做的事](https://linux.cn/article-15663-1.html)
- [#5：如何在 NixOS 上设置 Home Manager](https://linux.cn/article-15697-1.html)

**其它参考**

- [NixOS 如何安装 Nvidia 驱动](https://nixos.wiki/wiki/Nvidia)
- [NixOS 中文字体输入法](https://zhuanlan.zhihu.com/p/463403799)
- [Nix 新命令的一些用法](https://zhuanlan.zhihu.com/p/503483196)
- [NixOS下的Hybrid架构笔记本无诱骗器的显卡直通方案参考](https://lostattractor.net/archives/nixos-gpu-vfio-passthrough)
- [NixOS 与 Flakes](https://nixos-and-flakes.thiscute.world/zh/)
