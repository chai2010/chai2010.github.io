---
title: "SQLite3 官方支持 WebAssembly！"
date: 2022-10-31
draft: false

tags: ["sqlite3", "wasm"]
categories: ["sqlite3", "wasm"]
---

SQLite 官方的 wasm 项目终于来了！这表示 WebAssembly 在 SQLite 社区完全进入工业级应用阶段！

![](/images/2022/sqlite3-wasm/00.png)

## 1. WASM 是什么

WebAssembly，又名 WASM，是一种标准，它定义了一种低级编程语言，适合 (A) 作为与许多其他语言交叉编译的目标，以及 (B) 通过浏览器中的虚拟机运行。它在设计时考虑了通过 JavaScript 编写脚本，它提供了一种将 C 代码（以及其他代码）编译为 WASM 并通过 JavaScript 编写脚本的方法，尽管 JavaScript 和 C 之间还存在巨大的编程模型差异，但它为不同语言和 JS 的交互带来了标准桥梁。

根据 [Ending 定律](https://zh.wikipedia.org/wiki/WebAssembly)：“所有可以用WebAssembly实现的终将会用WebAssembly实现”。SQLite 官方支持 WASM 只是再次证明和强化了定律有效性。实际上，在很早之前网上就有很多基于 LLVM 或 Emscripten 构建的 SQLite 库，它们最终可以被包装为 JS 库。

> 扩展阅读：WASM 作为 W3C 的 第 4 个标准，已经在不同的领域取得巨大的进展。比如 Docker 发布集成 WebAssembly 的首个技术预览版。同时大量编程语言已经开始支持 WASM 平台（完整列表可参考 https://wasmlang.org/ ），国内的 Go+、凹语言、KCL 配置语言 等都把对 WASM 的支持作为较高的优先级。关于 WASM 的更多信息可以关注 《WebAssembly标准入门》。

## 2. SQLite 官方支持 WebAssembly

https://sqlite.org/wasm/doc/ckout/index.md

![](/images/2022/sqlite3-wasm/01.png)

其实早在 2022 年 9 月，Google 的 Chrome 开发团队宣布与 SQLite 开发团队合作，并开发了 SQLite 的 WebAssembly 版本，作为替代的 Web SQL 数据库 API。WebAssembly 起源于 SQLite 开发团队的努力。

## 3. 在浏览器体验 SQLite

打开网址 https://sqlite.org/fiddle/

![](/images/2022/sqlite3-wasm/03.png)

## 4. 项目的具体目标

![](/images/2022/sqlite3-wasm/02.png)

根据官网介绍，主要有 4 个目标：

- 绑定一个低级的 sqlite3 API，在使用方面尽可能接近原生 API。
- 更高级别的面向对象风格 API，类似于 sql.js 和 node.js 样式的实现。
- 基于 Worker 的 API，以支持多线程环境更容易使用 SQLite 功能。
- 基于 Worker API 的 Promise 包装，对用户完全隐藏了跨线程通信方面复杂性

简而言之，在提供底层 API 能力的同时，针对面向对象、多线程等环节提供简单易用的 API。

