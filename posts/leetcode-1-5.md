---
title: leetcode 1-5 算法题
date: 2018-06-28 14:05:57+08:00
type: algorithm
tags: [leetcode, problems, algorithm]
last_date: 2018-06-28 14:05:57+08:00
...

## 前言
- 最近也还是没怎么写博文，所以打算直接找个不用怎么难写的算法来写写博客。
- 为了加深印象，需要书写博文进行归纳，并且进行伪代码连续，以及手写算法。
- 这边会缓慢更新。

## 一、Tow Sum

> 作为 leetcode 的第一题难度很低。

[地址](https://leetcode.com/problems/two-sum)

### 1.1 题目

给定一个整数数组，返回这两个数字的索引，使它们合计成一个特定的目标。
您可能会认为每个输入都只有一个解决方案，并且您可能不会使用相同的元素两次。

<details>
<summary>英文</summary>
Given an array of integers, return indices of the two numbers such that they add up to a specific target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.
</details>

Example:
```
Given nums = [2, 7, 11, 15], target = 9,

Because nums[0] + nums[1] = 2 + 7 = 9,
return [0, 1].
```

### 1.2 思路解题
1. 暴力破解即直接两层嵌套循环，相加并下标不同，代码复杂度: O(n^2)。

``` python
def towSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    for index1, n in enumerate(nums):
        for index2, j in enumerate(nums):
            if index1 != index2 and (n + j) == target:
                # 一定是外层的index小
                return [index1, index2]
```

2. 使用的字典/map key 存放值，val 存放下标，再遍历用目标减去遍历的数再到 map 中寻找，且下标不相同, 代码复杂度: O(n)。

``` python
def towSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    cache = {key: val for val, key in enumerate(nums)}
    for index, n in enumerate(nums):
        temp = target - n
        if temp in cache:
            index2 = cache[temp]
            if index2 != index:
                # 能到这里index一定小
                return [index, index2]
```

3. 最优解在 2 号方案的基础上优化，把 map 的生成去掉，并且去掉 enumerate，也是 O(n)，但是在 leetcode 中仅需 36ms，python 中排第一。

``` python
def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    cache = {}
    for i in range(len(nums)):
        n = nums[i]
        index = target - n
        if index in cache:
            # 命中的话说明已经遍历到大的下标
            return [cache[index], i]
        # 由于必然是两个不同下标的数，在查找后才存入防止返回两个相同下标
        # 所以在没有找到的情况下把下标较小的存入 map
        cache[n] = i
```

## 二、Add Tow Numbers

> 难度: Medium

[地址](https://leetcode.com/problems/add-two-numbers)

### 2.1 题目

给你两个非空链表，表示两个非负整数。数字以相反的顺序存储，每个节点都包含一个数字。

这两个链表添加并将其作为链接列表返回。您可以假设这两个数字不包含任何前导零，除了数字0本身。

> 题目有点误导性，我一直以为是什么意思，实际上意思就是这个两个链表都是一个10进制数的每个位组成的倒序链表，想办法把两个数相加并且依旧返回这种格式。

<details>
<summary>英文</summary>
You are given two non-empty linked lists representing two non-negative integers.
The digits are stored in reverse order and each of their nodes contain a single digit.
Add the two numbers and return it as a linked list.
You may assume the two numbers do not contain any leading zero, except the number 0 itself.
</details>

Example
```
Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)
Output: 7 -> 0 -> 8
Explanation: 342 + 465 = 807.
```

### 2.2 思路解题

1. 最简单的暴力算法，直接转换回数字相加再转换回去，复杂度: O(max(n,m)) + O(n) + O(m)。
``` python
class ListNode:
    def __init__(self, x):
        self.val = x
        self.next = None

def numToList(num: int) -> ListNode:
    res = ListNode(0)
    temp = res
    i = num
    while True:
        res.val = i % 10
        i = i // 10
        if i == 0:
            break
        res.next = ListNode(0)
        res = res.next
    return temp

def listToNum(l: ListNode) -> int:
    res = 0
    count = 0
    while l:
        res = l.val * 10 ** count
        l = l.next
        count += 1
    return res

def addTwoNumbers(l1, l2):
    return numToList(listToNum(l1) + ListToNum(l2))
```


2. 好的做法是，由于链表是倒序的数所以只需要每个位的数相加如果有进位加到下一个位上，复杂度: O(max(n, m))。
``` python
class ListNode:
    def __init__(self, x):
        self.val = x
        self.next = None

def addTwoNumbers(l1, l2):
    """
    :type l1: ListNode
    :type l2: ListNode
    :rtype: ListNode
    """
    list1 = l1
    list2 = l2
    data = ListNode(0)
    res = data
    last = 0
    while list1 and list2:
        numSum = list1.val + list2.val + last
        num = numSum % 10
        last = numSum // 10
        data.val = num
        data = data.next
        list1 = list1.next
        list2 = list2.next
        if not list1 and not list2:
            break
        data.next = ListNode(0)
        if not list1:
            list1 = ListNode(0)
        if not list2:
            list2 = ListNode(0)
    if last == 1:
        data.next = ListNode(last)
    return res
```
## 三、Longest Substring Without Repeating Characters

### 3.1 题目

给定一个字符串，找出不含有重复字符的最长子串的长度。

示例：

给定 `abcabcbb` ，没有重复字符的最长子串是 `abc` ，那么长度就是3。
给定 `bbbbb` ，最长的子串就是 `b` ，长度是1。
给定 `pwwkew` ，最长子串是 `wke` ，长度是3。请注意答案必须是一个子串，`pwke` 是 子序列  而不是子串。

<details>
<summary>英文</summary>
Given a string, find the length of the longest substring without repeating characters.

Examples:

Given "abcabcbb", the answer is "abc", which the length is 3.
Given "bbbbb", the answer is "b", with the length of 1.
Given "pwwkew", the answer is "wke", with the length of 3. Note that the answer must be a substring, "pwke" is a subsequence and not a substring.
</details>

