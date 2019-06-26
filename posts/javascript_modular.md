---
title: javascript的模块化
date: 2016-8-12 12:18:25+08:00
type: modular
tags: [javascript, amd, cmd, commonjs, umd]
last_date: 2016-8-12 14:09:50+08:00
---
## 一、为何而生
---

这个些模块加载都是为了更好的管理 js 文件，以及引用其他文件更加方便，并且使每一个模块的全局域不再互相污染。模块化后可以使用`npm`进行管理以便分享。

<!--more-->

## 二、模块加载规范

---

### 1.CommonJS

官网: [http://www.commonjs.org](http://www.commonjs.org)
现常用于`nodejs`,每一个文件都是一个模块,使用`require`方法引入文件它会把引入的文件执行并最后将文件中的 exports 对象返回.这样好处就是不再污染全局域.但是有一点它是同步的就是你引入了就会加载文件.
官方说明可以使用在浏览器环境上，当然并没有人用.
你可以把每个 require 的 js 文件都是被包在一个方法里的。
然后外部通过执行这个方法后。

```javascript
var exports = {
}
var module = {
    exports: exports
}
var require = function(name) {
    ...
}
(function(exports, module, ) {

})(exports, module, require)
```

### 2.AMD(Asynchronous Module Definition)规范

规范文档: [https://github.com/amdjs/amdjs-api/wiki/AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)
因为上面的 CommonJS 不合适使用在浏览器环境中所以有了 amd。它采用异步方式加载模块
amd 定义也使用`require`加载模块

```javascript
require([module], callback([module]));
```

定义模块 module-name 可选 module 依赖的模块,加载后的 callback 执行并将 module 依赖作为参数传入

```
define(module-name, [module], callback([module]));
```

一个示例只有 require 加载完成模块后才会调用回调.

```
require(['math'], function (math) {
   math.add(2, 3);
});
```

实现了 AMD 规范的 js 库: 最火的是 require.js

> -   require.js: [http://requirejs.org](http://requirejs.org)

### 3.CMD(Common Module Definition)规范

规范文档: [https://github.com/cmdjs/specification/blob/master/draft/module.md](https://github.com/cmdjs/specification/blob/master/draft/module.md)
基本和 AMD 差不多唯一不一样的是模块依赖设置不再直接使用 require 设置参数

````javascript
define(function(require, exports, module) {
    //使用require
    var $ = require("jquery");
    //给exports设置属性
    exports.test = function() {};
    //或者使用module.export返回模块对象
    module.export = {
        //```
    };
});
````

这样的好处不用在参数中声明.
实现库:

> -   sea.js:[http://seajs.org](http://seajs.org)

### 4.ES6 模块

和 CommonJS 类似使用 import 导入兼容 CommonJS.查找模块方式和 CommonJS 一样

```javascript
import jquery from "jquery";
```

export 在 es6 模块导入时使用是一个关键字可以多次使用

```javascript
export function test() {}
export class Demo {}
```

### 5.UMD 规范

规范文档: [https://github.com/umdjs/umd](https://github.com/umdjs/umd)
UMD 支持通用三种模块 CommonJS,AMD,window(全局变量挂载)

```javascript
(function (root, factory) {
    //模块名
    var module_name = "xxx";
    //判断是否为CommonJS
    if (typeof exports === 'object' && typeof require === "function") {
        module.exports = factory(require('xxx'),...);
    //判断是否为amd
    } else if (typeof define === 'function' && define.amd) {
        define([module],factory);
    //判断是否为全局变量挂载
    } else {
        root[module_name] = factory(root.xxx,...);
    }
})(this, function ([module]) {
    //module ...
    return {};
});
```
