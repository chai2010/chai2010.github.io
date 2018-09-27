
---
title: "《C++面向wasm编程》开源！[转]"
date: 2018-09-25
draft: false

tags: ["wasm"]
categories: ["wasm"]
---

[https://chai2010.cn](https://chai2010.cn) 只是目前的入口. 网址名称并不重要, 关键是内容需要永生.

目前支持WebAssembly的各种高级语言中，与WebAssembly匹配度最高的无疑是C/C++，为此，我们将开源编写《C++面向wasm编程》一书。本书将围绕“如何开发对WebAssembly友好的C/C++程序”这一中心，从Emscripten工具链的使用、C/C++与JavaScript互操作、一般性的设计原则等多方面介绍相关知识，并分享作者在实际工程应用中总结出的诸多经验。

<!--more-->

![](https://raw.githubusercontent.com/3dgen/cppwasm-book/master/cover.png)

原文：https://mp.weixin.qq.com/s/o4NIuc67eV3U_FGODT0ufA

----

# 目录

* 第0章 WebAssembly简介
* 第1章 Emscripten快速入门
  * 1.1 安装Emscripten
  * 1.2 你好，世界！
  * 1.3 胶水代码初探
  * 1.4 编译目标及编译流程
* 第2章 C与JavaScript互操作
  * 2.1 JavaScript调用C函数
  * 2.2 JavaScript函数注入C
  * 2.3 单向透明的内存模型
  * 2.4 JavaScript与C交换数据
  * 2.5 EM_ASM宏
  * 2.6 emscripten_run_script函数
* 第3章 Emscripten运行时
  * 3.1 main函数与生命周期
  * 3.2 消息循环
  * 3.3 文件系统
  * 3.4 内存管理
  * 3.5 Module定制
* 第4章 WebAssembly友好的一般性方法
  * 4.1 消息循环分离
  * 4.2 数据对齐
  * 4.3 使用C接口导出C++对象
  * 4.4 C++对象生命周期控制
  * 4.5 使用C接口注入JavaScript对象
  * 4.6 小心int64
  * 4.7 忘掉文件系统
* 第5章 网络IO
  * 5.1 websocket
  * 5.2 ajax
  * 5.3 fetch
  * 5.4 一个通用的网络IO小框架
* 第6章 多线程
  * 6.1 JavaScript中的多线模型
  * 6.2 一个例子
  * 6.3 一个通用的多线程小框架
* 第7章 GUI及交互
  * 7.1 canvas
  * 7.2 鼠标事件
  * 7.3 键盘事件
  * 7.4 触屏事件
* 第8章 工程管理
  * 8.1 使用Makefile
  * 8.2 静态库

项目地址：

https://github.com/3dgen/cppwasm-book

欢迎围观。加星可以鼓励作者尽快更新哦！
