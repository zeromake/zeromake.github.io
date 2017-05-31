title: vue_not_webpack_router_async
date: 2016-11-7 17:13:25
tags: [vue2, router, async]
last_date: 2016-11-7 18:00:20

# vue不使用webpack,vue_router怎么异步

公司项目都是后台管理项，肯定是导航加主显示区的方式切换，然后就想着用vue_router看看。
然后发现vue_router的component是同步加载的。。要是后台功能多js就很大了，这个就是所谓的单页应用。
但是单页应用不用webpack打包手动把js写一个也太蛋疼了。然后发现了webpack用chunk可以异步会把每个路由的js单独打包。
具体的原理下面也会讲解。

## 零、一些注意事项
1. 源码在[这里](https://github.com/zeromake/vue_demo)


## 一、vue_router_demo

先来个vue_router的demo用requirejs加载其它js。

### vue_router_demo.html

``` html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Title</title>
    <script type="text/javascript" data-main="js/main.js"
	src="./bower_components/requirejs/require.js"></script>
</head>
<body>
<div id="app">
</div>
</body>
</html>

```

### js/main.js
``` javascript
(function(require, define) {
    require.config({
        paths: {
            'vue': 'https://cdn.bootcss.com/vue/2.0.5/vue',
            'vue-router': 'https://cdn.bootcss.com/vue-router/2.0.1/vue-router'
        }
    });

    define(function(require, exports, module) {
        var Vue = require('vue');
        var VueRouter = require('vue-router');
        Vue.use(VueRouter);
        var router = new VueRouter({
            routes: [{
                    path: '/component1',
                    component: function(resolve) {
                        resolve(require('js/component1.js'));
                    }
                },
                {
                    path: '/component2',
                    component: function(resolve) {
                        resolve(require('js/component2.js'));
                    }
                },
            ]
        })
        var app = new Vue({
            el: '#app',
            router: router,
            template: '<div class="content">\
			<h1>Hello Content!</h1>\
			<p>\
			 <router-link to="/component1">Go to Component1</router-link>\
			 <router-link to="/component2">Go to Component2</router-link>\
			</p>\
			<router-view></router-view>\
			</div>'
        });
    });
})(require, define);

```

### js/component1.js

``` javascript
(function(define){
    define(function(require, exports, module){
        return {
            template: '<span>component1</span>'
        }
    });
})(define);

```
我看了webpack的.vue编译完后导出的对象也不过是有特定属性的对象，必须有`template`或者`render`其中一个。

### js/component2.js

``` javascript
(function(define){
    define(function(require, exports, module){
        return {
            template: '<h1>component2</h1>'
        }
    });
})(define);

```
再来一个不一样的。

### 示例效果图
![vue_router_demo](/public/img/vue_not_webpack_router-async/vue_router_demo.gif)

### 源码

在git仓库的vue_router_demo分支。

### 总结
看了图我想你已经发现了问题明明`component`用的require但是怎么回事第一次刷新首页都引入了。
实际上因为requirejs的require会收集所有使用require的地方并一同加载甚至定义一个方法里就require一个模块，也会预先加载js。
这个结果照成我们的异步变成了多文件SPA在一开始就会把所有模块导入。如果想做这样的SPA不要使用这样的方法，请使用webpack打包成一个文件减少请求。


## 二、vue_router_async_demo

现在我们就来一步步分析怎么做到。

### 查找资料

通过搜索引擎的查找翻到了一篇博文[分享（Angular 和 Vue）按需加载的项目实践优化方案](http://www.cnblogs.com/Kummy/p/5254754.html)
里面给了他的参考资料：

> 1. [异步组件](https://cn.vuejs.org/v2/guide/components.html#%E5%BC%82%E6%AD%A5%E7%BB%84%E4%BB%B6)
> 2. [webpack](http://webpack.github.io/docs/code-splitting.html)

然后我写了一个测试效果是我想要的异步。然后看了生成的代码异步用的js的开头`webpackJsonp([1,3],[...])`。
而导入模块的地方使用`__webpack_require__([1,3], resolve)`还有`__webpack_require__`中有这样一段代码:
``` javascript
var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.charset = 'utf-8';
script.async = true;
script.src = ''// del;
head.appendChild(script);
```
这下就明白了`__webpack_require__(chunkIds, callback)`调用后查找是否已有`chunkIds`的模块有的话通过`callback`调用返回。
没有就通过`chunkIds`找到文件并在`head`中添加一个`script`加载新js然后js中调用`webpackJsonp`并通过`callback`返回模块。

好了这下找到方法了我们自己写个`webpackJsonp`和`webpack_require`就好了。代码可能有点多用注释的方式来解释。

### js/webpackjsonp.js

``` javascript
(function(define) {
    define(function() {
        // 模块缓存区。
        var webpackJsonpModule = {};
        // 回调方法缓存区。
        var webpackInstallModule = {};
        // 引入的js所需调用的方法。
        var webpackJsonpCallback = function webpackJsonpCallback_(chunkName, Module) {
            // 判断模块名
            if (webpackJsonpModule[chunkName]) {
                console.warn('模块名: ' + chunkName + '已存在!为其旧模块重命名到:' + chunkName + '_')
                webpackJsonpModule[chunkName + '_'] = webpackJsonpModule[chunkName];
            }
            // 调用模块的方法获得模块并设置到模块缓存区。
            webpackJsonpModule[chunkName] = Module();
            // 取出回调方法
            resolve = webpackInstallModule[chunkName]
            if (resolve) {
                // 调用回调方法
                resolve(webpackJsonpModule[chunkName]);
                // 删除已有回调方法
                webpackInstallModule[chunkName] = undefined;
            }
        };
        // 添加script标签.
        var webpackJsonp = function webpackJsonp_(chunkName, resolve) {
                webpackInstallModule[chunkName] = resolve;
                var head = document.getElementsByTagName('head')[0];
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.charset = 'utf-8';
                script.async = true;
                script.src = chunkName;
                head.appendChild(script);
            }
            // 获取模块方法。
        var webpack_require = function webpack_require_(chunkName, resolve) {
                if (chunkName) {
                    var Module = webpackJsonpModule[chunkName];
                    if (Module) {
                        resolve(Module);
                    } else {
                        webpackJsonp(chunkName, resolve)
                    }
                }
            }
            // 将webpackJsonpCallback设置到全局上。
        window['webpackJsonpCallback'] = webpackJsonpCallback;
        // 返回webpack_require给requirejs调用。
        return webpack_require;
    });
})(define);

```
好了有了这个就可以做下面的了。


### js/main.js
``` javascript
(function(require, define) {
    require.config({
        paths: {
            'vue': 'https://cdn.bootcss.com/vue/2.0.5/vue',
            'vue-router': 'https://cdn.bootcss.com/vue-router/2.0.1/vue-router',
            'webpackjsonp': '/js/webpackjsonp'
        }
    });

    define(function(require, exports, module) {
        var Vue = require('vue');
        var VueRouter = require('vue-router');
        Vue.use(VueRouter);
        var webpack_require = require('webpackjsonp');
        var router = new VueRouter({
            routes: [{
                    path: '/component1',
                    component: function(resolve) {
                        webpack_require('/js/component1.js', resolve);
                    }
                },
                {
                    path: '/component2',
                    component: function(resolve) {
                        webpack_require('/js/component2.js', resolve);
                    }
                },
            ]
        })
        var app = new Vue({
            el: '#app',
            router: router,
            template: '<div class="content">\
			<h1>Hello Content!</h1>\
			<p>\
			 <router-link to="/component1">Go to Component1</router-link>\
			 <router-link to="/component2">Go to Component2</router-link>\
			</p>\
			<router-view></router-view>\
			</div>'
        });
    });
})(require, define);

```
html不变把里面的component改好即可

### js/component1.js

``` javascript
(function(define) {
    define('/js/component1.js', function(require, exports, module) {
        return {
            template: '<span>component1</span>'
        }
    });
})(webpackJsonpCallback);

```
这个改动就比较大了。

### js/component2.js

``` javascript
(function(define) {
    define('/js/component2.js', function(require, exports, module) {
        return {
            template: '<h1>component2</h1>'
        }
    });
})(webpackJsonpCallback);

```
多了一个模块名。。这样效果不是很好希望下回能研究出不需要模块名的。

### 效果图
![vue_router_async_demo](/public/img/vue_not_webpack_router-async/vue_router_async_demo.gif)

### 源码

在git仓库的vue_router_async_demo分支。

