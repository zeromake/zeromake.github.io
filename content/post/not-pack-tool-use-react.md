---
title: 在不使用 webpack，vite 的打包工具下使用 preact
date: 2024-07-15 15:36:00 +08:00
tags:
  - js
  - react
  - node
  - browser
lastmod: 2024-07-15 15:36:00 +08:00
categories:
  - js
slug: not-pack-tool-use-react
draft: false
---

## 前言

最近在做公司的新游戏，协议用的 ws，本来测试想直接用 [hoppscotch.io](https://hoppscotch.io) 发现根本不行，没法按逻辑一个个去请求……
但是必须立刻测试就想了一下用 html + js 写一个 demo 页面做简单的流程，然后因为是非常简单的 demo 完全不想使用任何打包工具，最后研究了一通发现这些质料太少了，最后找到了 [module](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules) + [importmap](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/script/type/importmap) 的方式来直接在浏览器里直接使用 `import` 和 `export`。


## 一、使用 jsdelivr + importmap 定义网页可以导入的模块

到 [jsdelivr](https://www.jsdelivr.com/?query=preact) 搜索需要的 npm 包，例如 [preact](https://www.jsdelivr.com/package/npm/preact) 的
![](/public/img/not-pack-tool-use-react/preact-jsdelivr-install.jpg)

选择 Type 的 ESM 选项拷贝 url 在 html 里编写 importmap

```html
<!doctype html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>示例</title>
  <script type="importmap">
    {
      "imports": {
        "preact": "https://cdn.jsdelivr.net/npm/preact@10.22.1/+esm"
      }
    }
  </script>
</head>
<body>
  <script defer type="module">
    import {h} from 'preact';
    console.log(h);
  </script>
</body>
</html>
```

使用浏览器打开该 [demo1.html](/public/not-pack-tool-use-react/demo1.html) 可以看到控制台正确的打印出了 `function m(n, t, _)`。

## 二、简单的 preact/hooks 例子

如何找到 preact/hooks 包呢，打开 [jsdelivr preact](https://www.jsdelivr.com/package/npm/preact?tab=files) 点击下面的 hooks 文件夹，可以看到 [hooks/package.json](https://fastly.jsdelivr.net/npm/preact@10.22.1/hooks/package.json) 看到 `module` 字段对应到 `dist/hooks.module.js` 所以 `preact/hooks` 的 url 就是 `https://fastly.jsdelivr.net/npm/preact@10.22.1/hooks/dist/hooks.module.js`

```html
<!doctype html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>示例</title>
  <script type="importmap">
    {
      "imports": {
        "preact": "https://cdn.jsdelivr.net/npm/preact@10.22.1/+esm",
        "preact/hooks": "https://fastly.jsdelivr.net/npm/preact@10.22.1/hooks/dist/hooks.module.js"
      }
    }
  </script>
</head>
<body>
  <script defer type="module">
    import {h, render} from 'preact';
    import {useState} from 'preact/hooks';
    const App = () => {
        const [count, setCount] = useState(0);
        return h('div', {children: [
            h('p', {children: [`count is ${count}`]}),
            h('button', {children: ['incr'], onClick: () => setCount(count + 1)})
        ]});
    };
    render(h(App), document.body);
  </script>
</body>
</html>
```

使用浏览器打开该 [demo2.html](/public/not-pack-tool-use-react/demo2.html) 可以看一个自增数字例子

## 三、使用 htm 来编写 jsx

上面使用手写的 jsx 很累人，是否有更好的选择呢，答案就是 [htm](https://github.com/developit/htm) 语法几乎和 jsx 一样。

我使用下来只找到下面的区别：

|说明|jsx|htm|
|---|---|----|
| 引用组件(例如 Button) | `<Button/>` | `<${Button}/>`|
| 属性使用变量 | `<div class={avatar}/>` | `<div class=${avatar}/>`|
| 闭合标签缩写 | - | `<div>……<//>`|


```html
<!doctype html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>示例</title>
  <script type="importmap">
    {
      "imports": {
        "preact": "https://cdn.jsdelivr.net/npm/preact@10.22.1/+esm",
        "preact/hooks": "https://fastly.jsdelivr.net/npm/preact@10.22.1/hooks/dist/hooks.module.js",
        "htm": "https://cdn.jsdelivr.net/npm/htm@3.1.1/+esm"
      }
    }
  </script>
</head>
<body>
  <script defer type="module">
    import {h, render} from 'preact';
    import {useState} from 'preact/hooks';
    import htm from 'htm';
    const html = htm.bind(h);
    const App = () => {
        const [count, setCount] = useState(0);
        return html`<div>
          <p>count is ${count}<//>
          <button onClick=${() => setCount(count + 1)}>incr<//>
        <//>`
    };
    render(html`<${App}/>`, document.body);
  </script>
</body>
</html>
```
使用浏览器打开该 [demo3.html](/public/not-pack-tool-use-react/demo3.html) 可以看一个使用 htm 的自增数字例子

## 四、preact 的 history 路由支持

找了一下能用的路由，发现 preact 推荐的两个路由:

- [preact-router](https://github.com/developit/preact-router) 已经无人维护
- [preact-iso](https://github.com/preactjs/preact-iso) 不支持 history
- [react-router](https://github.com/remix-run/react-router) 库太大了
- [wouter](https://github.com/molefrog/wouter) 够小

打算使用 [wouter](https://github.com/molefrog/wouter)。

下面是示例：
```html
<!doctype html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>demo3</title>
  <script type="importmap">
    {
      "imports": {
        "preact": "https://cdn.jsdelivr.net/npm/preact@10.22.1/+esm",
        "preact/hooks": "https://fastly.jsdelivr.net/npm/preact@10.22.1/hooks/dist/hooks.module.js",
        "htm": "https://cdn.jsdelivr.net/npm/htm@3.1.1/+esm",
        "wouter-preact": "https://fastly.jsdelivr.net/npm/wouter-preact@3.3.1/esm/index.js",
        "wouter-preact/use-hash-location": "https://fastly.jsdelivr.net/npm/wouter-preact@3.3.1/esm/use-hash-location.js",
        "regexparam": "https://fastly.jsdelivr.net/npm/regexparam@3.0.0/dist/index.mjs"
      }
    }
  </script>
</head>
<body>
  <script defer type="module">
    import {h, render} from 'preact';
    import {useState} from 'preact/hooks';
    import htm from 'htm';
    import {Router, Route, Link} from 'wouter-preact';
    import {useHashLocation} from 'wouter-preact/use-hash-location';

    const html = htm.bind(h);
    const Counter = () => {
        const [count, setCount] = useState(0);
        return html`<div>
          <p>count is ${count}<//>
          <button onClick=${() => setCount(count + 1)}>incr<//>
          <${Link} href="/">go<//>
        <//>`
    };
    const Home = () => {
        return html`<div>
          <h1>Home</h1>
          <${Link} href="/counter">go<//>
        <//>`
    };

    const App = () => {
        return html`<${Router} hook=${useHashLocation}>
          <${Route} path="/" component=${Home}/>
          <${Route} path="/counter" component=${Counter}/>
        <//>`
    };
    render(html`<${App}/>`, document.body);
  </script>
</body>
</html>
```
使用浏览器打开该 [demo4.html](/public/not-pack-tool-use-react/demo4.html) 可以看到一个简单的 history 路由示例

## 五、使用 hook 编写一个简单的异步加载组件

**lazy.module.js:**
```js
import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';

export default function lazy(load) {
	let component = null;
	return props => {
		const [, update] = useState(false);
        useEffect(() => {
            if (component !== null) return;
            load().then((m) => {
                component = m.default || m;
                update(true);
            });
        }, []);
        return component !== null ? h(component, props) : null;
	};
}
```

**htm.module.js:**
```js
import {h} from 'preact';
import htm from 'htm';

export default htm.bind(h);
```
htm 绑定单独作为一个模块引入

**demo5.html:**
```html
<!doctype html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>demo3</title>
  <script type="importmap">
    {
      "imports": {
        "preact": "https://cdn.jsdelivr.net/npm/preact@10.22.1/+esm",
        "preact/hooks": "https://fastly.jsdelivr.net/npm/preact@10.22.1/hooks/dist/hooks.module.js",
        "htm": "https://cdn.jsdelivr.net/npm/htm@3.1.1/+esm",
        "wouter-preact": "https://fastly.jsdelivr.net/npm/wouter-preact@3.3.1/esm/index.js",
        "wouter-preact/use-hash-location": "https://fastly.jsdelivr.net/npm/wouter-preact@3.3.1/esm/use-hash-location.js",
        "regexparam": "https://fastly.jsdelivr.net/npm/regexparam@3.0.0/dist/index.mjs"
      }
    }
  </script>
</head>
<body>
  <script defer type="module">
    import {render} from 'preact';
    import {useState} from 'preact/hooks';
    import {Router, Route, Link} from 'wouter-preact';
    import {useHashLocation} from 'wouter-preact/use-hash-location';
    import lazy from './lazy.module.js';
    import html from './htm.module.js';
    const Counter = lazy(() => import('./counter.module.js'));
    const Home = () => {
        return html`<div>
          <h1>Home</h1>
          <${Link} href="/counter">go<//>
        <//>`
    };

    const App = () => {
        return html`<${Router} hook=${useHashLocation}>
          <${Route} path="/" component=${Home}/>
          <${Route} path="/counter" component=${Counter}/>
        <//>`
    };
    render(html`<${App}/>`, document.body);
  </script>
</body>
</html>
```

使用浏览器打开该 [demo5.html](/public/not-pack-tool-use-react/demo5.html) 查看真实示例

## 六、安装 node 包获得对应的 ts 语法提示

没有什么特别的操作，安装 node 包即可获得在 IDEA 和 vscode 的 ts 语法提示。

## 后语

至此就可以不借助任何工具在浏览器里直接开发而且支持 module 的导入导出，动态导入，jsx 语法，ts 提示。

以上的 demo 都是 preact 但是，完全可以等效替代为 `react` 或者 `solidjs`。

还有就是直接使用 jsdelivr 引入是很方便，但是有些情况下依赖比较复杂的时候就比较麻烦了，`ahooks` 就是一个 es 模块下引入了太多模块，手写 importmap 太累人了。

## 参考

1. [script 的 module](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
2. [script 的 importmap](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/script/type/importmap)
3. [htm 一种在 js 字符串模版语法里编写 jsx 的方案](https://github.com/developit/htm)
4. [awesome-preact](https://github.com/preactjs/awesome-preact)
