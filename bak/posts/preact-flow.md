---
title: preact 执行流程
date: 2017-07-30 08:46:04+08:00
type: source
tags: [preact, flow]
last_date: 2017-07-30 08:46:04+08:00
---

## 前言

-   应[@ToPeas](https://github.com/ToPeas)的[Issue](https://github.com/zeromake/zreact#1)来描述下 preact 的流程。
-   这里决定使用我自己改过的[zreact](https://github.com/zeromake/zreact/tree/flow)的 flow 分支，这个分支的代码不会再变。

<!--more-->

## 代码例子

这次用个简单的例子, 这里为了简化就不使用 jsx 转换了，手写 jsx。

```javascript
import { h, Component, render } from "zreact";
class App extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            num: 0
        };
    }
    click() {
        this.setState({ num: this.state.num + 1 });
    }
    render(props, state) {
        return h("div", { onClick: this.click.bind(this) }, state.num);
    }
}
render(h(App), document.body);
```

## 例子代码分解

-   App 类没什么好说的。
-   `render(h(App), document.body)`,这里的`h(App)`作为参数会先执行得到

```javascript
VNode:{
    nodeName: App,
    children: [],
    attributes: undefined,
    key: undefined
}
```

-   最后`render`接受到两个参数，一个上面的`VNode`实例,一个要挂载的父节点。

## render 执行流程

-   `render`, 实际上就是`diff`的代理
    [render.ts#L15](https://github.com/zeromake/zreact/blob/flow/src/render.ts#L15)

```javascript
const child = {};
function render(vnode, parent, merge, domChild) {
    const pchild = domChild || child;
    return diff(merge, vnode, {}, false, parent, false, pchild);
}
```

-   到了`diff`直接调用`idiff`
    [diff.ts#L75](https://github.com/zeromake/zreact/blob/flow/src/vdom/diff.ts#L75)

```typescript
function diff(
    dom: Element | undefined,
    vnode: VNode | void,
    context: IKeyValue,
    mountAll: boolean,
    parent: any,
    componentRoot: boolean,
    child: any
) {
    // 因为是第一次调用设置isSvgMode，hydrating
    const ret = idiff(dom, vnode, context, mountAll, componentRoot, child);
    // 生成dom后的操作
    return ret;
}
```

-   `idiff`通过分支判断出`vnode.vnodeName`是一个类，调用`buildComponentFromVNode`
    [diff.ts#L158](https://github.com/zeromake/zreact/blob/flow/src/vdom/diff.ts#L158)

```typescript
if (typeof vnodeName === "function") {
    // 是一个组件,创建或复用组件实例，返回dom
    return buildComponentFromVNode(dom, vnode, context, mountAll, child);
}
```

-   `buildComponentFromVNode`判断出 dom 中未缓存上次组件实例
    [component.ts#L360](https://github.com/zeromake/zreact/blob/flow/src/vdom/component.ts#L360)
    [component.ts#L375](https://github.com/zeromake/zreact/blob/flow/src/vdom/component.ts#L375)

```typescript
// 通过缓存组件的方式创建组件实例
c = createComponent(vnode.nodeName, props, context);
// 设置props，并同步执行render
setComponentProps(c, props, SYNC_RENDER, context, mountALL);
```

-   `setComponentProps`设置一堆属性，触发生命周期`componentWillMount`
    [component.ts#L84](https://github.com/zeromake/zreact/blob/flow/src/vdom/component.ts#L84)

```typescript
// 同步执行render
renderComponent(component, SYNC_RENDER, mountAll);
```

-   `renderComponent`判断 render 返回的为 html 元素，递归调用`diff`，递归层数 2
    [component.ts#L237](https://github.com/zeromake/zreact/blob/flow/src/vdom/component.ts#L237)

```typescript
// 当前组件的render函数返回的VNode
const rendered: VNode | void = component.render(props, state, context);
// rendered {
//     vnodeName: "div",
//     children: [0],
//     attributes: {onClick: fun},
//     key: undefined
// }
// ...
// 渲染原生组件
base = diff(
    // 原dom
    cbase,
    // VNode
    rendered,
    context,
    // 父级或者该原生组件，原dom不存在说明必须触发生命周期
    mountALL || !isUpdate,
    // 把组件挂载到缓存dom的父级
    initialBase && initialBase.parentNode,
    // 以原生组件这里执行说明是自定义组件的第一个原生组件
    true,
    // dom上下文
    component.child
);
```

-   `diff`这回直接调用`idiff`
    [diff.ts#L75](https://github.com/zeromake/zreact/blob/flow/src/vdom/diff.ts#L75)
-   `idiff`判断出需要新建一个`dom`, 并通过`diffChildren`生成子节点
    [diff.ts#L138](https://github.com/zeromake/zreact/blob/flow/src/vdom/diff.ts#L138)
    [diff.ts#L223](https://github.com/zeromake/zreact/blob/flow/src/vdom/diff.ts#L223)

```typescript
if (!dom || !isNamedNode(dom, vnodeName)) {
    // 没有原dom或者原dom与vnode里的不同，新建一个
    out = createNode(vnodeName, isSvgMode);
    // ...
}
// ...
const vchildren = vnode.children;
else if (vchildren && vchildren.length || fc != null) {
    if (!child.children) {
        child.children = [];
    }
    // vnode子元素需要渲染或者为空但dom子元素需要清空
    diffChildren(
        out,
        vchildren,
        context,
        mountAll,
        hydrating || props.dangerouslySetInnerHTML != null,
        child,
    );
}
```

-   `diffChildren`只有一个子节点需要渲染,为 1 调用`idiff`渲染
    [diff.ts#L360](https://github.com/zeromake/zreact/blob/flow/src/vdom/diff.ts#L360)

```typescript
// vchild=1
child = idiff(child && child.base, vchild, context, mountAll, false, tchild);
```

-   `idiff`创建 Text

```typescript
out = document.createTextNode(data);
return out;
```

-   回到`diffChildren`挂载到父 dom 上结束这个方法回到`idiff`
    [diff.ts#L367](https://github.com/zeromake/zreact/blob/flow/src/vdom/diff.ts#L367)

```typescript
dom.appendChild(child);
```

-   `idiff`创建完 dom 与子 dom 后，通过`diffAttributes`设置事件和原生属性,然后返回到`diff`
    [diff.ts#L233](https://github.com/zeromake/zreact/blob/flow/src/vdom/diff.ts#L233)
    [diff.ts#L238](https://github.com/zeromake/zreact/blob/flow/src/vdom/diff.ts#L238)

```typescript
// 设置dom属性
diffAttributes(out, vnode.attributes, props, child);

return out;
```

-   `diff`因为是递归层数 2 且不需要挂载,直接返回到`renderComponent`
    [diff.ts#L96](https://github.com/zeromake/zreact/blob/flow/src/vdom/diff.ts#L96)

```typescript
return ret;
```

-   `renderComponent`把 dom 挂载到 Component，一大堆操作后继续返回到`setComponentProps`
    [component.ts#L287](https://github.com/zeromake/zreact/blob/flow/src/vdom/component.ts#L287)

```typescript
componentRef.base = base;
```

-   `setComponentProps`没有操作直接回到`buildComponentFromVNode`获取 dom 返回到`idiff`
    [component.ts#L383](https://github.com/zeromake/zreact/blob/flow/src/vdom/component.ts#L383)
    [component.ts#L390](https://github.com/zeromake/zreact/blob/flow/src/vdom/component.ts#L390)

```typescript
// 获取dom
dom = c.base;
return dom;
```

-   `idiff`挂载 dom，返回到`render`
    [diff.ts#L85](https://github.com/zeromake/zreact/blob/flow/src/vdom/diff.ts#L85)
    [diff.ts#L96](https://github.com/zeromake/zreact/blob/flow/src/vdom/diff.ts#L96)

```typescript
parent.appendChild(ret);
return ret;
```

-   `render`返回到用户代码，到此结束。

## render 流程图

![render-flow](/public/img/preact-source/render-flow.svg)

## setState 流程
