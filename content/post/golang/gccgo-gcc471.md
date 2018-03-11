---
title: "Gccgo in GCC 4.7.1[翻译]"
date: 2013-04-01
draft: false

tags: ["gccgo", "golang", "翻译"]
categories: []
---

英文原文: [http://blog.golang.org/2012/07/gccgo-in-gcc-471.html](http://blog.golang.org/2012/07/gccgo-in-gcc-471.html)

Go语言开始就由一个[语言规范][1]定义，并不是倚赖某个具体实现。Go开发小组针对语言规范，实现了两个不同版本的编译器：gc和gccgo。  有两个不同的实现有助于保持语言规范的完整和完整：当两个实现相互冲突时，我们修改语言规范，或者是修改实现以保持和规范一致。  Gc是默认的编译器，专门针对go编写。Gccgo是另一个不同实现（有不同的侧重目标），下面我们将详细介绍。

Gccgo是作为gcc的一个部分发布，属于gcc编译器集合。GCC前端可以支持多种不同的编程语言：gccgo是针对go语言的前端实现。Go前端同时保持和GCC相对独立，它的设计目标之一是可以连接的到不同的编译器后端，当然目前只支持GCC。

gccgo的编译速度比gc较慢一点，但是可以生成更优的代码，因此程序执行速度会更快。GCC的优化技术经过多年完善，涵盖 循环优化、指令等各个方面。虽然gccgo不一定总是产生最好的代码，但是在某些情况下它编译的程序运行效率可以提高达30%。

GC编译器只支持主流的处理器： X86(32/64位)和ARM。Gccgo可以支持GCC所支持的绝大部分类型处理器。目前gccgo已经测试的处理器类型包括：X86(32/64)、SPARC、MIPS、PowerPC和Alpha等。  Gccgo也测试了GC编译器所不支持的操作系统，特别是Solaris系统。

Gccgo同时提供了标准且完备的go语言标准库。gccgo和gc的关于Go运行时的一些特性也尽量保持一致，比如：goroutine的调度、channels、内存分配和垃圾回收等。Gccgo在X86已经支持goroutine的动态堆栈，需要使用gold连接器（在其他处理器，每个goroutine还是会分配一个大的栈，如果出现深度的函数嵌套调用会导致堆栈溢出）。

目前发布的Gccgo还不包含go命令。 但是通过Go正式版本安装的go命令已经可以支持gccgo，需要使用 -compiler选项：`go build -compiler gccgo myprog` 。用于连接Go和C/C++的cgo和SWIG工具同样支持gccgo。

我们已经将针对GCC的Go前端采用和Go相同的BSD许可证发布。可以从 [gofrontend Google Code project][2] 下载代码。需要注意的是Go前端和GCC后端连接时，采用GPL许可证(译注： 应该是BSD被GPL传染的原因)。

最新的GCC 4.7.1，包含的gccgo完美支持Go1。对于用户，如果需要更好编译优化，或者是使用GC所不支持的处理器或操作系统，gccgo可能是一个更好的选择。

*by Ian Lance Taylor*

  [1]: http://golang.org/ref/spec
  [2]: http://code.google.com/p/gofrontend
