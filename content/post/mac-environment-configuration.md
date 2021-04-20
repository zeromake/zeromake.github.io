---
title: Mac 环境配置
date: 2019-07-30T04:04:00.000Z
tags:
  - environment
  - configuration
  - mac
lastmod: 2021-04-18 16:20:00 +08:00
categories:
  - mac
slug: mac-environment-configuration
draft: false
---

## 前言

1. ~~最近向公司申请了新的 `19` 款 `MacBook Pro`，需要重新搭建环境，因为一些网络上的资料过时的原因，记录一下搭建流程备忘。~~
2. 最近刚买了新的 `2020` 款 `MacBook Pro`，重新更新一下这篇博文。
3. 最近的 `github` 开始各种抽风，可以参考这个 [脚本](https://github.com/RC1844/FastGithub) 的 `README` 去使用镜像替换对应的地址。

<!--more-->

## 一、包管理器
可以参考以下官方说明来直接安装 `brew`。

[brew主页](https://brew.sh/index_zh-cn)

[阿里brew安装指南](https://opsx.alibaba.com/guide?lang=zh-CN&document=69a1897e-801e-11e8-87bf-00163e04cdbb)

或者直接参考以下命令进行安装：

``` bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

然后就可以使用 `brew` 命令来安装各种环境了，如果发现 `brew` 拉取缓慢可以考虑更换国内源：

阿里云:
``` bash
# 替换brew.git:
git -C "$(brew --repo)" remote set-url origin https://mirrors.aliyun.com/homebrew/brew.git
# 替换homebrew-core.git:
git -C "$(brew --repo homebrew/core)" remote set-url origin https://mirrors.aliyun.com/homebrew/homebrew-core.git
# 应用生效
brew update
# 替换homebrew-bottles:
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.aliyun.com/homebrew/homebrew-bottles' >> ~/.bash_profile
source ~/.bash_profile
# 可选的 zsh 配置
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.aliyun.com/homebrew/homebrew-bottles' >> ~/.zshrc
source ~/.zshrc
```

清华大学源:
[homebrew替换文档](https://mirrors.tuna.tsinghua.edu.cn/help/homebrew/)
[homebrew-bottles替换文档](https://mirrors.tuna.tsinghua.edu.cn/help/homebrew-bottles/)
``` bash
# 替换brew.git:
git -C "$(brew --repo)" remote set-url origin https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git
# 替换homebrew-core.git:
git -C "$(brew --repo homebrew/core)" remote set-url origin https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git
# 应用生效
brew update
# 替换homebrew-bottles:
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles' >> ~/.bash_profile
source ~/.bash_profile
# 可选的 zsh 配置
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles' >> ~/.zshrc
source ~/.zshrc
```

如果发现连安装都安装不了可以用 [HomebrewCN](https://gitee.com/cunkai/HomebrewCN)。

## 二、xcode 安装

`xcode` 必须安装，否则各种需要编译的工具都无法使用，包括 `go` 的 `cgo`，`python` 的带 `c` 扩展的库，还有 `node` 带 `c` 的库。

打开 `apple store` 搜索并安装 `xcode`，注意需要一个 `apple store` 账号，如果已经在其它设备登录 `apple` 会向其它设置发送验证码来认证。

安装速度取决于网速和 `gfw` 的情况，如果发生安装缓慢可以去 [官方归档](https://developer.apple.com/download/more/) 找到最新的 `xcode` 下载后把 `xcode.app` 移动到 `/Applications/` 下，当然这个页面也需要账号。

还有最新的 `xcode` 没有自带 `command line tools` 了，需要手动从 [官方归档](https://developer.apple.com/download/more/) 下载安装，当然上面的 `brew` 安装时会自动安装 `command line tools`。

以下提示为 `command line tools` 已安装并初始化完成。
``` bash
$ xcode-select --install
xcode-select: error: command line tools are already installed, use "Software Update" to install updates
```

## 三、各种编程环境安装

### 3.1 Node.js

`Node.js` 作为较为新的编程语言，有较多的安装方案。

**`nvm` 安装**

推荐方案，可以轻松的切换版本。
``` bash
$ brew install nvm
# set nvm env on ~/.zsh or ~/.bashrc
# 安装最新的 node 10 lts 稳定版
$ nvm install 10
```

**`brew` 直接安装**

不太推荐。
``` bash
# 安装最新的 node
$ brew install node
# 安装 node 10 版
$ brew install node@10
```

**官方 `pkg` 包安装**

和用 `brew` 安装没有什么本质区别。
到 [官方下载页](https://nodejs.org/en/download/) 选择平台版本下载后直接安装即可。

### 3.2 Python

`MacBook` 自带 `python2` 但是版本可能没有到最新版，而且没有自带 `pip`。

**`brew` 直接安装**

``` bash
# 安装 python3
$ brew install python
# 安装 python2 来替换系统的。
$ brew install python2
```

**`pyenv` 安装**

不推荐使用，因为切换版本时下载的是 `python` 源码需要编译使用，太慢了。

``` bash
# 安装 pyenv
$ brew install pyenv
# 使用 sohu 源加速
v=2.7.16|wget https://npm.taobao.org/mirrors/python/${v}/Python-${v}.tar.xz -P ~/.pyenv/cache/;pyenv install $v
v=3.7.4|wget https://npm.taobao.org/mirrors/python/${v}/Python-${v}.tar.xz -P ~/.pyenv/cache/;pyenv install $v
# 安装 python2
$ pyenv install 2.7.16
# 安装 python3
$ pyenv install 3.7.4
```

**`Anaconda` 安装**

可以使用 [官方下载](https://www.anaconda.com/distribution/) 或者直接用 `brew cask install anaconda` 安装。

``` bash
# 通过 conda 创建一个带有独立 python 的环境
$ conda create -n python3 python=3.7.4
```
可以参考 [anaconda的镜像替换](https://mirror.tuna.tsinghua.edu.cn/help/anaconda/) 来加速下载。

下面给出 `anaconda` 的官方免费仓库设置。
``` bash
$ conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
$ conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
$ conda config --set show_channel_urls yes
```

### 3.3 Golang

**`voidint/g`安装**

[voidint/g](https://github.com/voidint/g) 是一个类似 `node` 的 `nvm`，的一个 `go` 环境安装和多版本切换的工具。

``` bash
curl -sSL https://raw.githubusercontent.com/voidint/g/master/install.sh | bash
# echo "unalias g" >> ~/.bashrc # 可选。若其他程序（如'git'）使用了'g'作为别名。
source ~/.bashrc # 或者 source ~/.zshrc
g ls-remote
g install 1.16.3
```

**`brew` 安装**

``` bash
brew install golang
```
安装完成后可以通过 `go env` 查看 `go` 的各种配置情况，例如 `GO_PATH` 就默认为 `~/go`。

**官方安装**
通过以下地址下载后安装即可。

- [国内官网下载](https://golang.google.cn/dl/)
- [国际官网下载](https://golang.org/dl/)


**go mod proxy 配置**

`go` `1.11` 后自带了 `go module` 功能，可以支持代理设置。
s
``` bash
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct
go env -w GOSUMDB=sum.golang.google.cn
```

## 四、 终端配置

**更换 shell 并更换终端模拟器**

``` bash
# 把 zsh 使用 brew 替换并更新到最新
$ brew install zsh
# 替换默认 shell 到 zsh
$ sudo chsh -s /bin/zsh
# 使用 iterm2 替换默认终端
$ brew install iterm2
```

**Iterm2 配色更改**

打开 `Iterm2` 菜单下的 `Preferences` 选项弹出配置面板，选择 `Profiles` 的 `Color`，勾选掉 `Basic Colors` 下的 `Bold` 选择。
并选择右下的 `Color Presets…` 下拉选择自己喜欢的配色，上面的 `Bold` 选项取消就是为了选择其它配色可以生效。

很多旧文章都有说到选择其它配色不生效可以选择取消掉 `Draw bold text in bright colors` 这个选项，但是新版的 `Iterm2` 把它移动到了 `Bold`。

参考 [Does the option "Draw bold text in bright colors" removed?](https://gitlab.com/gnachman/iterm2/issues/7854)


![](https://gitlab.com/gnachman/iterm2/uploads/0fedc7bea02b3da96fd4e126e7a268f9/image.png)

**oh-my-zsh**

根据官方说明安装 [oh-my-zsh](https://ohmyz.sh/) 。

``` bash
# 可以选择使用 curl 或 wget 下载脚本。
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
```

**oh-my-zsh 插件**

通过以下插件让日常的命令历史能够自动补全

``` bash
# 类似 Fish Shell 的命令行高亮插件
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
# 类似 Fish Shell 的自动历史建议
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
# zsh 额外的命令行提示
git clone https://github.com/zsh-users/zsh-completions ${ZSH_CUSTOM:=~/.oh-my-zsh/custom}/plugins/zsh-completions
# touchbar 支持没 touchbar 的就别装了
git clone https://github.com/floor114/zsh-apple-touchbar $ZSH_CUSTOM/plugins/zsh-apple-touchbar
```

~/.zshrc

```bash
plugins=(
    zsh-syntax-highlighting
    zsh-autosuggestions
    zsh-completions
    zsh-apple-touchbar
)
```

## 五、安装 IDE

**安装 vscode**
``` bash
brew install visual-studio-code
```

**安装 Goland 激活**

``` bash
aria2c https://download.jetbrains.com/go/goland-2021.1.dmg
```

使用 [jetbrains-eval-reset](https://zhile.io/2020/11/18/jetbrains-eval-reset-da33a93d.html) 无限试用即可。

## 六、参考资料

- [Does the option "Draw bold text in bright colors" removed?](https://gitlab.com/gnachman/iterm2/issues/7854)
- [brew](https://brew.sh/index_zh-cn)
- [homebrew替换文档](https://mirrors.tuna.tsinghua.edu.cn/help/homebrew/)
- [homebrew-bottles替换文档](https://mirrors.tuna.tsinghua.edu.cn/help/homebrew-bottles/)
- [阿里brew安装指南](https://opsx.alibaba.com/guide?lang=zh-CN&document=69a1897e-801e-11e8-87bf-00163e04cdbb)
