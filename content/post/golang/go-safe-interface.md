---
title: "Go语言中隐式接口的冲突问题"
date: 2015-05-19
draft: false

tags: ["golang"]
categories: ["golang"]
---

Go语言中采用的是隐式接口, 只要满足的接口的定义, 就可以当作接口使用.

比如内置的 `error` 接口:

```
type error struct {
	Error() string
}
```

隐式接口的好处有很多. 但我个人觉得最主要的一点就是不需要再去画祖宗八代的继承关系图了(松耦合).

但是隐式接口会带来冲突问题.

简单来说, 我也想定义一个自己的 `MyError` 接口, 里面也有一个 `Error() string` 方法:

```
type MyError struct {
	Error() string
}
```

但是我希望 `MyError` 接口 和 `error` 接口 是不同的类型 (不能相互转换).

当然, 在 Go语言中 `MyError` 接口 和 `error` 接口 是等价的, 禁止 相互转换 比较困难.

我们一般可以在 `MyError` 接口 中增加一个唯一的空方法 来回避这个问题:

```
type MyError struct {
	Error() string
	AssertMyError()
}
```

方法 `AssertMyError` 只是为了区别 `error` 接口, 没有其他用处.

这是 Protobuf 中 [proto.Message](http://godoc.org/github.com/golang/protobuf/proto#Message) 采用的方法:

```
// Message is implemented by generated protocol buffer messages.
type Message interface {
	Reset()
	String() string
	ProtoMessage()
}
```

生成的每个 `Message` 类型有个特殊的 `ProtoMessage` 空方法, 特别对应 `proto.Message` 接口.

当然, 如果有另一个接口刚好也有 `ProtoMessage` 方法, 还是有冲突的危险.

极端的做法是随机生成一个 特别的 方法名, 比如用 UUID 做唯一名字.

但是, 公开的名字依然有被别人恶意覆盖的危险(实际中不大可能).

更严格的做法是将这个用于区别接口的方法名定义为私有的方法. 比如 [`testing.TB`](http://godoc.org/testing#TB):

```
type TB interface {
	Error(args ...interface{})
	Errorf(format string, args ...interface{})
	Fail()
	FailNow()
	Failed() bool
	Fatal(args ...interface{})
	Fatalf(format string, args ...interface{})
	Log(args ...interface{})
	Logf(format string, args ...interface{})
	Skip(args ...interface{})
	SkipNow()
	Skipf(format string, args ...interface{})
	Skipped() bool

	// A private method to prevent users implementing the
	// interface and so future additions to it will not
	// violate Go 1 compatibility.
	private()
}
```

`private` 不仅仅是私有方法, 而且必须是 `testing` 包内部定义的 `private()` 方法的类型才能匹配这个接口!

因此 [`testing.TB`](http://godoc.org/testing#TB) 接口是全局唯一的, 不会出现等价可互换的接口.

现在 [`testing.TB`](http://godoc.org/testing#TB) 保证了接口的唯一性, 但是如何在外部实现 这个接口呢(`private()`是`testing` 包内部定义的)?

我们可以从 [`testing.TB`](http://godoc.org/testing#TB) 接口继承这个 `private()` 方法:

```
package main

import (
	"fmt"
	"testing"
)

type TB struct {
	testing.TB
}

func (p *TB) Fatal(args ...interface{}) {
	fmt.Println("TB.Fatal disabled!")
}

func main() {
	var tb testing.TB = new(TB)
	tb.Fatal("Hello, playground")
}
```

play 地址: [http://play.golang.org/p/tFB0fLwq9q](http://play.golang.org/p/tFB0fLwq9q)

上面的代码模拟了显式接口, 而且 [`testing.TB`](http://godoc.org/testing#TB) 接口永远不用担心有冲突的危险.

当然, 上面的代码有过度使用技巧的问题, 这和Go语言简单的编程哲学是矛盾的.
