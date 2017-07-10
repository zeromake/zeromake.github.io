title: promise-and-co-make
date: 2017-07-10 15:24:39
tags: [promise, co, async]
last_date: 2017-07-10 15:24:39

[TOC]
## 前言
1. 上篇博客写着写着没动力，然后就拖了一个月。
2. 现在打算在一周内完成。
3. 这篇讲`Promise`和`co`的原理+实现。

## 一、Promise的原理和Promises/A+规范
Promise的规范有很多，其中`ECMAScript 6`采用的是[Promises/A+](http://www.ituring.com.cn/article/66566).
想要了解更多最好仔细读完`Promises/A+`，顺便说下`Promise`是依赖于异步实现。

而在`JavaScript`中有两种异步宏任务`macro-task`和微任务`micro-task`.
> 在挂起任务时，JS 引擎会将所有任务按照类别分到这两个队列中，首先在 macrotask 的队列（这个队列也被叫做 task queue）中取出第一个任务，执行完毕后取出 microtask 队列中的所有任务顺序执行；之后再取 macrotask 任务，周而复始，直至两个队列的任务都取完。

常见的异步代码实现
- `macro-task`: setTimeout, setInterval, setImmediate, I/O, UI rendering
- `micro-task`: process.nextTick, Promises（原生 Promise）, ~~Object.observe(api已废弃)~~, MutationObserver

以上的知识摘查于[Promises/A+](http://www.ituring.com.cn/article/66566)

顺便说下一个前段时间看到的一个`js`面试题
``` javascript
setTimeout(function() {
  console.log(1)
}, 0);
new Promise(function executor(resolve) {
  console.log(2);
  for( var i=0 ; i<10000 ; i++ ) {
    i == 9999 && resolve();
  }
  console.log(3);
}).then(function() {
  console.log(4);
});
console.log(5);
```
使用原生的`Promise`是： "2 3 5 4 1"。
但是如果使用`bluebird`之类的第三方就是: "2 3 5 1 4"。
