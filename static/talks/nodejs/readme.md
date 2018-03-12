<!--
// Copyright 2016 ChaiShushan <chaishushan{AT}gmail.com>. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
-->

<!-- ======================================================================  -->

<!-- **** 横向分隔, ---- 竖向分隔, ___ 水平线, >Note: 讲稿注释  -->

<!--
Reveal.js 可能会需要 AJAX 异步加载 Markdown 文件, 可以在当前目录启动一个 http 服务.

以下是常见的临时启动 http 服务器的方式:

	NodeJS
	npm install http-server -g
	http-server

	Python2
	python -m SimpleHTTPServer

	Python3
	python -m http.server

	Golang
	go run server.go

启动后, 本地可以访问 http://127.0.0.1:port, 其中 port 为端口号, 命令行有提示.

幻灯片操作: F键全屏, S键显示注解, ESC大纲模式, ESC退出全屏或大纲模式, ?显示帮助

-->

<!-- ======================================================================  -->

# Node.JS & Electron 简介

<h4 style="text-align:center;">
	<a href="https://github.com/chai2010" target="_blank">
		chaishushan@gmail.com
	</a>
</h4>

>Note: Atom 原子; Electron 电子; Photon 光子;

<!-- ======================================================================  -->
****

## Node.JS 是什么?
_____________

- Node.JS 是不依赖浏览器的独立的 JavaScript 引擎
- 支持模块化的 JavaScript 编程
- 标准库: 文件系统, 网络, ...
_____________

- 网站: http://nodejs.org
- 安装: 安装包安装

<!-- ======================================================================  -->
****

## Electron 是什么?
_____________

- Node.JS 是一个命令行 JS 引擎
- Electron 则是一个支持 GUI 的 JS 引擎
- Electron 在 Node.JS 的基础上增加了对 Chrome 的支持
- Electron 是 Node.JS 的超集
_____________

- Electron 将 Node.JS 的标准库带入了 Chrome 中
- Electron 将 Node.JS 的模块化编程带入了 Chrome 中
_____________

- 网站: https://github.com/electron/electron
- 安装: `npm install electron -g`
- 镜像: https://npm.taobao.org

<!-- ======================================================================  -->
****

## 你好, 世界
_____________

examples/hello-v1.js:

```js
console.log('你好, 世界')
```
_____________

- Node.JS: `node examples/hello-v1.js`
- Electron: `electron examples/hello-v1.js`
_____________

- Node.JS 执行完成后退出了(命令行程序默认方式)
- Electron 执行完成后没有退出(GUI程序默认方式)

<!-- ======================================================================  -->
****

## 你好, 世界 - V2
_____________

examples/hello-v2.js:

```js
console.log('你好, 世界')
process.exit(0)
```
_____________

- process 是 NodeJS 内置的表示当前进程的对象
- 打印完成后调用 `process.exit(0)` 主动退出
- Node.JS 和 Electron 运行效果一致
_____________

- Node.JS 和 Electron 其实是类似的工具
- Electron 只是标准库比 Node.JS 多一些包而已


<!-- ======================================================================  -->
****

## 你好, 世界 - V3
_____________

examples/hello-v3/index.js:

```js
const electron = require('electron')

electron.app.on('ready', () => {
	let win = new electron.BrowserWindow()
	win.loadURL(`file:///${__dirname}/index.html`)
})
```
_____________

examples/hello-v3/index.html:

```html
<h1>你好, 世界</h1>
```
_____________

- Electron 运行: `electron examples/hello-v3`

<!-- ----------------------------------------------------------------------  -->
----

## 读懂代码
_____________

```js
// 用 Node.JS 提供的 require 函数加载 electron 包
// 加载的 electron 包对象赋值给名为 electron 常量
const electron = require('electron')

// electron.app 通过 electron 常量引用 electron 包中的 app 对象
// app 对象有一个 on 方法, 用于注册各种消息处理函数
// ready 消息在 app 对象准备就绪之后由 electron 框架发出
// 然后触发我们转入的消息处理函数...
electron.app.on('ready', () => {
	// 创建一个浏览器窗口, 保持到 win 局部变量中
	let win = new electron.BrowserWindow()

	// 这个新创建的浏览器窗口加载当前目录下的 index.html 页面
	// 其中 __dirname 是 Node.JS 引入的特性, 表示当前js源文件所在目录
	win.loadURL(`file:///${__dirname}/index.html`)
})
```
_____________

- 提示: 代码藏有BUG...


<!-- ----------------------------------------------------------------------  -->
----

## 运行预览
_____________

![](./images/hello-v3-01.png) <!-- .element: style="width:100%; height:500px;" -->

<!-- ----------------------------------------------------------------------  -->
----

## 改进: 避免 win 被提前回收
_____________

```js
const electron = require('electron')

let win = null

electron.app.on('ready', () => {
	if(win == null) {
		win = new electron.BrowserWindow()
		win.loadURL(`file:///${__dirname}/index.html`)
	}
})
```
_____________

- `win` 改为模块级变量


<!-- ======================================================================  -->
****

## 调试JS程序
_____________

- 写程序不会调试等于开车没有刹车, 迟早出问题
- 调试本质是根据程序的输入和输出分析问题
- 最前沿的调试技术: `console.log`
- 最古老的调试技术: `printf`


<!-- ----------------------------------------------------------------------  -->
----

## 调试 Node.JS 程序
_____________

examples/debug-v1.js

```js
function add(a, b) { return a+b }

console.log('add(1, 2):', add(1, 2))

// Output:
// add(1, 2): 3
```
_____________

- 通过 `console.log` 的输出分析程序的状态
- `console.log` 支持可变参数, 参数可以是任意类型


<!-- ----------------------------------------------------------------------  -->
----

## 调试 Electron 程序 - 01
_____________

examples/debug-v2/index.js

```js
const electron = require('electron')

let win = null

electron.app.on('ready', () => {
    if(win == null) {
        win = new electron.BrowserWindow()
		win.webContents.openDevTools() // <-- 调试代码

        win.loadURL(`file:///${__dirname}/index.html`)

		console.log('win ready') // <-- 调试代码
    }
})
```
_____________

- 浏览器窗口创建后打印 'win ready'


<!-- ----------------------------------------------------------------------  -->
----

## 调试 Electron 程序 - 02
_____________

examples/debug-v2/index.html

```html
<h1>你好, 世界</h1>

<script>
console.log('你好, 世界')  // <-- 调试代码
</script>
```
_____________

- 页面加载后打印 '你好, 世界'


<!-- ----------------------------------------------------------------------  -->
----

## 调试 Electron 程序 - 03
_____________

- index.js 和 index.html 属于不同运行空间!!!
_____________

- index.js 在执行 electron 命令的命令行打印消息
- index.html 在加载现实 html 页面的浏览器打印消息
_____________

- 浏览器的调试窗口可以看到打印输出
- 可以手工打开浏览器调试窗口, 也可以通过代码打开

<!-- ----------------------------------------------------------------------  -->
----

## 调试 Electron 程序 - 04
_____________

![](./images/debug-v2-01.png) <!-- .element: style="width:100%; height:150px;" -->

![](./images/debug-v2-02.png) <!-- .element: style="width:100%; height:250px;" -->


<!-- ----------------------------------------------------------------------  -->
----

## 调试代码的维护
_____________

- 单元测试
- 模块化
- ...


<!-- ======================================================================  -->
****

## 网页程序的限制
_____________

- 通用的浏览器为了安全, 禁止JS直接操作本地文件
- Electron 集成了 Node.JS 标准库, 没有限制


<!-- ----------------------------------------------------------------------  -->
----

## 网页中导入 fs 模块
_____________

examples/hello-v4/index.html

```html
<h1>你好, 世界</h1>
<script>
const fs = require('fs')

let now = new Date()
fs.writeFileSync(`${__dirname}/_time.txt`, now.toString())
</script>
```
_____________

- require 依然有效
- Electron 集成了 Node.JS 的标准库
- 导入 fs 模块操作文件


<!-- ----------------------------------------------------------------------  -->
----

## 网页中启动其它进程 - 01
_____________

examples/hello-v5/index.html

```html
<script>
const child_process = require('child_process')

let n = 100
let data = child_process.execSync(`node ${__dirname}/sum.js ${n}`)
console.log(`sum(1+2+...${n}):`, data.toString())
</script>
```
_____________

- 导入 child_process 模块, execSync 同步执行进程
- 启动进程的命令: `node ${__dirname}/sum.js ${n}`
- 进程的命令行参数和标准输出


<!-- ----------------------------------------------------------------------  -->
----

## 网页中启动其它进程 - 02
_____________

examples/hello-v5/sum.js

```js
function sum(n) {
	let s = 0
	for(let i = 0; i <= n; i++) {
		s += i
	}
	return s
}
if(require.main === module) {
	let args = process.argv.splice(2)
	if(args.length > 0) {
		console.log(sum(args[0]|0))
	}
}
```
_____________

- `require.main === module` 主模块/导入模块
- `process.argv`: [node, sum.js, 其它命令行参数...]


<!-- ----------------------------------------------------------------------  -->
----

## JS的并发限制
_____________

- JS 是单线程的语言, 通过异步模式处理多种事物
- 或者child_process启动多进程, 然后跨进程通讯
- 如果想多线程的能力, 可手写C/C++模块


<!-- ======================================================================  -->
****

## Photon: 美化 Electron 应用
_____________

![](./images/photon-v1-01.png) <!-- .element: style="width:100%; height:400px;" -->
_____________

http://photonkit.com


<!-- ----------------------------------------------------------------------  -->
----

## Photon: 布局模板
_____________

examples/photon-v1/index.html

```html
<div class="window">
    <header class="toolbar toolbar-header">
		页眉部分
	</header>

	<div class="window-content">
		内容部分
	</div>

	<footer class="toolbar toolbar-footer">
		页脚部分
	</footer>
</div>
```
_____________

http://photonkit.com/getting-started/



<!-- ----------------------------------------------------------------------  -->
----

## Photon: Electron/jQuery 包 - 01
_____________

examples/photon-v1/index.html

```html
<script>
// 导入 Electron 模块
const electron = require('electron')

// Electron 包含了 Node.JS 模块特性
// jQuery 会自动转为 require 模块使用方式
const $ = require('./jquery-3.2.1.min.js')

// 界面加载完成
$(document).ready(() => {
    $('.window-content').text(`electron: ${process.versions.electron}`)
})
</script>
```
_____________

- 页面引入的 electron 包 和主进程是不同的包
- jquery 最好以 require 方式加载

<!-- ----------------------------------------------------------------------  -->
----

## Photon: Electron/jQuery 包 - 02
_____________

examples/photon-v1/index.html

```html
<script>
// 退出按钮
$('#btn-cancel').click(() => {
    alert('退出')

    // 向主进程发送退出消息
    electron.ipcRenderer.send('myapp', 'quit', 123, 'abc')
})

// 保存按钮
$('#btn-save').click(() => {
    alert('保存')
})
</script>
```
_____________

- 页面最好避免直接退出程序, 向主进程发送消息
- `electron.ipcRenderer` 进程间的通讯管道


<!-- ----------------------------------------------------------------------  -->
----

## Photon: Electron/jQuery 包 - 03
_____________

examples/photon-v1/index.js

```js
// 主进程监控退出消息
electron.ipcMain.on('myapp', (event, ...args) => {
    console.log('args:', ...args)

    if(args.length > 0 && args[0] == 'quit') {
        electron.app.quit()
    }
})
```
_____________

- `electron.ipcMain` 是管道在主进程的名字
- myapp 是自定义的消息名称
- 消息可以带参数


<!-- ======================================================================  -->
****

## 模块化编程
_____________

- 将一行行代码打包为函数以便维护和重复使用
- 将函数打包到一个个js文件作为模块
- 将一个个js文件组织到目录作为模块包
- ...
_____________

- 一个 js 文件对应一个模块
- 一个 目录 会对应一个 js 文件, 其实也一个模块
- node_modules 是放置模块的标准目录
_____________

- 模块化是分而治之的策略


<!-- ----------------------------------------------------------------------  -->
----

## 没有模块化前的写法
_____________

examples/pkg-01/index.js

```js
function sayHello() {
	console.log('你好, 世界')
}

sayHello()
```
_____________

- `node examples/pkg-01/index.js`
- `node examples/pkg-01`


<!-- ----------------------------------------------------------------------  -->
----

## 模块化的写法
_____________

examples/pkg-02/hello.js

```js
function sayHello() {
	console.log('你好, 世界')
}

exports.sayHello = sayHello
```
_____________

examples/pkg-02/index.js

```js
const helloPkg = require('./hello.js')

helloPkg.sayHello()
```
_____________

- require 将模块的 exports 对象返回
- helloPkg 是 hello.js 中 exports 对象的引用


<!-- ----------------------------------------------------------------------  -->
----

## 目录作为一个模块
_____________

examples/pkg-04/hello/index.js // hello.js -> hello/index.js

```js
function sayHello() {
	console.log('你好, 世界')
}

exports.sayHello = sayHello
```
_____________

examples/pkg-04/index.js

```js
const helloPkg = require('./hello') // require 时去掉 .js 后缀名

helloPkg.sayHello()
```
_____________

- 导入目录时, 默认是导入目录下的 index.js 模块


<!-- ----------------------------------------------------------------------  -->
----

## 目录模块的配置 - package.json
_____________

examples/pkg-04/hello/hello.js // index.js -> hello.js

```js
function sayHello() {
	console.log('你好, 世界')
}

exports.sayHello = sayHello
```
_____________

examples/pkg-04/hello/package.json

```json
{
	"main": "hello.js"
}
```
_____________

- 目录下 package.json 的 main 字段指定对应的 js 文件
- 缺省情况下是 index.js 文件

<!-- ----------------------------------------------------------------------  -->
----

## 聚合多个模块导出 - 01
_____________

examples/pkg-05/hello/hi.js

```js
function hi() {
	console.log('hi')
}

exports.hi = hi
```
_____________

- 增加一个 hi 子模块
- 希望导入目录时, 同时导出 hello.js 和 hi.js 模块

<!-- ----------------------------------------------------------------------  -->
----

## 聚合多子个模块导出 - 02
_____________

examples/pkg-05/hello/index.js

```js
const helloPkg = require('./hello')
const hiPkg = require('./hi')

exports.sayHello = helloPkg.sayHello
exports.hi = hiPkg.hi
```
_____________

- 在目录入口将子模块的导出符号重新导出


<!-- ----------------------------------------------------------------------  -->
----

## node_modules 目录
_____________

examples/pkg-06

```
pkg-06/
├─ node_modules/
│   └── hello/
│       ├── hello.js
│       ├── hi.js
│       └── index.js
└── index.js
```
_____________

examples/pkg-06/index.js

```js
const helloPkg = require('hello') // 标准路径
...
```
_____________

- 将 hello 目录移到 node_modules/hello
- 相对导入路径变为标准导入路径


<!-- ----------------------------------------------------------------------  -->
----

## npm 和 node_modules
_____________

- npm 是 Node.JS 官方的包管理工具
- npm 的官方网址为 https://www.npmjs.com
- 国内镜像 https://npm.taobao.org
_____________

- node_modules 并不依赖 npm


<!-- ======================================================================  -->
****

## Vue.js & Electron
_____________

examples/hello-vue/index.html

```html
<div id="app">
	{{ message }}
</div>

<script>
const Vue = require('./vue.min.js')

let app = new Vue({
	el: '#app',
	data: {
		message: 'Hello Vue!'
	}
})
</script>
```
_____________

- `electron examples/hello-vue`
- https://vuejs.org/


<!-- ======================================================================  -->
****

## Angular & Electron
_____________

![](./examples/hello-ng2/ng2-electron.png) <!-- .element: style="width:100%; height:300px;" -->

_____________

- https://angular.io
- https://angular.cn
- http://www.typescriptlang.org

<!-- ----------------------------------------------------------------------  -->
----

## 你好, Angular - 预览
_____________

![](./examples/hello-ng2/demo.png) <!-- .element: style="width:100%; height:500px;" -->


<!-- ----------------------------------------------------------------------  -->
----

## 你好, Angular - 目录结构
_____________

examples/hello-ng2/

```
pkg-06/
├─ demo.html
├─ demo.ts
├─ index.ts
├─ tsconfig.ts
└─ package.json
```
_____________

- demo.html: 启动页面
- demo.ts: ng2 全部代码, TypeScript 语言
- index.ts: Electron 启动代码, TypeScript 语言
- tsconfig.ts: TypeScript 编译配置文件
- package.json: Node.JS 配置文件


<!-- ----------------------------------------------------------------------  -->
----

## 你好, Angular - 导入包
_____________

examples/hello-ng2/demo.ts

```ts
import * as ngCore                   from '@angular/core'
import * as ngPlatformBrowser        from '@angular/platform-browser'
import * as ngPlatformBrowserDynamic from '@angular/platform-browser-dynamic'
```
_____________

- Angular的模块全部在 `@angular` 名字空间下


<!-- ----------------------------------------------------------------------  -->
----

## 你好, Angular - 窗口组件
_____________

examples/hello-ng2/demo.ts

```ts
@ngCore.Component({
	selector: 'my-app',
	template: `
		<h1>你好, {{name}}! - V1</h1>
	`,
	styles: [
		`h1 {
			color: #369;
			font-family: Arial, Helvetica, sans-serif;
			font-size: 250%;
		}`,
	],
})
export class MainComponent {
	name = '世界'
}
```
_____________

- 创建窗口组件


<!-- ----------------------------------------------------------------------  -->
----

## 你好, Angular - Angular 模块
_____________

examples/hello-ng2/demo.ts

```ts
@ngCore.NgModule({
	imports: [ ngPlatformBrowser.BrowserModule ],
	declarations: [ MainComponent ],
	bootstrap: [ MainComponent ],
})
export class MainModule {
	//
}
```
_____________

- 将窗口组件打包为 Angular 模块


<!-- ----------------------------------------------------------------------  -->
----

## 你好, Angular - 启动
_____________

examples/hello-ng2/demo.ts

```ts
export function main() {
	ngPlatformBrowserDynamic.platformBrowserDynamic().bootstrapModule(MainModule)
}
```
_____________

- 启动 Angular 模块


<!-- ----------------------------------------------------------------------  -->
----

## 你好, Angular - html页面
_____________

examples/hello-ng2/demo.html

```html
<!DOCTYPE html>

<head>
	<title>Angular2应用</title>
</head>

<body>
	<my-app>加载UI组件</my-app>
	<script>require('./demo').main()</script>
</body>
```
_____________

- `<my-app></my-app>` 对应 Angular 窗口组件
- `require('./demo').main()` 启动 Angular 程序


<!-- ----------------------------------------------------------------------  -->
----

## 你好, Angular - 运行
_____________

![](./examples/hello-ng2/demo.png) <!-- .element: style="width:100%; height:350px;" -->
_____________

- `npm install`
- `tsc && electron .`


<!-- ======================================================================  -->
****

## 参考资源

#### http://nodejs.org

#### https://github.com/electron/electron


<!-- ======================================================================  -->
****

## Thank you

#### [chaishushan@gmail.com](https://github.com/chai2010)

<!-- ======================================================================  -->
