---
title: vue 不使用构建工具
date: 2016-11-04T05:10:25.000Z
tags:
  - vue2
  - requirejs
lastmod: 2016-11-04T07:07:50.000Z
categories:
  - vue
slug: vue_not_webpack
draft: false
---

看到各种 vue 入门全部都是 webpack 的我表示没有什么问题。但是却发觉无法将这些 webpack 的工作流推荐给其它人。一说 npm,webpack,babel 什么的纷纷表示太麻烦。

也许他们还是更喜欢 cdn 引入，手写 js 吧。所以这个就是纯粹的 vue 不用 webpack 不用 babel。直接用我们喜欢的 es5 的 js 写。等到觉得 vue 的好再推荐他们 webpack 什么的。

然后模块化还是需要一个所有我选择了 requirejs。

<!--more-->

## 零、文章中的一些定义

1. 所有的 js 与 css 库都会使用 cdn。
2. 一些需要修改的库无法使用 cdn 的会说明。
3. cdn 使用 bootcdn 对应国内环境
4. 这里面说到的 vue 源码均为 2.0.3
5. 源码下载: [地址](https://github.com/zeromake/vue_demo)

## 一、Hello World

### hello_world.html

```html
<!DOCTYPE html>
<html lang="zh">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>hello_world</title>
        <script
            type="text/javascript"
            src="https://cdn.bootcss.com/vue/2.0.3/vue.js"
        ></script>
    </head>
    <body>
        <div id="app">
            <!--你可以在这里写模板也可以在js的Vue实例中写-->
        </div>
        <script src="js/hello_world.js"></script>
    </body>
</html>
```

以上开头引入了 vue 并在 body 中写了一个 id 为`app`的 div，其中 vue 的模板我们可以直接写在这个 div 中也可以写在 js 的 vue 实例的 template 中。然后在 body 中的最后引入入口 js/hello_world.js。

### js/hello_world.js

```javascript
new Vue(
	el:'#app',
	data: {
		mes: 'hello vue'
	},
	template: '<span>{{mes}}</span>'
);
```

el 表示 vue 的实例挂载点，看了 vue 源码使用的是`document.querySelector`,(vue/src/platforms/web/util/index.js#15)。
选择失败会使用`document.createElement`,(vue/src/platforms/web/util/index.js#20)为我们生成一个 div。所以`document.querySelector`能支持的 vue 就能支持。

data 表示 vue 实例的属性。可以被 template 通过{{}}表达式访问

template 表示模板里面的文字会被编译后转换到挂载点上

### 效果图

![hello_world](/public/img/vue_not_webpack/hello_world.png)

和我说的一样，但是你会说这样的不需要框架也能做啊，当然 vue 的效果不止这点先说个它的数据绑定看下面的 hello_world2

### 源码：

在 git 仓库的 hello_world 分支中

## 二、HelloWorld2

### js/hello_world.js

这边不需要修改其他的仅需要 js 即可

```javascript
new Vue({
    el: "#app",
    data: {
        mes: "hello vue"
    },
    template: '<div>\
	<input v-model="mes" type="text">\
	<br/>\
	<span>{{ mes }}</span>\
	</div>'
});
```

这里我写了一个 input 并在上面写了一个 vue 指令 v-model。这个是为 input 之类专用的指令可以把 input 的内容与 vue 实例里的属性绑定。input 的内容修改会改变 mes 然后因为 mes 改变了 span 中的 mes 重新生成了。

### 效果图

如果使用 vue 的 devtoolt 效果会更好能直接看到数据的变化。
![hello_world2](/public/img/vue_not_webpack/hello_world2.gif)

### 源码：

在 git 仓库的 hello_world2 分支中

## 三、使用 requirejs

在现在很多库都已经完全支持 amd 规范导入，十分推荐使用 requirejs。当然你使用了 webpack 就没有必要使用 requirejs。这里不说 requirejs 的好处，只是不使用 webpack 的话缺少一个模块化工具。

我们这边把上面第一个 hello_world 修改为 requirejs 的

### hello_requirejs.html

```html
<!DOCTYPE html>
<html lang="zh">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>hello_world</title>
        <script
            type="text/javascript"
            data-main="js/main.js"
            src="https://cdn.bootcss.com/require.js/2.3.2/require.min.js"
        ></script>
    </head>
    <body>
        <div id="app">
            <!--你可以在这里写模板也可以在js的Vue实例中写-->
        </div>
    </body>
</html>
```

### js/main.js

```javascript
// 习惯写iife了可以不需要
(function(require, define) {
    require.config({
        paths: {
            // vue cdn别名
            vue: "https://cdn.bootcss.com/vue/2.0.3/vue"
        }
    });
    // 下面的应该放到其他文件中
    define(function(require, exports, module) {
        // 使用别名加载vue
        var Vue = require("vue");
        new Vue({
            el: "#app",
            data: {
                mes: "hello vue to requirejs"
            },
            template: "<span>{{ mes }}</span>"
        });
    });
    /*另一种requirejs的模块声明
	define(['vue'], function(Vue){

	});
	*/
})(require, define);
```

### 效果图

这个没有必要效果图了。。

### 源码:

在 git 仓库的 hello_requirejs 分支中

## 四、使用其它 vue 库

这里我用[element-ui](https://github.com/ElemeFE/element)来做示例
使用 hello_requirejs 修改

### hello_requirejs.html

```html
<!DOCTYPE html>
<html lang="zh">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>hello_world</title>
        <link
            rel="stylesheet"
            href="https://cdn.bootcss.com/element-ui/1.0.0-rc.8/theme-default/index.css"
        />
        <script
            type="text/javascript"
            data-main="js/main.js"
            src="https://cdn.bootcss.com/require.js/2.3.2/require.min.js"
        ></script>
    </head>
    <body>
        <div id="app">
            <!--你可以在这里写模板也可以在js的Vue实例中写-->
        </div>
    </body>
</html>
```

增加一个 element 的 css。也可以使用 requirejs 的插件来加载 css

### js/main.js

```javascript
(function(require, define) {
    require.config({
        paths: {
            vue: "https://cdn.bootcss.com/vue/2.0.3/vue",
            // 使用cdn无法加载找了一下是因为define("ELEMENT",["vue"],t)多了一个"ELEMENT"参数
            element: "element"
        }
    });
    define(function(require, exports, module) {
        var element_ui = require("element");
        var Vue = require("vue");
        element_ui.install(Vue);
        new Vue({
            el: "#app",
            data: {
                mes: "hello_el-button"
            },
            template: "<el-button>{{ mes }}</el-button>"
        });
    });
})(require, define);
```

### 效果图

![hello_element](/public/img/vue_not_webpack/hello_element.png)

### 源码：

在 git 仓库的 hello_element 分支中
