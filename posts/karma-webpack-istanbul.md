---
title: karma 使用 webpack 的代码覆盖率测试
date: 2017-05-07 14:21:46+08:00
type: istanbul
tags: [karma, webpack, istanbul]
last_date: 2017-05-07 23:23:37+08:00
---

## 前言

-   距离上一次博客有 2 个月了，倒不是没有可写东西就是提不起劲写。
-   不说这些了这次写下我使用 `karma + webpack` 中遇到的代码覆盖率问题。

<!--more-->

## 一、karma 的使用

自个去搜吧，感觉讲这个的真的多。我就说一些建议。

-   karma 的测试框架改用 mocha 这样对于一个需要 nodejs, browser 测试的测试用例可以共用。具体的可以看我的 [marked-zm](https://github.com/zeromake/marked-zm)

## 二、karma + webpack 的使用

依旧是很多人写过了，但是还是写下吧。

### 配置 karma + webpack

-   需要的 npm 包

```shell
npm i karma karma-mocha karma-phantomjs-launcher karma-sinon-chai /
karma-spec-reporter karma-webpack mocha sinon sinon-chai -D
```

-   package.json

```json
{
    "scripts": {
        "karma-run": "karma run",
        "karma-start": "karma start test/unit/karma.conf.js",
        "karma-single": "karma start test/unit/karma.conf.js --single-run"
    }
}
```

-   test/unit/karma.conf.js

```javascript
module.exports = function(config) {
    config.set({
        webpack: {
            devtool: "inline-source-map", // 推荐使用inline-source-map
            module: {
                rules: [
                    /* loaders */
                ]
            }
        },
        frameworks: ["mocha", "sinon-chai"], // 测试框架随便一定要要和我一样
        files: [
            "./index.js" // 推荐使用一个入口来导入所有的测试。
        ],
        preprocessors: {
            "./index.js": ["webpack"] // 使用什么配置
        },
        reporters: ["spec"], // spec显示插件
        port: 9876, // 端口
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ["PhantomJS"],
        singleRun: false
    });
};
```

-   test/unit/index.js

```javascript
// 动态加载所有测试文件
const testsContext = require.context("./specs", true, /\.spec$/);
testsContext.keys().forEach(testsContext);
```

-   test/unit/specs/test.spec.js

```javascript
describe("Test", function() {
    it("test 1+1", function() {
        expect(1 + 1).to.equal(2);
    });
});
```

### 运行 karma + webapck 测试

```shell
# 开启 karma 动态构建
npm run karma-start
# new shell，运行一次测试
npm run karma-run
```

或者直接单次构建并测试

```shell
npm run karma-single
```

## 三、karma + webpack 的代码覆盖率测试

这里如果直接用 `karma-coverage` 会出现直接对 `karma` 配置中入口文件生成的 `webpack` 代码的代码覆盖率测试。会出现很多 `webpack` 生成的额外代码。

而且也不是源代码的代码覆盖率测试。

这里有两个方案:

1. [karma-coverage](https://github.com/karma-runner/karma-coverage) + [isparta-loader](https://github.com/deepsweet/isparta-loader)
   来自 [element-ui](https://github.com/ElemeFE/element) 然后去看 `isparta-loader` 发觉作者已经废弃推荐换到 `istanbul-instrumenter-loader` 所以这个我也不用了，直接看另一个方案吧。
2. [karma-coverage-istanbul-reporter](https://github.com/mattlewis92/karma-coverage-istanbul-reporter) + [istanbul-instrumenter-loader](https://github.com/webpack-contrib/istanbul-instrumenter-loader)
   这两个包除了 `README` 的说明没有找到更多的资料，只好自己试着用，下面直接看如何使用吧。

### 配置 karma + webpack 的代码覆盖率测试

-   需要的其它 npm 包

```shell
npm i karma-coverage-istanbul-reporter istanbul-instrumenter-loader -D
```

-   test/unit/karma.conf.js

```javascript
const path = require('path')
const srcPath = path.resolve(__dirname, '../../src')
module.exports = function(config) {
    config.set({
        webpack: {
            devtool: 'inline-source-map', // 推荐使用inline-source-map
            module: {
                rules: [
                    // 像eslint-loader一样使用,并限定在源码上。
                    {
                        test: /\.js$/,
                        enforce: 'pre',
                        use: 'istanbul-instrumenter-loader',
                        inclues: [srcPath]
                    }
                    /* loaders */
                ]
            }
        },
        frameworks: ['mocha', 'sinon-chai'], // 测试框架随便一定要要和我一样
        files: [
            './index.js' // 推荐使用一个入口来导入所有的测试。
        ],
        preprocessors: {
            './index.js': ['webpack'] // 使用什么配置
        },
        // 增加代码覆盖率输出插件
        reporters: ['spec'，'coverage-istanbul'],
        port: 9876, // 端口
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['PhantomJS'],
        singleRun: false,
        // 配置代码覆盖率插件
        coverageIstanbulReporter: {
            // 以什么格式, 这里设置了输出 html文件 ,info文件 ,及控制台
            reports: ['html', 'lcovonly', 'text-summary'],
            // 将文件输出路径定位
            dir: path.join(__dirname, 'coverage'),
            // 修正 weback 路径（翻译了是这个意思）
            fixWebpackSourcePaths: true,
            // 将生成的html放到./coverage/html/下
            'report-config': {
                html: {
                    subdir: 'html'
                }
            }
        }
    })
}
```

-   代码参考 [vue-dragging](https://github.com/zeromake/vue-dragging/tree/test) or [marked-zm](https://github.com/zeromake/marked-zm)

## 四、nodejs, browser 测试使用同一套测试用例

-   package.json

```json
{
    "scripts": {
        "node-test": "mocha --reporter spec --require\
         test/unit/common test/unit/specs/*.spec.js"
    }
}
```

-   test/unit/common.js

```javascript
global.chai = require("chai");
global.should = require("chai").should();
global.expect = require("chai").expect;
global.AssertionError = require("chai").AssertionError;
const sinonChai = require("sinon-chai");

chai.use(sinonChai);
```

无需修改其它代码见 [marked-zm](https://github.com/zeromake/marked-zm)

## 五、总结

1. 下篇看看要不探讨 `ci` 集成，或者 `vue` 的面板组件直接加载组件并且切换不会丢失状态。
2. 原来想写 `npm` 包发布后来发觉满地都是，就算了。
