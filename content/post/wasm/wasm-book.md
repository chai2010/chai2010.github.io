---
title: "《WebAssembly 标准入门》开始预售了，欢迎关注!"
date: 2018-12-07
draft: false

tags: [wasm]
categories: [wasm]
---

WebAssembly 是一种新兴的网页虚拟机标准，它的设计目标包括高可移植性、高安全性、高效率（包括载入效率和运行效率）、尽可能小的程序体积。本书详尽介绍了 WebAssembly 程序在 JavaScript 环境下的使用方法、WebAssembly 汇编语言和二进制格式，给出了大量简单易懂的示例，同时以 C/C++和 Go 语言开发环境为例，介绍了如何使用其他高级语言开发 WebAssembly 模块。

<!--more-->

![](http://erpimg.epubit.com:8081/upload/img/erp/A20181946.jpg)

## 序

某一天，有朋友向我推荐了一项新技术——WebAssembly。我认为这是一项值得关注的技术。

说WebAssembly是一门编程语言，但它更像一个编译器。实际上它是一个虚拟机，包含了一门低级汇编语言和对应的虚拟机体系结构，而WebAssembly这个名字从字面理解就说明了一切——Web的汇编语言。它的优点是文件小、加载快、执行效率非常高，可以实现更复杂的逻辑。

其实，我觉得出现这样的技术并不令人意外，而只是顺应了潮流，App的封闭系统必然会被新一代Web OS取代。但现有的Web开发技术，如JavaScript，前端执行效率和解决各种复杂问题的能力还不足，而WebAssembly的编译执行功能恰恰能弥补这些不足。WebAssembly标准是在谋智（Mozilla）、谷歌（Google）、微软（Microsoft）、苹果（Apple）等各大厂商的大力推进下诞生的，目前包括Chrome、Firefox、Safari、Opera、Edge在内的大部分主流浏览器均已支持WebAssembly。这使得WebAssembly前景非常好。

WebAssembly是Web前端技术，具有很强的可移植性，技术的潜在受益者不局限于传统的前端开发人员，随着技术的推进，越来越多的其他语言的开发者也将从中受益。如果开发者愿意，他们可以使用C/C++、Go、Rust、Kotlin、C#等开发语言来写代码，然后编译为WebAssembly，并在Web上执行，这是不是很酷？它能让我们很容易将用其他编程语言编写的程序移植到Web上，对于企业级应用和工业级应用都是巨大利好。

WebAssembly的应用场景也相当丰富，如Google Earth，2017年10月Google Earth开始在Firefox上运行，其中的关键就是使用了WebAssembly；再如网页游戏，WebAssembly能让HTML5游戏引擎速度大幅提高，国内一家公司使用WebAssembly后引擎效率提高了300%。

WebAssembly作为一种新兴的技术，为开发者提供了一种崭新的思路和工作方式，未来是很有可能大放光彩的，不过目前其相关的资料和社区还不够丰富，尽管已经有一些社区开始出现了相关技术文章，CSDN上也有较多的文章，但像本书这样全面系统地介绍WebAssembly技术的还不多，甚至没有。本书的两位作者都是有10多年经验的一线开发者，他们从WebAssembly概念诞生之初就开始密切关注该技术的发展，其中柴树杉是Emscripten（WebAssembly的技术前身之一）的首批实践者，丁尔男是国内首批工程化使用WebAssembly的开发者。

2018年7月，WebAssembly社区工作组发布了WebAssembly 1.0标准。现在，我在第一时间就向国内开发者介绍和推荐本书，是希望开发者能迅速地了解和学习新技术，探索新技术的价值。

*——蒋涛 CSDN创始人、总裁，极客帮创始合伙人*
