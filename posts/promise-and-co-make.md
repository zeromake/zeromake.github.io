title: promise-and-co-make
date: 2017-07-10 15:24:39
tags: [promise, co, async]
last_date: 2017-07-10 15:24:39

[TOC]
## 前言
1. 上篇博客写着写着没动力，然后就拖了一个月。
2. 现在打算在一周内完成。
3. 这篇讲`Promise`和`co`的原理+实现。

## 一、Promise的原理
Promise的规范有很多，其中`ECMAScript 6`采用的是[Promises/A+](http://www.ituring.com.cn/article/66566).
想要了解更多最好仔细读完`Promises/A+`，顺便说下`Promise`是依赖于异步实现。

### JavaScript中的异步队列
而在`JavaScript`中有两种异步宏任务`macro-task`和微任务`micro-task`.
> 在挂起任务时，JS 引擎会将所有任务按照类别分到这两个队列中，首先在 macrotask 的队列（这个队列也被叫做 task queue）中取出第一个任务，执行完毕后取出 microtask 队列中的所有任务顺序执行；之后再取 macrotask 任务，周而复始，直至两个队列的任务都取完。

常见的异步代码实现
- `macro-task`: script(整体代码), setTimeout, setInterval, setImmediate, I/O, UI rendering
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
在node v8.13使用原生的`Promise`是： "2 3 5 4 1"。
但是如果使用`bluebird`的第三方`Promise`就是: "2 3 5 1 4"。
这个原因是因为`bluebird`在这个环境下优先使用`setImmediate`[代码](https://github.com/petkaantonov/bluebird/blob/master/src/schedule.js)。
然后再看上面的代码执行顺序.
1. 第一次整体代码进入`macro-task`。`micro-task`为空。
2. `macro-task`执行整体代码，`setTimeout`加入下一次的`macro-task`。
`Promise`执行打出`2 3`，`then`加入`micro-task`， 最后打出`5`。
3. `micro-task`执行`then`被执行所以打出`4`。
4. 重新执行`macro-task`所以打出`1`


但是在`bluebird`里的`then`使用`setImmediate`所以上面的步骤会变成：
- 步骤2`then`在`setTimeout`后加入`macro-task`。
- 步骤3会因为`micro-task`为空跳过。
- 步骤4 执行`setTimeout`，`then`打出`1 4`。

### Promise执行流程
1. new Promise(func:(resolve, reject)=> void 0), 这里的func方法被同步执行。
2. `Promise` 会有三种状态`PENDING(执行)`，`FULFILLED(执行成功）`,`REJECTED(执行失败)`。
3. 在`resolve`，`reject`均未调用且未发生异常时状态为`PENDING`。
4. `resolve`调用为`FULFILLED`,`reject`调用或者发生异常为`REJECTED`。
5. 在给`Promise`实例调用`then(callFulfilled, callRejected)`来设置回调，状态不为`PENDING`时会根据状态调用`callFulfilled`和`callRejected`。
6. `then`需要返回一个新的`Promise`实例.
7. 状态为`PENDING`则会把`callFulfilled`和`callRejected`放入当前`Promise`实例的回调队列中,队列还会存储新的`Promise`实例。
8. 在状态改变为`FULFILLED`或`REJECTED`时会回调当前`Promise`实例的队列。

## 二、Promise的简易实现
### 1. Promise Api
下面是`Promise`的所有开放api这里为了区分与原生的所以类名叫`Appoint`。
顺便为了学习`typescript`
``` typescript
class Appoint {
    public static resolve(value): Appoint
    public static reject(error): Appoint
    public static all(iterable: Appoint[]): Appoint
    public static race(iterable): Appoint
    constructor<U>(resolver: () => U)
    public then<U>(
        onFulfilled?: (value: any) => U,
        onRejected?: (error: any) => U,
    ): Appoint
    public catch(onRejected: (error: any) => U): Appoint
}
```
