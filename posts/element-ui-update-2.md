title: element-ui升级2.x问题
date: 2017-11-22 11:20:00+08:00
type: vue
tags: [vue, element-ui]
last_date: 2017-12-07 11:20:00+08:00


## 前言

最近在升级`element-ui`到2.x 其中碰到一些坑标记一下。


## 坑

1. `scope`替换为`slot-scope`,这个不是`element-ui`的是vue的
2. `el-dialog` 的 `v-model` 需要换成 `:visible.sync`.
3. `el-switch` 的 `on-text`, `off-text`, `on-color` ... 替换为 `active-text`， `inactive-text`，`active-color`
    并且文字在switch外，switch组件的宽度变大
4. `el-input` 的 `icon` 改成了 `suffix-icon`
