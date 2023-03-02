---
title: "Go语言的类型转换和类型断言"
date: 2013-09-15
draft: false

tags: ["golang"]
categories: [golang]
---

类型转换和类型断言是Go语言中比较绕的地方.

Go语言要求所有统一表达式的不同的类型之间必须做显示的类型转换.
而作为Go语言鼻祖的C语言是可以直接做隐式的类型转换的.
当然作为`const`类的字面值常量是要灵活很多的.

不过Go语言必须做显示的类型转换的要求也有例外的情况:

- **当普通`T`类型变量向`I`接口类型转换时是隐式的!**
- **当`IX`接口变量向`I`接口类型转换可以在编译期完成时是隐式的!**


## 类型之间转换的例子

下面是Go语言规范给出的部分例子:

	*Point(p)        // same as *(Point(p))
	(*Point)(p)      // p is converted to *Point
	<-chan int(c)    // same as <-(chan int(c))
	(<-chan int)(c)  // c is converted to <-chan int
	func()(x)        // function signature func() x
	(func())(x)      // x is converted to func()
	(func() int)(x)  // x is converted to func() int
	func() int(x)    // x is converted to func() int (unambiguous)

简单的说, `x`需要转换为`T`类型的语法是`T(x)`.
如果对于某些地方的优先级拿不准可以自己加`()`约束.

最后一个转换就是一个容易混淆的语句, 因此需要用括号`(func() int)(x)`提高优先级.

还有一个容易混淆的地方是 只读和只写的通道类型 `<-chan int`/`chan<- int` .

## 接口之间转换的例子

Go语言中接口的类型转换有很多奇怪的特性: 有时候是隐式转换, 有时候需要类型断言.

Go语言的接口之间虽然也有强制转换的语法, 但是因为接口间支持隐式转换, 因此接口之间
的强制转换语法只是一个摆设.

比如有以下2个接口类型:

	type IA interface {}
	type IB interface {Foo()}

`IA`要向`IB`转换如何操作呢? 这个操作无法在编译期确定, 因此必然不是类型转换.
由于2者都是接口类型, 因此肯定是类型断言:

	var a A
	var b = a.(B)

当然因为上面的代码中的`a`是`nil`, 会导致`a.(B)`错误.
但是请注意: **这只是运行错误, 并不是编译错误!**

`IB`要向`IA`转换如何操作呢? 这个操作可以在编译期确定, 因此必然是类型转换.

	var b B
	var a = A(b)

前面我们说过, Go语言的接口是隐式转换的, 因此还可以省略强制转换的语句:

	var b B
	var a = b

## 接口和类型之间的转换例子

虽然前面看到接口之间偶尔也会有类似普通类型之间的强制强制转换语法,
但从本意上来说接口是一个特殊的类型(和普通的类型区别).

我们先定义2个和前面的`IA`/`IB`匹配的普通类型(底层类型一样):

	type TA int
	type TB int
	func (TB) Foo() {}

如果是`TA`和`TB`之间的转换, 可以参考前面的**类型之间转换的例子**.
我们这里重点关注 `TA`/`TB` 和 `IA`/`IB` 之间的转换.

普通类型向接口类型转换是隐式的(可以编译期确定, 接口的隐式转换特权):

	var ta TA
	var ia = ta
	var tb TB
	var ib = tb

接口类型向普通类型是类型断言(运行期确定):

	var ia IA
	var ta = ia.(TA)
	var ib IB
	var tb = ib.(TB)

类型断言在编译期是没有任何保障的, 错误的代码也可以编译通过:

	var ta = ib.(TA)
	var tb = ia.(TB)

## 总结

因为Go语言的类型转换和类型断言设计的不够完美, 因此很难简单归纳.

下面是我整理的判断是类型转换还是类型断言的伪代码:

	func x 转换为 y
		if x 是接口吗 ? {
			if 可以编译期转换吗 ? {
				这是类型转换 (接口之间可以隐式转换)
				// 这里也可以用类型断言, 如果编译期不优化的效率可能低一些
			} else {
				这是类型断言 (运行时也可能会失败)
			}
		} else {
			if 可以编译期转换 ? {
				这是类型转换 (显示转换, 必须成功, 但可能会丢失数据)
			} else {
				禁止!
			}
		}
	}

我们可以看到, 当接口之间可以用类型转换的时候, 其实也是可以用类型断言的.

Go语言接口之间的转换是最混乱的特征之一. 期望Go2.0能够有所改善.