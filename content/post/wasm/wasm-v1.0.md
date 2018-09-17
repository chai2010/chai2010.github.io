---
title: "Ending定律即将生效!"
date: 2018-09-16
draft: false

tags: [wasm]
categories: [wasm]
---

WebAssembly草案1.0终于在2018年7月正式诞生，Ending定律即将生效！

<!--more-->

*Ending's law: "Any application that can be compiled to WebAssembly, will be compiled to WebAssembly eventually."*

![](/images/wasm/wasm-book-header.png)


Ending定律也称为终结者定律，它是Ending在2016年Emscripten技术交流会上给出的断言：所有可以用WebAssembly实现的终将会用WebAssembly实现。

在2018年7月，WebAssembly的第一份标准草案终于诞生，一切准备就绪。终于到了Ending定律生效的时刻了！


WebAssembly也叫wasm，是最新的Web汇编语言标准，同时涵盖了一个虚拟机标准，可以用于浏览器或者其它嵌入式环境。WebAssembly被刻意设计为便携式的抽象语法树结构，用于提供比JavaScript更快速的编译和运行。2018年，Firefox、Chrome、Microsoft Edge、Safari等主流的浏览器已经充分支持WebAssembly特性。


我们知道在JavaScript领域有个木头定律，但是木头定律不适用于WebAssembly！因为WebAssembly是为了性能而诞生，再用JavaScript模拟的WebAssembly性能将是一坨屎，没有任何价值！但是WebAssembly之上却很有可能再跑一个v8引擎。

Ending定律的威力不仅仅在语言层面。WebAssembly是第一个虚拟机世界标准，以后将人手至少一个wasm虚拟机。曾被大家鄙视的JavaScript语言大举入侵各个领域的情况将再次重演，Lua、Java、Python等语言首当其冲，它们的虚拟机统统将面临被WebAssembly蚕食的境况！

星辰大海的入口已经打开，let’s dive!
