---

title: python 编码
date: 2018-05-04 13:33:00+08:00
type: python
tags: [python, coding]
last_date: 2018-05-04 13:33:00+08:00
...

## 前言

-   最近对 `python` 的编码感觉到很迷，`python2` 和 `python3` 的 str bytes 完全不一样。
-   这边记录下各种方式输入的字符串编码，以及各种编码对象的转换备忘。

<!--more-->

## 一、input 函数在各个平台和 python 版本中的变化

### 1.1 测试代码

```python
# -*- coding=utf8 -*-
import sys

IS_PY3 = sys.version_info.major == 3

default_coding = "utf8"

def print_str(test):
    print("input str: ", test)
    print("input repr: ", repr(test))
    print("input type:", type(test))
    if hasattr(test, "decode"):
        try:
            temp1 = test.decode(default_coding)
            print("has decode:", temp1, type(temp1))
        except (UnicodeEncodeError, UnicodeDecodeError) as e:
            print(e)
    if hasattr(test, "encode"):
        try:
            temp2 = test.encode(default_coding)
            print("has encode:", temp2, type(temp2))
        except (UnicodeEncodeError, UnicodeDecodeError) as e:
            print(e)

def test_input():
    if IS_PY3:
        name = input("test str: ")
    else:
        name = raw_input("test str: ")
    # print(name)
    print_str(name)

if __name__ == "__main__":
    test_input()

```

### 1.2. UNIX 下

**python2**

```shell
$ python test.py
test str: 测试
('input str: ', '\xe6\xb5\x8b\xe8\xaf\x95')
('input repr: ', "'\\xe6\\xb5\\x8b\\xe8\\xaf\\x95'")
('input type:', <type 'str'>)
('has decode:', u'\u6d4b\u8bd5', <type 'unicode'>)
Traceback (most recent call last):
  File "test.py", line 32, in <module>
    test_input()
  File "test.py", line 29, in test_input
    print_str(name)
  File "test.py", line 18, in print_str
    temp2 = test.encode("utf8")
UnicodeDecodeError: 'ascii' codec can't decode byte 0xe6 in position 0: ordinal not in range(128)
```

**总结**

1. 在 `python2` 中 `raw_input` 函数把控制台输入的 `bytes` 直接拿来了，编码为控制台的指定编码(utf8)。
2. `python2` 的 <type 'str'> 就是一个 `bytes` 类型， 通过 `decode` 可以把 `str(bytes)` 转换为 `unicode(str)`。
3. 至于有 `encode` 不能转换就是因为本身就是 `str(bytes)` 无法在转换。还有就是设计问题，否则 `python3` 就不用改了。

**python3**

```shell
$ python3 test.py
test str: 测试
input str:  测试
input repr:  '测试'
input type: <class 'str'>
has encode: b'\xe6\xb5\x8b\xe8\xaf\x95' <class 'bytes'>
```

**总结**

1. 在 `python3` 中的 `input` 函数明显做了包装，会把标准输入流中的 `bytes` 转换为 `str` 也就是 `python2` 的 `unicode`。
2. 由于本身就是 `str(unicode)`，`python3` 直接去掉了 `str.decode`，很明显这样更符合编程思想。
3. 这里这样的做法省去了考虑控制台编码的问题。

### 1.3. windows 系统

## 二、编写代码时的字面量

### 2.1. 测试说明

在代码中的字面量字符串，暂时没有发现平台区别。

### 2.2. python2

**测试代码**

```python
def main():
    print("raw")
    print_str("测试")
    print("unicode")
    print_str(u"测试")
    print("bytes")
    print_str(b"测试")
```

**执行结果**

```shell
$ python test.py
raw
('input str: ', '\xe6\xb5\x8b\xe8\xaf\x95')
('input repr: ', "'\\xe6\\xb5\\x8b\\xe8\\xaf\\x95'")
('input type:', <type 'str'>)
('has decode:', u'\u6d4b\u8bd5', <type 'unicode'>)
'ascii' codec can't decode byte 0xe6 in position 0: ordinal not in range(128)
unicode
('input str: ', u'\u6d4b\u8bd5')
('input repr: ', "u'\\u6d4b\\u8bd5'")
('input type:', <type 'unicode'>)
'ascii' codec can't encode characters in position 0-1: ordinal not in range(128)
('has encode:', '\xe6\xb5\x8b\xe8\xaf\x95', <type 'str'>)
bytes
('input str: ', '\xe6\xb5\x8b\xe8\xaf\x95')
('input repr: ', "'\\xe6\\xb5\\x8b\\xe8\\xaf\\x95'")
('input type:', <type 'str'>)
('has decode:', u'\u6d4b\u8bd5', <type 'unicode'>)
'ascii' codec can't decode byte 0xe6 in position 0: ordinal not in range(128)
```

**总结**

1. 可以明显看出 `b""` 与 `""` 在 `python` 都是同一种类型 `<type str>` 也就是其它语言中的 `bytes`。
2. 编码为代码头申明的 `#-*- coding=utf8 -*-`。

### 2.3. python3

**测试代码**

```python
def main():
    print("raw")
    print_str("测试")
    print("unicode")
    print_str(u"测试")
    print("bytes")
    print_str("测试".encode("utf8"))
```

**执行结果**

```shell
$ python3 test.py
raw
input str:  测试
input repr:  '测试'
input type: <class 'str'>
has encode: b'\xe6\xb5\x8b\xe8\xaf\x95' <class 'bytes'>
unicode
input str:  测试
input repr:  '测试'
input type: <class 'str'>
has encode: b'\xe6\xb5\x8b\xe8\xaf\x95' <class 'bytes'>
bytes
input str:  b'\xe6\xb5\x8b\xe8\xaf\x95'
input repr:  b'\xe6\xb5\x8b\xe8\xaf\x95'
input type: <class 'bytes'>
has decode: 测试 <class 'str'>
```

**总结**

1. 这里明显看出 `str` 与 `unicode` 是同一种类型。
2. 由于把字面量字符串转为了 `unicode` 不用在意头部编码申明，也不用管代码文本编码了。
3. 在 `python3` 中的字面量 `bytes` 只能使用 `ascii` 如果想使用其它的只能通过 str.encode(`${代码文本编码}`)。
