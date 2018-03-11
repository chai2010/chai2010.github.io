---
title: "用ASCII画图"
date: 2017-11-15
draft: false

tags: ["graphviz", "plantuml", "monodraw"]
categories: []
---

作为一个严肃的码农，用ASCII画图是一门艺术。

## [MonoDraw](https://monodraw.helftone.com/) - ASCII 画图界的PS

当然，我们并不是要像用小刀刻硬盘那样一个一个字符来画图，在ASCII画图领用也有类似PhotoShop那样的软件，那就是大名鼎鼎的 MonoDraw ！

![](/images/ascii-draw-01.png)

要注意的是这个软件只有 macOS 版本，而且是收费软件(100+RMB)。

比如我们用 [MonoDraw](https://monodraw.helftone.com/)  画一个 iPhone, 然后在窗口显示一个文本:

![](/images/ascii-draw-02.png)

## [Ditaa](http://ditaa.sourceforge.net/) - ASCII 图像打印机

Ditaa 是 Java 写的一个开源小工具，它可以将ASCII码图打印为漂亮的png格式图片。

比如有以下样式的ASCII码图：

![](/images/ascii-draw-03.png)

渲染后的效果是这样的:

![](/images/ascii-draw-04.png)

这里是打包好的 Docker 镜像(也有很多例子)： https://github.com/chai2010/ditaa-docker

## 其它工具

还有很多其它知名度很高小工具，这里只是简单列举几个：

- [Graphviz](http://www.graphviz.org/): 通过自定义的DOT语言脚本描述图形，然后渲染为图像文件
- [PlantUML](http://plantuml.com/): 通过自定义的脚本语言描述UML图，然后渲染为图像文件
- [Gnuplot](http://www.gnuplot.info/): 一个生成图标的小工具(它和GNU项目没关系)
