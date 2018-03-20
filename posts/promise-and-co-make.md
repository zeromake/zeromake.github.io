---
title: promise-and-co-make
date: 2017-07-10 15:24:39+08:00
type: source
tags: [promise, co, async]
last_date: 2017-07-10 15:24:39+08:00
...

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
2. `macro-task`执行整体代码，`setTimeout`加入下一次的`macro-task`。`Promise`执行打出`2 3`，`then`加入`micro-task`， 最后打出`5`。
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

- Promise Api

下面是`Promise`的所有开放api这里为了区分与原生的所以类名叫`Appoint`。
顺便为了学习`typescript`

``` typescript
class Appoint {
    public constructor(resolver: Function){};
    public then(onFulfilled, onRejected): Appoint {};
    public catch(onRejected): Appoint {};
    public static resolve(value): Appoint {};
    public static reject(error): Appoint {};
    public static all(iterable: Appoint[]): Appoint {};
    public static race(iterable): Appoint {};
}
```

### Appoint

``` typescript
function INTERNAL() {}
enum AppointState {
    PENDING,
    FULFILLED,
    REJECTED,
}
class Appoint {
    public handled: boolean;
    public value: any;
    public queue: QueueItem[];
    private state: AppointState;
    public constructor(resolver: Function){
        if (!isFunction(resolver)) {
            throw new TypeError("resolver must be a function");
        }
        // 设置当前实例状态
        this.state = AppointState.PENDING;
        this.value = void 0;
        // 初始化回调队列
        this.queue = [];
        // true代表没有设置then
        this.handled = true;
        if (resolver !== INTERNAL) {
            // 安全执行传入的函数
            safelyResolveThen(this, resolver);
        }
    }
    // state 的getset
    public setState(state: AppointState) {
        if (this.state === AppointState.PENDING && this.state !== state) {
            this.state = state;
        }
    }
    public getState(): AppointState {
        return this.state;
    }
}
```

### safelyResolveThen

``` typescript
function safelyResolveThen(self: Appoint, then: (arg: any) => any) {
    let called: boolean = false;
    try {
        then(function resolvePromise(value: any) {
            if (called) {
                return;
            }
            // 保证doResolve，doReject只执行一次
            called = true;
            // 改变当前状态以及调用回调队列
            doResolve(self, value);
        }, function rejectPromise(error: Error) {
            if (called) {
                return;
            }
            // 同上
            called = true;
            doReject(self, error);
        });
    } catch (error) {
        // 特别捕捉错误
        if (called) {
            return;
        }
        called = true;
        doReject(self, error);
    }
}
```

### doResolve, doReject

``` typescript
/**
* 如果value不是一个Promise，对Promise调用回调队列。
* 如果是就等待这个Promise回调
*/
function doResolve(self: Appoint, value: any) {
    try {
        // 判断是否为Promise
        const then = getThen(value);
        if (then) {
            //
            safelyResolveThen(self, then);
        } else {
            // 改变状态
            self.setState(AppointState.FULFILLED);
            self.value = value;
            // 调用回调队列
            self.queue.forEach((queueItem) => {
                queueItem.callFulfilled(value);
            });
        }
        return self;
    } catch (error) {
        return doReject(self, error);
    }
}
/**
* 调用回调队列
*/
function doReject(self: Appoint, error: Error) {
    // 改变状态
    self.setState(AppointState.REJECTED);
    self.value = error;
    if (self.handled) {
        // 未设置then回调
        asap(() => {
            // 创建一个异步任务保证代码都执行了再判断
            if (self.handled) {
                if (typeof process !== "undefined") {
                    // node 环境下触发unhandledRejection事件
                    process.emit("unhandledRejection", error, self);
                } else {
                    // 浏览器环境直接打印即可
                    console.error(error);
                }
            }
        });
    }
    self.queue.forEach((queueItem) => {
        queueItem.callRejected(error);
    });
    return self;
}
/**
* 判断是否为Object且有then属性的方法,
* 有返回这个方法的绑定this
* 这种判断方式会发生如果
* resolve({ then: () => {} })的话就会丢失下次的then
* 原生的Promise也是相同
*/
function getThen(obj: any): Function {
    const then = obj && obj.then;
    if (obj && (isObject(obj) || isFunction(obj)) && isFunction(then){
        return then.bind(obj);
    }
    return null;
}
```

### Appoint().then, Appoint().catch

``` typescript
/**
* 使用micro-task的异步方案来执行方法
*/
function asap(callback) {
    if (typeof process !== "undefined") {
        process.nextTick(callback);
    } else {
        const BrowserMutationObserver = window.MutationObserver || window.WebKitMutationObserver
        let iterations = 0;
        const observer = new BrowserMutationObserver(callback);
        const node: any = document.createTextNode("");
        observer.observe(node, { characterData: true });
        node.data = (iterations = ++iterations % 2);
    }
}
/**
* 异步执行then,catch
*/
function unwrap(promise: Appoint, func: Function, value: any): void {
    asap(() => {
        let returnValue;
        try {
            // 执行then,catch回调获得返回值
            returnValue = func(value);
        } catch (error) {
            // 发生异常直接触发该promise的Reject
            return doReject(promise, error);
        }
        if (returnValue === promise) {
            // 执行then,catch回调返回值不能为promise自己
            doReject(promise, new TypeError("Cannot resolve promise with itself"));
        } else {
            // then,catch回调成功，直接触发该promise的Resolve
            doResolve(promise, returnValue);
        }
    });
}

public then<U>(
    onFulfilled?: (value?: any) => U,
    onRejected?: (error?: any) => U,
): Appoint {
    // 直接无视来做到值穿透
    if (!isFunction(onFulfilled) &&
        this.state === AppointState.FULFILLED ||
        !isFunction(onRejected) &&
        this.state === AppointState.REJECTED
    ) {
            return this;
    }
    // 新建一个空的
    const promise = new Appoint(INTERNAL);
    // 当前实例已经被设置then
    if (this.handled) {
        this.handled = false;
    }
    if (this.getState() !== AppointState.PENDING) {
        // 当前实例已经结束运行直接根据状态获取要回调的方法
        const resolver = this.getState() === AppointState.FULFILLED ? onFulfilled : onRejected;
        // 异步执行resolver,如果成功会触发新实例的then,catch
        unwrap(promise, resolver, this.value);
    } else {
        // 如果Promise的任务还在继续就直接把生成一个QueueItem
        // 并设置好新的Promise实例
        this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
    }
    // 返回新生成的
    return promise;
}
public catch<U>(onRejected: (error?: any) => U): Appoint {
    return this.then(null, onRejected);
}
```

### QueueItem

``` typescript
export class QueueItem {
    // 每次then|catch生成的新实例
    public promise: Appoint;
    // then回调
    public callFulfilled: Function;
    // catch回调
    public callRejected: Function;
    constructor(promise: Appoint, onFulfilled?: Function, onRejected?: Function {
        this.promise = promise;
        if (isFunction(onFulfilled)) {
            this.callFulfilled = function callFulfilled(value: any) {
                // 异步执行callFulfilled,后触发新实例的then,catch
                unwrap(this.promise, onFulfilled, value);
            };
        } else {
            this.callFulfilled = function callFulfilled(value: any) {
                // 没有设置callFulfilled的话直接触发新实例的callFulfilled
                /*
                例如下面这种代码一次catch但是没有then而下面代码中的then是catch返回的新实例
                所以需要直接
                new Promise(() => {
                })
                .catch(() => {})
                .then()
                */
                doResolve(this.promise, value);
            };
        }
        if (isFunction(onRejected)) {
            this.callRejected = function callRejected(error: Error) {
                // 异步执行callRejected,后会触发新实例的then,catch
                unwrap(this.promise, onRejected, error);
            };
        } else {
            this.callRejected = function callRejected(error: Error) {
                // 没有设置callRejected的话直接触发新实例的callRejected
                doReject(this.promise, error);
            };
        }
    }
}
```

### utils

``` typescript
export function isFunction(func: any): boolean {
    return typeof func === "function";
}
export function isObject(obj: any): boolean {
    return typeof obj === "object";
}
export function isArray(arr: any): boolean {
    return Object.prototype.toString.call(arr) === "[object Array]";
}
```

### Appoint.resolve, Appoint.reject

``` typescript
public static resolve(value: any): Appoint {
    if (value instanceof Appoint) {
        return value;
    }
    return doResolve(new Appoint(INTERNAL), value);
}
public static reject(error: any): Appoint {
    if (error instanceof Appoint) {
        return error;
    }
    return doReject(new Appoint(INTERNAL), error);
}
```

### Appoint.all, Appoint.race

``` typescript
/**
* 传入一个Promise数组生成新的Promise所有Promise执行完后回调
*/
public static all(iterable: Appoint[]): Appoint {
    const self = this;
    if (!isArray(iterable)) {
        return this.reject(new TypeError("must be an array"));
    }
    const len = iterable.length;
    let called = false;
    if (!len) {
        return this.resolve([]);
    }
    const values = new Array(len);
    let i: number = -1;
    const promise = new Appoint(INTERNAL);
    while (++i < len) {
        allResolver(iterable[i], i);
    }
    return promise;
    function allResolver(value: Appoint, index: number) {
        self.resolve(value).then(resolveFromAll, (error: Error) => {
            if (!called) {
                called = true;
                doReject(promise, error);
            }
        });
        function resolveFromAll(outValue: any) {
            values[index] = outValue;
            if (index === len - 1 && !called) {
                called = true;
                doResolve(promise, values);
            }
        }
    }
}
/**
* 与all类似但是，只要一个Promise回调的就回调
*/
public static race(iterable: Appoint[]): Appoint {
    const self = this;
    if (!isArray(iterable)) {
        return this.reject(new TypeError("must be an array"));
    }
    const len = iterable.length;
    let called = false;
    if (!len) {
        return this.resolve([]);
    }
    const values = new Array(len);
    let i: number = -1;
    const promise = new self(INTERNAL);
    while (++i < len) {
        resolver(iterable[i]);
    }
    return promise;
    function resolver(value: Appoint) {
        self.resolve(value).then((response: any) => {
            if (!called) {
                called = true;
                doResolve(promise, response);
            }
        }, (error: Error) => {
            if (!called) {
                called = true;
                doReject(promise, error);
            }
        });
    }
}
```

## 三、co 原理

不使用co的话不停的then，和callback明显会很难受。

``` javascript
function callback (null, name) {
    console.log(name)
}
new Promise(function(resolve) {
        resolve('<h1>test</h1>')
}).then(html => {
    setTimeout(function(){
        callback('test' + html)
    }, 100)
})

```

改用co异步代码感觉和写同步代码一样。

``` javascript
const co = require("co")
co(function *test()  {
    const html = yield new Promise(function(resolve) {
        resolve('<h1>test</h1>')
    })
    console.log('--------')
    const name = yield function (callback) {
        setTimeout(function(){
            callback(null, 'test' + html)
        }, 100)
    }
    return name
}).then(console.log)
```

这里不得不说下Generator了，直接看执行效果吧：

``` javascript
function *gen() {
    const a = yield 1
    console.log('a: ', a)
    const b = yield 2
    console.log('b: ', b)
    return 3
}
const test = gen()
test.next() // Object { value: 1, done: false }
test.next(4) // a: 4\n Object { value: 2, done: false }
test.next(5) // b: 5\n Object { value: 3, done: true }
```

很明显除了第一次`next`的参数都会赋值到上一次的`yield`的左边变量。
最后一次的`next`返回的`value`是`return`的值，其它都是`yield`右边的变量。
而`co`就是通过不停的`next`获取到支持的异步对象回调后把值放到下次的`next`中从而达到效果。

## 四、co 的实现

``` typescript
const slice = Array.prototype.slice;
const co: any = function co_(gen) {
    const ctx = this;
    const args = slice.call(arguments, 1);
    return new Promise(function _(resolve, reject) {
        // 把传入的方法执行一下并存下返回值
        if (typeof gen === "function") {
            gen = gen.apply(ctx, args);
        }
        // 1. 传入的是一个方法通过上面的执行获得的返回值，
        // 如果不是一个有next方法的对象直接resolve出去
        // 2. 传入的不是一个方法且不是一个next方法的对象直接resolve出去
        if (!gen || typeof gen.next !== "function") {
            return resolve(gen);
        }
        // 执行,第一次next不需要值
        onFulfilled();
        /**
            * @param {Mixed} res
            * @return {null}
            */
        function onFulfilled(res?: any) {
            let ret;
            try {
                // 获取next方法获得的对象，并把上一次的数据传递过去
                ret = gen.next(res);
            } catch (e) {
                // generator 获取下一个yield值发生异常
                return reject(e);
            }
            // 处理yield的值把它转换成promise并执行
            next(ret);
            return null;
        }
        /**
            * @param {Error} err
            * @return {undefined}
            */
        function onRejected(err) {
            let ret;
            try {
                // 把错误抛到generator里，并且接收下次的yield
                ret = gen.throw(err);
            } catch (e) {
                // generator 获取下一个yield值发生异常
                return reject(e);
            }
            // 处理yield的值
            next(ret);
        }
        function next(ret) {
            // generator执行完并把返回值resolve出去
            if (ret.done) {
                return resolve(ret.value);
            }
            // 把value转换成Promise
            const value = toPromise(ctx, ret.value);
            if (value && isPromise(value)) {
                // 等待Promise执行
                return value.then(onFulfilled, onRejected);
            }
            // yield的值不支持
            return onRejected(new TypeError("You may only yield a function, promise,"
                + " generator, array, or object, "
                + 'but the following object was passed: "' + String(ret.value) + '"'));
        }
    });
};
```

toPromise

``` typescript
function toPromise(ctx: any, obj: any) {
    if (!obj) { return obj; }
    if (isPromise(obj)) { return obj; }
    // 判断是 Generator 对象|方法 直接通过 co 转换为Promise
    if (isGeneratorFunction(obj) || isGenerator(obj)) {
        return co.call(ctx, obj);
    }
    // 判断是个回调方法
    if ("function" === typeof obj) {
        return thunkToPromise(ctx, obj);
    }
    // 判断是个数组
    if (Array.isArray(obj)) {
        return arrayToPromise(ctx, obj);
    }
    // 根据对象属性把所有属性转为一个Promise
    if (isObject(obj)) {
        return objectToPromise(ctx, obj);
    }
    // 基础数据类 1 , true
    return obj;
}
```

转换方法这个懒得说了

``` typescript
function thunkToPromise(ctx, fn) {
    return new Promise(function _p(resolve, reject) {
        fn.call(ctx, function _(err, res) {
            if (err) { return reject(err); }
            if (arguments.length > 2) {
                res = slice.call(arguments, 1);
            }
            resolve(res);
        });
    });
}

function arrayToPromise(ctx, obj: any[]) {
    return Promise.all(obj.map((item) => toPromise(ctx, item)));
}

function objectToPromise(ctx, obj) {
    const results = {};
    const keys = Object.keys(obj);
    const promises = [];
    for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        const val = obj[key];
        const promise = toPromise(ctx, val);
        if (promise && isPromise(promise)) {
            promises.push(promise.then(function _(res) {
                results[key] = res;
            }));
        } else {
            results[key] = val;
        }
    }
    return Promise.all(promises).then(function _() {
        return results;
    });
}
```

还有一些判断工具函数

``` typescript
function isPromise(obj: { then: Function) {
    return "function" === typeof obj.then;
}
function isGenerator(obj) {
    return "function" === typeof obj.next &&
        "function" === typeof obj.throw;
}
function isGeneratorFunction(obj) {
    const constructor = obj.constructor;
    if (!constructor) { return false; }
    if ("GeneratorFunction" === constructor.name ||
        "GeneratorFunction" === constructor.displayName) {
        return true;
    }
    return isGenerator(constructor.prototype);
}
function isObject(val) {
    return Object === val.constructor;
}
```

## 五、资料

1. [项目源代码](https://github.com/zeromake/appoint)
2. [深入 Promise(一)——Promise 实现详解](https://zhuanlan.zhihu.com/p/25178630)
3. [英文版Promise/A+](https://promisesaplus.com/)
4. [中文版Promise/A+](http://malcolmyu.github.io/malnote/2015/06/12/Promises-A-Plus/)

## 六、后记

1. 这次逼着自己写3天就写完了，果然就是懒。
2. 接下来写一个系列文章`preact`的源码解析与实现。
3. 尽量一周出一篇？看看情况吧。
