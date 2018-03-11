---
title: "Go语言变态用法"
date: 2013-06-27
draft: false

tags: [golang]
categories: [golang]
---

今天为了提交notepad++高亮的BUG, 写了一个变态代码.

BUG地址: [https://code.google.com/p/go/issues/detail?id=5798](https://code.google.com/p/go/issues/detail?id=5798)

下面是稍微调整后的代码([http://play.golang.org/p/RYq82b7BN2](http://play.golang.org/p/RYq82b7BN2)):

	package main

	import "fmt"

	type int byte

	func (p int) Foo() {
		fmt.Printf("int.Foo: %v\n", p)
	}

	func int_Foo(x byte) {
		f1 := int.Foo
		f1(int(x))
		f2 := int(x).Foo
		f2()
	}

	func main() {
		int_Foo(32)
	}

代码输出:

	int.Foo: 32
	int.Foo: 32

主要有以下几个特性:

 - 内置类型 `int` 被重新定义, 这里是被定义为类型, 其实也可以被定义为变量名
 - 新类型 `int` 的方法表达式(method expressions): `int.Foo`
 - 新类型 `int` 的方法值(method expressions): `int(x).Foo`
 - 不能被递归定义为自身类型, 比如 `type int int`. 会导致无效递归类型错误: "invalid recursive type int".
