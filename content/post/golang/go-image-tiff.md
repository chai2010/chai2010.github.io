---
title: "go.image/tiff 的一些问题"
date: 2013-09-20
draft: false

tags: ["golang", "tiff"]
categories: ["golang"]
---

最近给 [go.image/tiff](https://code.google.com/p/go/source/list?repo=image)
增加了 Tile/Gray/Gray16/RGB16bit 等格式的支持.
还有一些特性以后会陆续完善.

Go语言图像库的基本思路是能尽量提供完善的解码功能(当然只支持文件的第一个图像).
而编码功能则比较有限, 主要是支持基本的不同颜色模型, TIFF特有的特性应该不会完整支持.

最近有用户反馈生成的tiff在Mac系统不能正常浏览([Issue6421](https://code.google.com/p/go/issues/detail?id=6421)).
而我自己的Win7/64可以正常打开有问题的图像. 用 `tiffinfo` 也没有看到什么异常的Tag(有问题的已经修改之后).

之后无意中用GIMP也不能打开Mac有问题的tiff影像.
既然问题已经重现, 查找原因就容易多了.

初步分析之后, 发现问题主要是针对非RGB的图像(灰度和调色板).
然后发现, go.image/tiff的Encode函数对非RGB的影像都写了ExtraSamples标签,
而这个函数只有对波段数大于RGB的3的时候才会起作用(具体看TIFF Spec的介绍).

当然, 有些容错性较好的程序可以忽略无效的ExtraSamples标签(比如Windows下的很多程序).
但是, 如果严格按照TIFF规范的话, 包含ExtraSamples标签的灰度和调色板格式确实是有问题的.
修复这个问题之后([CL13779043](https://codereview.appspot.com/13779043/)), GIMP就可以正常工作了(Mac部分还在等待用户反馈).

经过这个BUG发现, 还是要非常了解TIFF格式规范, 不然实现中很容易带入一些错误的理解.
当然, `go.image/tiff` 的测试也需要继续完善.

关于TIFF的介绍请参考: [TIFF6.0格式简介](http://my.oschina.net/chai2010/blog/158550)
