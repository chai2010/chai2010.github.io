---
title: "Go语言的三元表达式"
date: 2014-02-25
draft: false

tags: ["golang"]
categories: ["golang"]
---

三元表达式的介绍在这里:

- [http://en.wikipedia.org/wiki/%3F:](http://en.wikipedia.org/wiki/%3F:)
- [http://en.wikipedia.org/wiki/IIf](http://en.wikipedia.org/wiki/IIf)

Go语言明确不支持三元表达式，这里是相关的讨论：
[https://groups.google.com/d/msg/golang-nuts/dbyqx_LGUxM/tLFFSXSfOdQJ](https://groups.google.com/d/msg/golang-nuts/dbyqx_LGUxM/tLFFSXSfOdQJ)

官方FAQ的说明在这里：
[http://golang.org/doc/faq#Does_Go_have_a_ternary_form](http://golang.org/doc/faq#Does_Go_have_a_ternary_form)

官方FAQ推荐的做法是用 `if` 代替：

	if expr {
		n = trueVal
	} else {
		n = falseVal
	}

不过用 `if` 的问题是变量 `n` 有作用域问题.
我们需要在 `if` 之前先定义变量 `n`，这样才可以在 `if` 语句之后使用变量 `n`。

	var n int
	if expr {
		n = trueVal
	} else {
		n = falseVal
	}
	println(n)

本来一个简单的 `n := expr? trueVal: falseVal` 就能够表达的问题，变的复杂了很多。
这和Go所追求的简单思路是有冲突的。

类似的有 `max`/`min` 等函数。因为这类函数使用频度比较高，在很多pkg的内部都定义了私有的实现。

	func max(a, b int) int {
		if a < b {
			return b
		}
		return a
	}

熟悉Go语言的用户应该可以发现，这个 `max` 只支持 `int` 类型。
对于支持泛型的C++语言来说，`max` 一般被实现为一个模板函数：

	template <class T>
	const T& max (const T& a, const T& b) {
		return (a<b)?b:a;     // or: return comp(a,b)?b:a; for version (2)
	}

在C++版本中，不仅用到的泛型`T`，还依赖 `a<b` 的运算符重载特性。
在C语言中，虽然没有泛型和运算符重载，但是三元表达式也具备全部的特性（因为表达式天生就是支持泛型的）。

而这些都是Go语言中缺少的特性。
不过在Go语言中可以模拟一个更普通的函数(`If` 的首字母大写，是函数名，不是 `if` 关键字)：

	func If(condition bool, trueVal, falseVal interface{}) interface{} {
		if condition {
			return trueVal
		}
		return falseVal
	}

	a, b := 2, 3
	max := If(a > b, a, b).(int)
	println(max)

有几个关键点：

- Go不支持运算符重载，因此需要先将 `a<b` 在函数外转换为 `bool` 条件
- Go不支持泛型，只能用 `interface{}` 模拟
- 返回的类型安全需要用户自己保证，`.(type)` 的类型必须匹配
- `interface{}` 是运行时泛型，性能没有编译时泛型高

由此可见，`?:` 不仅仅是一个简单的三元表达式。其实它更像一个内置的泛型版的函数（因为表达式天生就是支持泛型的）。

期望未来的Go版本中，能完善对 `?:` 三元表达式 和 编译时的泛型 的支持。

补充：
星星 同学的提示：可能会导致深入嵌套的滥用： `c?d?e?0:1:2:3` 。
因为三元表达式是一个表达式，必然是允许嵌套的。

不过我觉得嵌套不是问题的本质，函数也能导致嵌套的滥用。
但是不能因为滥用的行为来排斥有存在价值的语法（比如三元表达式）。
