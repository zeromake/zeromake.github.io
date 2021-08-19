---
title: Windows 的终端配置
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
draft: true
---

[pacman](https://packages.msys2.org/package/pacman?repo=msys&variant=x86_64), [pacman-mirrors](https://packages.msys2.org/package/pacman-mirrors?repo=msys&variant=x86_64), [msys2-keyring](https://packages.msys2.org/package/msys2-keyring?repo=msys&variant=x86_64)

```bash
$ pacman-key --init && pacman-key --populate msys2
```

``` bash
$ pacman -Sy
```

``` bash
$ pacman -S pacman --overwrite "*"
```

``` bash
$ pacman -S zsh --overwrite "*"
```


## 参考

- [install zsh with git-bash on Windows 10](http://i.lckiss.com/?p=6268)
