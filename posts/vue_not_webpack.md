title: Vue2(not_webpack)
date: 2016-11-4 13:10:25+08:00
tags: [vue2, requirejs]
last_date: 2016-11-4 15:07:50+08:00

看到各种vue入门全部都是webpack的我表示没有什么问题。但是却发觉无法将这些webpack的工作流推荐给其它人。一说npm,webpack,babel什么的纷纷表示太麻烦。

也许他们还是更喜欢cdn引入，手写js吧。所以这个就是纯粹的vue不用webpack不用babel。直接用我们喜欢的es5的js写。等到觉得vue的好再推荐他们webpack什么的。

然后模块化还是需要一个所有我选择了requirejs。


## 零、文章中的一些定义
1. 所有的js与css库都会使用cdn。
2. 一些需要修改的库无法使用cdn的会说明。
3. cdn使用bootcdn对应国内环境
4. 这里面说到的vue源码均为2.0.3
5. 源码下载: [地址](https://github.com/zeromake/vue_demo)

## 一、Hello World

### hello_world.html

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>hello_world</title>
    <script type="text/javascript"
    src="https://cdn.bootcss.com/vue/2.0.3/vue.js"></script>
</head>
<body>
<div id="app">
<!--你可以在这里写模板也可以在js的Vue实例中写-->
</div>
<script src="js/hello_world.js"></script>
</body>
</html>
```
以上开头引入了vue并在body中写了一个id为`app`的div，其中vue的模板我们可以直接写在这个div中也可以写在js的vue实例的template中。然后在body中的最后引入入口js/hello_world.js。
### js/hello_world.js

``` javascript
new Vue(
	el:'#app',
	data: {
		mes: 'hello vue'
	},
	template: '<span>{{mes}}</span>'
);
```
el表示vue的实例挂载点，看了vue源码使用的是`document.querySelector`,(vue/src/platforms/web/util/index.js#15)。
选择失败会使用`document.createElement`,(vue/src/platforms/web/util/index.js#20)为我们生成一个div。所以`document.querySelector`能支持的vue就能支持。

data表示vue实例的属性。可以被template通过{{}}表达式访问

template表示模板里面的文字会被编译后转换到挂载点上

### 效果图

 ![hello_world](/public/img/vue_not_webpack/hello_world.png)

和我说的一样，但是你会说这样的不需要框架也能做啊，当然vue的效果不止这点先说个它的数据绑定看下面的hello_world2

### 源码：

在git仓库的hello_world分支中

## 二、HelloWorld2
### js/hello_world.js
这边不需要修改其他的仅需要js即可
``` javascript
new Vue({
	el:'#app',
	data: {
		mes: 'hello vue'
	},
	template: '<div>\
	<input v-model="mes" type="text">\
	<br/>\
	<span>{{ mes }}</span>\
	</div>'
});
```
这里我写了一个input并在上面写了一个vue指令v-model。这个是为input之类专用的指令可以把input的内容与vue实例里的属性绑定。input的内容修改会改变mes然后因为mes改变了span中的mes重新生成了。
### 效果图
如果使用vue的devtoolt效果会更好能直接看到数据的变化。
  ![hello_world2](/public/img/vue_not_webpack/hello_world2.gif)

### 源码：

在git仓库的hello_world2分支中

## 三、使用requirejs

在现在很多库都已经完全支持amd规范导入，十分推荐使用requirejs。当然你使用了webpack就没有必要使用requirejs。这里不说requirejs的好处，只是不使用webpack的话缺少一个模块化工具。

我们这边把上面第一个hello_world修改为requirejs的
### hello_requirejs.html
```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>hello_world</title>
    <script type="text/javascript" data-main="js/main.js" src="https://cdn.bootcss.com/require.js/2.3.2/require.min.js"></script>
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
(function(require, define){
	require.config({
        paths: {
			// vue cdn别名
            'vue': 'https://cdn.bootcss.com/vue/2.0.3/vue',
        }
    });
	// 下面的应该放到其他文件中
	define(function (require, exports, module) {
		// 使用别名加载vue
		var Vue = require('vue');
		new Vue({
			el: '#app',
			data: {
				mes: 'hello vue to requirejs'
			},
			template: '<span>{{ mes }}</span>'
		})
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
在git仓库的hello_requirejs分支中

## 四、使用其它vue库
这里我用[element-ui](https://github.com/ElemeFE/element)来做示例
使用hello_requirejs修改
### hello_requirejs.html
``` html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>hello_world</title>
	<link rel="stylesheet" href="https://cdn.bootcss.com/element-ui/1.0.0-rc.8/theme-default/index.css">
    <script type="text/javascript" data-main="js/main.js" src="https://cdn.bootcss.com/require.js/2.3.2/require.min.js"></script>
</head>
<body>
<div id="app">
<!--你可以在这里写模板也可以在js的Vue实例中写-->
</div>
</body>
</html>
```
增加一个element的css。也可以使用requirejs的插件来加载css
### js/main.js
``` javascript
(function(require, define){
	require.config({
        paths: {
            'vue': 'https://cdn.bootcss.com/vue/2.0.3/vue',
			// 使用cdn无法加载找了一下是因为define("ELEMENT",["vue"],t)多了一个"ELEMENT"参数
			'element': 'element'
        }
    });
	define(function (require, exports, module) {
		var element_ui = require('element');
		var Vue = require('vue');
		element_ui.install(Vue);
		new Vue({
			el: '#app',
			data: {
				mes: 'hello_el-button'
			},
			template: '<el-button>{{ mes }}</el-button>'
		})
	});
})(require, define);
```
### 效果图

![hello_element](/public/img/vue_not_webpack/hello_element.png)

### 源码：
在git仓库的hello_element分支中
