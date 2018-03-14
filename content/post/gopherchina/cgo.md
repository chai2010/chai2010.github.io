---
title: "GopherChina 2018 - 深入CGO编程"
date: 2018-04-13
draft: true

tags: [
	"golang", "gopherchina", "cgo",
]
categories: [
	"gopherchina",
]
---

了解如何更好地使用CGO，如何避免CGO技术中的一些技术陷阱，最终你将获得半个世纪以来C/C++领域丰富的软件遗产。

<!--more-->

C/C++经过几十年的发展，已经积累了庞大的软件资产，它们很多久经考验而且性能已经足够优化。Go语言必须能够站在C/C++这个巨人的肩膀之上，有了海量的C/C++软件资产之后，我们可以更放心愉快地用Go语言编程。C语言作为一个通用语言，很多库会选择提供一个C兼容的API，然后用其他不同的编程语言实现。Go语言通过自带的一个叫CGO的工具来支持C语言函数调用，同时我们可以用Go语言导出C动态库接口给其它语言使用。Go语言甚至实现了对iOS平台的Object-C语言的支持，而这正是对CGO技术的具体应用。本次分享将深入探讨CGO相关的应用。

![深入CGO编程](/images/gopherchina2018-chai2010-cgo.jpg)


- [https://chai2010.cn/talks/cgo2018/](/talks/cgo2018/)

-----

- [Gopher China 2018 讲师专访－柴树杉](/post/gopherchina/gopherchina2018-chai2010/)
- [GopherChina 2018 - 中国·上海](http://2018.gopherchina.org)

