title: pipenv使用
date: 2017-11-22 13:04:00+08:00
type: python
tags: [pip, python, virtualenv]
last_date: 2017-11-22 13:04:00+08:00

## 前言

最近用了`pipenv`感觉挺不错的，写篇博文来推广一下。

## 一、优点

1. 自动关联项目相关的`virtualenv`，能够快速的加载`virtualenv`。
2. 提供的`pipenv`替代`pip`并自带一个依赖清单`Pipfile`，和依赖锁定`Pipfile.lock`。
3. 其中`Pipfile`除了依赖清单还支持固定`pypi`源地址,固定`python`版本。
4. `Pipfile`还支持`dev`依赖清单.`pipenv install`的包会强制使用`Pipfile`中的源.
5. 解决了`pip install pandas`时里的`numpy`依旧走官方`pypi`.
6. 还有就是可以直接切换`python2,3`
7. 使用`pipenv graph`命令可以看到依赖树


## 二、缺点

1. `windows`上切入`virtualenv`,命令行开头无`virtualenv`名字。
2. `Pipfile`中的`pypi`源无法默认设置，造成每次都需要手动修改。
3. `pipenv`终究用的是`virtualenv`，无法像`nvm`这种做到`python`管理。
4. `python2,3`切换时是删除上次的`virtualenv`，所以每次切换都要重新安装依赖。
5. `pipenv uninstall`无法以依赖树的关系进行卸载。

## 三、快速使用

### 安装
`pipenv`作为一个`python`包，最快的安装方案当然是。

``` shell
pip install pipenv
```

注意`linux`可能没有权限，如果有直接的系统包建议安装系统包

``` shell
sudo pip install pipenv
```

### 原有项目使用

打开项目目录控制台执行下面命令

``` shell
# use python2
pipenv --two

# use python3
# pipenv --three

# use source doubanio
sed -i s/pypi.python.org/pypi.doubanio.com/g Pipfile

# install old packages
pipenv install -r requirements.txt
```

其中`pipenv --two`或者`pipenv --three`代表创建虚拟环境和`Pipfile`文件。

但是不安装依赖，然后通过`sed`修改`pypi`源,

默认设置`Pipfile`文件，我提了[issues](https://github.com/kennethreitz/pipenv/issues/1040).

但是[@kennethreitz](https://github.com/kennethreitz),关闭了该`issues`,并且说了
> not in scope

看来是不会有了。

然后就是进入与退出`virtualenv`

``` shell
# 进入
pipenv shell

# 退出
exit
```

还有一个`pipenv run`的可以直接执行`virtualenv`环境下的命令。

### 新项目使用

``` shell
# use python2
pipenv --two

# use python3
# pipenv --three

# use source doubanio
sed -i s/pypi.python.org/pypi.doubanio.com/g Pipfile
```
依旧是换源，接下来只需要`pipenv install`或`pipenv install -d`，来替代`pip install`即可。


## pipenv --help

``` shell
Usage: pipenv [OPTIONS] COMMAND [ARGS]...

Options:
  --update         升级 pipenv, pip 到最新.
  --where          输出项目的目录信息.
  --venv           输出 virtualenv 的目录信息.
  --py             输出 Python 解析器的路径.
  --envs           输出环境变量的设置.
  --rm             删除当前 virtualenv.
  --bare           Minimal output.
  --completion     Output completion (to be evald).
  --man            显示使用手册.
  --three / --two  使用 Python 3/2 来创建 virtualenv
  --python TEXT    直接指定 Python 解析器.
  --site-packages  拷贝系统 site-packages 到 virtualenv.
  --jumbotron      An easter egg, effectively.
  --version        显示版本信息并退出.
  -h, --help       显示当前信息并退出.

Commands:
  check      检查安全漏洞和反对 PEP 508 标记在Pipfile提供.
  graph      显示当前依赖关系图信息.
  install    安装提供的包，并加入 Pipfile 的依赖清单中
  lock       生成 Pipfile.lock.
  open       在编辑器(vim)查看一个特定模块.
  run        在 virtualenv 中执行命令.
  shell      切换到 virtualenv 中.
  uninstall  删除提供的包，并清理 Pipfile 的依赖清单中.
  update     卸载当前所以依赖，然后安装最新包
```
