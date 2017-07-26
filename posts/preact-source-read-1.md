title: preact源码解读(1)
date: 2017-07-24 16:23:04
tags: [preact, source, read]
last_date: 2017-07-25 12:29:04

[TOC]

## 前言

- 和上次说的一样这次带来`preact`的解读
- preact实际上把它当作是一个精简版`react`就好了。
- 这次我抄下了`preact`，并且改写了代码, 命名为`zreact`
- 把之前将事件，props之类的单独放出来，这样这份`zreact`。
- 可以支持ie8，虽然并没有什么用。
- 这次代码解读顺序按使用preact的代码顺序。
- 这里是第一篇，createElement，也就是vue,react的render所返回的VNode对象。
- 平常则是使用babel+jsx来生成createElement调用。
- vue常用则是template，但是通过webpack会做到预先转换为render。

## 一、jsx的转换原理。

对于preact来说，最常见的就是jsx。
下面是一个最简单的使用preact。

``` javascript
import {h, render, Component} from "preact";

/** @jsx h */
// 通过上面的注释告诉babel使用什么方法作为VNode的创建函数。
// 如果不使用这个默认会是React.createElement,
// 或者通过下面的babel配置来修改
class App extends Component {
    render(props) {
        return <h1>App</h1>;
    }
}
var test = "";
render(
    <div className="test">
        <span style={test}>测试</span>
        <App></App>
    </div>
， document.body)
```

.babelrc

``` json
{
    "presets": ["es2015"],
    "plugins": [
        ["transform-react-jsx", { "pragma":"h" }]
    ]
}
```

通过babel转换后会变成

``` javascript
import {h, render} from "preact";

class App extends Component {
    render() {
        return h("h1", null, "App");
    }
}
var test = "";
render(
    h(
        "div",
        { className: "test" },
        h("span", { style: test }, "测试"),
        h(App)
    )，
    document.body
)
```

所以对于preact最先执行的东西是这个`h`函数也就是`createElement`
对于`jsx`标准的`createElement`函数签名为

``` typescript
interface IKeyValue {
    [name: string]: any;
}
/**
* 标准JSX转换函数
* @param {string|Component} nodeName 组件
* @param {IKeyValue} attributes 组件属性
* @param {any[]} childs 这个VNode的子组件
*/
function h(
    nodeName: string | function,
    attributes: IKeyValue,
    ...childs: any[]
): VNode;
class VNode {
    public nodeName: string| Component;
    public children: any[];
    public attributes: IKeyValue | undefined;
    public key: any | undefined;
}
```

所以这里的标准`jsx`非常简单。

1. 第一个参数为原生html组件或者`Component`类。
2. 第二个参数为该组件的属性，及自定义属性。
3. 第三个参数及后面的所有都是这个组件的子组件。
4. 其中第三个及后面的参数为数组就会被分解放入子组件中。
5. 最后返回一个`VNode`实例。

## 二、createElement的实现

``` typescript
function h(nodeName: string | Component, attributes: IKeyValue, ...args: any[]) {
    // 初始化子元素列表
    const stack: any[] = [];
    const children: any[] = [];
    // let i: number;
    // let child: any;
    // 是否为原生组件
    let simple: boolean;
    // 上一个子元素是否为原生组件
    let lastSimple: boolean = false;
    // 把剩余的函数参数全部倒序放入stack
    for (let i = args.length; i--; ) {
        stack.push(args[i]);
    }
    // 把元素上属性的children放入栈
    if (attributes && attributes.children != null) {
        if (!stack.length) {
            stack.push(attributes.children);
        }
        // 删除
        delete attributes.children;
    }
    // 把stack一次一次取出
    while (stack.length) {
        // 取出最后一个
        let child: any = stack.pop();
        if (child && child.pop !== undefined) {
            // 如果是个数组就倒序放入stack
            for (let i = child.length; i-- ; ) {
                stack.push(child[i]);
            }
        } else {
            // 清空布尔
            if (typeof child === "boolean") {
                child = null;
            }
            // 判断当前组件是否为自定义组件
            simple = typeof nodeName !== "function";
            if (simple) {
                // 原生组件的子元素处理
                if (child == null) {
                    // null to ""
                    child = "";
                } else if (typeof child === "number") {
                    // num to string
                    child = String(child);
                } else if (typeof child !== "string") {
                    // 不是 null,number,string 的不做处理
                    // 并且设置标记不是一个字符串
                    simple = false;
                }
            }
            if (simple && lastSimple) {
                // 当前为原生组件且子元素为字符串，并且上一个也是。
                // 就把当前子元素加到上一次的后面。
                children[children.length - 1] += child;
            } else {
                // 其它情况直接加入children
                children.push(child);
            }
            /* else if (children === EMPTY_CHILDREN) {
                children = [child];
            } */
            // 记录这次的子元素状态
            lastSimple = simple;
        }
    }
    const p = new VNode();
    // 设置原生组件名字或自定义组件class(function)
    p.nodeName = nodeName;
    // 设置子元素
    p.children = children;
    // 设置属性
    p.attributes = attributes == null ? undefined : attributes;
    // 设置key
    p.key = attributes == null ? undefined : attributes.key;
    // vnode 钩子
    if (options.vnode !== undefined) {
        options.vnode(p);
    }
    return p;
}
```

这个标准jsx的`VNode`生成函数很简单，这边要注意的是子组件是连续的字符串。
会被合并成一个，这样可以防止在生成dom时，创建多余的`Text`。

## 三、clone-element

``` typescript
import { h } from "./h";
import { VNode } from "./vnode";
import { extend } from "./util";

/**
 * 通过VNode对象新建一个自定义的props，children的VNode对象
 * @param vnode 旧vnode
 * @param props 新的props
 * @param children 新的子组件
 */
export function cloneElement(vnode: VNode, props: any, ...children: any[]) {
    const child: any = children.length > 0 ? children : vnode.children;
    return h(
        vnode.nodeName,
        extend({}, vnode.attributes, props),
        child,
    );
}
```

clone-element依赖于createElement

## 四、后记

- 这次的blog感觉好短，我已经没有东西写了。
- 话说回来vue的template，现在看来不如说是一个变异的jsx语法。
- 感觉明明是在读preact源码却对vue的实现更加的理解了。
- 下一篇应该是`Component`了。

## 五、资料

1. [preact源码](https://github.com/developit/preact)
2. [zreact源码](https://github.com/zeromake/zreact)
3. [React 初窥：JSX 详解](https://segmentfault.com/a/1190000010297507)
