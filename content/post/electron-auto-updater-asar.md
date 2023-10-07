---
title: electron 做仅 asar 文件自动更新
date: 2023-04-26 16:10:12 +08:00
tags:
  - electron
  - javascript
  - updater
  - asar
lastmod: 2023-10-07 19:13:12 +08:00
categories:
  - electron
  - javascript
slug: electron-auto-updater-asar
draft: false
---

## 前言

最近公司需要使用 electron 制作一些 gui 工具提供给内部使用，制作完成后发现更新比较繁琐，使用 `electron-updater` 做全量又没有必要，最后选择了仅做 asar 文件自动更新。

<!--more-->

## 一、打包 asar 文件和版本信息生成

一般 electron 项目都是使用 electron-builder 打包的，但是目标却是安装包，可以手动打包但是这里写了一个 node 脚本导出 asar 并生成对应的 gzip 压缩与 version.json，有需要请自行修改。

**asar-pack.mjs**
```js
import fs from 'node:fs/promises';
import {createWriteStream, createReadStream} from 'node:fs';
import {Transform} from 'node:stream';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {formatRFC3339} from 'date-fns';
import {simpleGit} from 'simple-git';
import process from 'node:process';
import zlib from 'node:zlib';
import {createHash} from 'node:crypto';

const download_url_base = '/updater';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageFile = path.join(__dirname, '..', 'package.json');
const git = simpleGit(path.join(__dirname, '..'), {binary: 'git'});

const asarPaths = [
  path.join(__dirname, '../dist/win-unpacked/resources/app.asar'),
  path.join(__dirname, '../dist/mac/slots-config-gui.app/Contents/Resources/app.asar'),
];

const updaterDir = path.join(__dirname, '../dist/updater');
const versionFile = path.join(updaterDir, 'version.json');

class HashTransform extends Transform {
  #hash;
  #result;
  constructor(algorithm, options) {
    super();
    this.#hash = createHash(algorithm, options);
  }
  _transform(chunk, _, next) {
    this.#hash.update(chunk);
    next(null, chunk);
  }
  _flush(done) {
    this.#result = this.#hash.digest('hex').toLowerCase();
    done();
  }
  get hash() {
    return this.#result;
  }
}
/**
 *
 * @param {fs.Stream} stream
 * @param {...fs.Writable} streams
 * @returns {Promise<void>}
 */
function pipe(stream, ...streams) {
  return new Promise(function (resolve, reject) {
    stream.on('error', reject);
    for (const nextStream of streams) {
      stream = stream.pipe(nextStream);
      stream.on('error', reject);
    }
    stream.on('finish', resolve);
  });
}

async function getCommit() {
  const local = await git.log({
    maxCount: 1,
  });
  return [local.latest.message, local.latest.hash];
}

async function exists(path, mode) {
  try {
    await fs.access(path, mode);
    return true;
  } catch (err) {
    return false;
  }
}

async function main() {
  let asarPath = null;
  for (const p of asarPaths) {
    if (await exists(p)) {
      asarPath = p;
      break;
    }
  }
  if (!asarPath) {
    throw new Error('Could not find app.asar');
  }

  const p = JSON.parse(await fs.readFile(packageFile, {encoding: 'utf-8'}));
  const version = p.version;
  await fs.rm(updaterDir, {recursive: true, force: true}).catch(Promise.resolve);
  await fs.mkdir(updaterDir, {recursive: true});
  const asarName = `app-${version}.asar.gz`;
  const intput = createReadStream(asarPath);
  const outputPath = path.join(updaterDir, asarName);
  const output = createWriteStream(outputPath);
  const hashTransform = new HashTransform('md5');
  await pipe(intput, zlib.createGzip(), hashTransform, output);
  const checksum = hashTransform.hash;
  const now = new Date();
  const [description, commit_hash] = await getCommit();
  await fs.writeFile(
    versionFile,
    JSON.stringify(
      {
        version: version,
        datetime: formatRFC3339(now),
        description: process.argv.length >= 3 ? process.argv[2] : description,
        download_url: `${download_url_base}/${asarName}`,
        commit_hash,
        checksum,
      },
      null,
      2,
    ),
  );
  console.log(`${version} pack done`);
}
await main();
```

## 二、挂载更新文件

任意 http 服务挂上刚刚生成的 app-xxx.asar.gz, version.json 即可

## 三、electron 的更新流程

1. 启动应用
2. 检查是否有新版本的 asar
3. 提示用户是否更新
4. 下载校验并自动解包
5. 提示用户是否重启
6. 更新 asar 文件并重启应用

## 四、electron 的下载文件，并支持 gzip 解压

```typescript
import {createWriteStream, access, rename} from 'original-fs';
import {request as httpsRequest} from 'node:https';
import {request as httpRequest} from 'node:http';
import {createGunzip} from 'node:zlib';

// 使用 original-fs 才能操作 asar 文件
const renamePromisify = promisify(rename);

// 封装下载文件的流式方法
const headers = {'user-agent': '@zeromake/electron-asar-updater/1.0.0', accept: '*/*'};
function http_get_stream(url: string): Promise<Stream> {
  return new Promise((resolve, reject) => {
    const req = (url.startsWith('https://') ? httpsRequest : httpRequest)(
      url,
      {
        headers: {
          ...headers,
          accept: 'application/octet-stream',
        },
        method: 'GET',
      },
      res => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
        }
        resolve(res);
      },
    ).on('error', reject);
    req.end();
  });
}

async function main(url: string) {
    const inStream = await http_get_stream(url);
    const isGzip = download_url.endsWith('.gz') || download_url.endsWith('.gzip');
    // 使用交换文件路径防止出现文件中断导致文件损坏
    const outStream = createWriteStream("swap.asar", {encoding: 'binary', flags: 'w'});
    // 构建流，解压到对应位置
    const outputStreams = [];
    if (isGzip) {
      outputStreams.push(createGunzip());
    }
    outputStreams.push(outStream);
    await pipe(inStream, ...outputStreams);
    // 重命名文件
    await renamePromisify(this.asarSwapPath, this.asarNextPath);
}

```

## 五、electron win32 和其它平台的 asar 文件替换处理

**unix**

```ts
import {rm, rename} from 'original-fs';

const rmPromisify = promisify(rm);
const renamePromisify = promisify(rename);

// unix 系统不锁 asar 文件直接替换即可
await rmPromisify("app.asar", {force: true});
await renamePromisify("next.asar", "app.asar");
```

**windows下**
使用 vbs 脚本不停的检查 app.asar 是否存在，存在就尝试删除并替换为新的文件
```vbs
On Error Resume Next
Dim relaunch
Set wshShell = WScript.CreateObject("WScript.Shell")
Set fsObject = WScript.CreateObject("Scripting.FileSystemObject")
updaterPath = "next.asar"
destPath = "app.asar"

Do While fsObject.FileExists(destPath)
fsObject.DeleteFile destPath
WScript.Sleep 250
Loop

WScript.Sleep 250
fsObject.MoveFile updaterPath,destPath
WScript.Sleep 250
```

## 六、electron 替换触发点

- `browserWindow.on('ready-to-show')` 时机比较合适，但是不太方便调起 ui 做更新提示。
- ui 的起始页，时机不如上面的好，但是依旧可以做为一个触发点，调用 ipcMain 注册的更新方法即可。
- 手动的菜单按钮

## 后语

仅 `asar` 文件更新，作为一个比较合适的 `electron` 更新方案，但是却被社区大多数人所拒绝，我找到的开源代码均已不可使用，这里把我所用的方案和代码分享给大家。

仓库代码：[electron-asar-updater](https://github.com/zeromake/electron-asar-updater)

## 参考

- [electron-asar-hot-updater](https://github.com/yansenlei/electron-asar-hot-updater/blob/master/README-CN.md): 第三方依赖比较复杂，还需要依赖一个 `.net` 编译的 exe。
- [electron-asar-autoupdate](https://github.com/Milesssssss/electron-asar-autoupdate): 年久失修 vbs 脚本已经无法执行，下载文件比较粗暴，没有使用 Stream 不支持 gzip，我自己的 updater 代码结构参考这个。
