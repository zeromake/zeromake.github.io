---

title: preact 源码解读(2)
date: 2017-07-26 15:23:04+08:00
type: source
tags: [preact, source, read]
last_date: 2017-07-26 15:23:04+08:00
...

## 前言

-   这里是第二篇，[第一篇在这里](https://blog.zeromake.com/pages/preact-source-read-1)
-   这次讲 Component，以及它的一些轻量依赖。
-   顺便说下[司徒正美的 preact 源码学习](https://segmentfault.com/u/situzhengmei/articles)
-   感觉比我写的好多了，图文并茂，还能提出和其它如 React 的源码比较。
-   我唯一好点的可能就是代码几乎每行都有注释，并且使用了 typescript 添加了类型的标注。

<!--more-->

## Component 使用

```javascript
import { h, Component, render } from "preact"

class App extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            num: 0
        }
    }
    test() {
        this.setState(state => {
            state.num += 1
        })
    }
    render(props, state, context) {
        return <h1 onClick={test.bind(this)}>{state.num}<h1/>
    }
}
render(<App/>, document.body)
```

上面是一个简单的点击改变当前状态的组件示例。
其中与`vue`不同`preact`通过`Component.prototype.setState`来触发新的 dom 改变。
当然`preact`还有其它的更新方式。

## Component 代码

这里的代码是通过`typescript`重写过的所以有所不同,
但是更好的了解一个完整的`Component`整体应该有什么。

```typescript
import { FORCE_RENDER } from "./constants";
import { renderComponent } from "./vdom/component";
import { VNode } from "./vnode";
import { enqueueRender } from "./render-queue";
import { extend } from "./util";
import { IKeyValue } from "./types";

export class Component {
    /**
     * 默认props
     */
    public static defaultProps?: IKeyValue;
    /**
     * 当前组件的状态,可以修改
     */
    public state: IKeyValue;
    /**
     * 由父级组件传递的状态，不可修改
     */
    public props: IKeyValue;
    /**
     * 组件上下文，由父组件传递
     */
    public context: IKeyValue;
    /**
     * 组件挂载后的dom
     */
    public base?: Element;
    /**
     * 自定义组件名
     */
    public name?: string;
    /**
     * 上一次的属性
     */
    public prevProps?: IKeyValue;
    /**
     * 上一次的状态
     */
    public prevState?: IKeyValue;
    /**
     * 上一次的上下文
     */
    public prevContext?: IKeyValue;
    /**
     * 被移除时的dom缓存
     */
    public nextBase?: Element;
    /**
     * 在一个组件被渲染到 DOM 之前
     */
    public componentWillMount?() => void;
    /**
     * 在一个组件被渲染到 DOM 之后
     */
    public componentDidMount?() => void;
    /**
     * 在一个组件在 DOM 中被清除之前
     */
    public componentWillUnmount?() => void;
    /**
     * 在新的 props 被接受之前
     * @param { IKeyValue } nextProps
     * @param { IKeyValue } nextContext
     */
    public componentWillReceiveProps?(nextProps: IKeyValue, nextContext: IKeyValue) => void;
    /**
     * 在 render() 之前. 若返回 false，则跳过 render，与 componentWillUpdate 互斥
     * @param { IKeyValue } nextProps
     * @param { IKeyValue } nextState
     * @param { IKeyValue } nextContext
     * @returns { boolean }
     */
    public shouldComponentUpdate?(nextProps: IKeyValue, nextState: IKeyValue, nextContext: IKeyValue) => boolean;
    /**
     * 在 render() 之前，与 shouldComponentUpdate 互斥
     * @param { IKeyValue } nextProps
     * @param { IKeyValue } nextState
     * @param { IKeyValue } nextContext
     */
    public componentWillUpdate?(nextProps: IKeyValue, nextState: IKeyValue, nextContext: IKeyValue) => void;
    /**
     * 在 render() 之后
     * @param { IKeyValue } previousProps
     * @param { IKeyValue } previousState
     * @param { IKeyValue } previousContext
     */
    public componentDidUpdate?(previousProps: IKeyValue, previousState: IKeyValue, previousContext: IKeyValue) => void;
    /**
     * 获取上下文，会被传递到所有的子组件
     */
    public getChildContext?() => IKeyValue;
    /**
     * 子组件
     */
    public _component?: Component;
    /**
     * 父组件
     */
    public _parentComponent?: Component;
    /**
     * 是否加入更新队列
     */
    public _dirty: boolean;
    /**
     * render 执行完后的回调队列
     */
    public _renderCallbacks?: any[];
    /**
     * 当前组件的key用于复用
     */
    public _key?: string;
    /**
     * 是否停用
     */
    public _disable?: boolean;
    /**
     * react标准用于设置component实例
     */
    public _ref?: (component: Component | null) => void;
    /**
     * VDom暂定用于存放组件根dom的上下文
     */
    public child?: any;
    constructor(props: IKeyValue, context: IKeyValue) {
        // 初始化为true
        this._dirty = true;
        this.context = context;
        this.props = props;
        this.state = this.state || {};
    }
    /**
     * 设置state并通过enqueueRender异步更新dom
     * @param state 对象或方法
     * @param callback render执行完后的回调。
     */
    public setState(state: IKeyValue, callback?: () => void): void {
        const s: IKeyValue = this.state;
        if (!this.prevState) {
            // 把旧的状态保存起来
            this.prevState = extend({}, s);
        }
        // 把新的state和并到this.state
        if (typeof state === "function") {
            const newState = state(s, this.props);
            if (newState) {
                extend(s, newState);
            }
        } else {
            extend(s, state);
        }
        if (callback) {
            // 添加回调
            this._renderCallbacks = this._renderCallbacks || [];
            this._renderCallbacks.push(callback);
        }
        // 异步队列更新dom，通过enqueueRender方法可以保证在一个任务栈下多次setState但是只会发生一次render
        enqueueRender(this);
    }
    /**
     * 手动的同步更新dom
     * @param callback 回调
     */
    public forceUpdate(callback: () => void) {
        if (callback) {
            this._renderCallbacks = this._renderCallbacks || [];
            this._renderCallbacks.push(callback);
        }
        // 重新同步执行render
        renderComponent(this, FORCE_RENDER);
    }
    /**
     * 用来生成VNode的函数
     * @param props
     * @param state
     * @param context
     */
    public render(props?: IKeyValue, state?: IKeyValue, context?: IKeyValue): VNode | void {
        // console.error("not set render");
    }
}
```

如果你看过原来的`preact`的代码会发觉多了很多可选属性，
其中除了`child`这个属性其它实际上官方的也有，但是都是可选属性。

这里重点说`setState`和`forceUpdate`这两个触发 dom 更新

`setState`保存旧的`this.state`到`this.prevState`里，然后新的 state 是直接设置在`this.state`。
然后通过`enqueueRender`来加入队列中，这个更新是在异步中的。所以不要写出这种代码

```javascript
test() {
    // 这里的setState已经入异步栈，
    this.setState({...})
    $.post(...() => {
        // 再次入异步栈,再一次执行，
        this.setState({...})
    })
}
```

可以把两次`setState`合并到一起做。

## render-queue

```typescript
import { Component } from "./component";
import options from "./options";
import { defer } from "./util";
import { renderComponent } from "./vdom/component";

let items: Component[] = [];

/**
 * 把Component放入队列中等待更新
 * @param component 组件
 */
export function enqueueRender(component: Component) {
    if (!component._dirty) {
        // 防止多次render
        component._dirty = true;
        const len = items.push(component);
        if (len === 1) {
            // 在第一次时添加一个异步render，保证同步代码执行完只有一个异步render。
            const deferFun = options.debounceRendering || defer;
            deferFun(rerender);
        }
    }
}

/**
 * 根据Component队列更新dom。
 * 可以setState后直接执行这个方法强制同步更新dom
 */
export function rerender() {
    let p: Component | undefined;
    const list = items;
    items = [];
    while ((p = list.pop())) {
        if (p._dirty) {
            // 防止多次render。
            renderComponent(p);
        }
    }
}
```

最终通过`renderComponent`来重新`diff`更新`dom`

`forceUpdate`则是直接同步更新不过传入了一个标记`FORCE_RENDER`。

## 顺便写下`options`

```typescript
import { VNode } from "./vnode";
import { Component } from "component";

const options: {
    // render更新后钩子比componentDidUpdate更后面执行
    afterUpdate?: (component: Component) => void;
    // dom卸载载前钩子比componentWillUnmount更先执行
    beforeUnmount?: (component: Component) => void;
    // dom挂载后钩子比componentDidMount更先执行
    afterMount?: (component: Component) => void;
    // setComponentProps时强制为同步render
    syncComponentUpdates?: boolean;
    // 自定义异步调度方法，会异步执行传入的方法
    debounceRendering?: (render: () => void) => void;
    // vnode实例创建时的钩子
    vnode?: (vnode: VNode) => void;
    // 事件钩子，可以对event过滤返回的会代替event参数
    event?: (event: Event) => any;
    // 是否自动对事件方法绑定this为组件，默认为true(preact没有)
    eventBind?: boolean;
} = {
    eventBind: true
};

export default options;
```

## 后记

-   感觉有了更多的注释，就没有必要说明太多了。
-   下一篇应该是到了`renderComponent`和`diff`部分了。
