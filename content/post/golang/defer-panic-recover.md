---
title: "Defer, Panic, and Recover[翻译]"
date: 2013-04-01
draft: false

tags: ["golang"]
categories: []
---

- 原文： [http://golang.org/doc/articles/defer_panic_recover.html](http://golang.org/doc/articles/defer_panic_recover.html) (**被墙**)
- 中文： [http://zh-golang.appsp0t.com/doc/articles/defer_panic_recover.html](http://zh-golang.appsp0t.com/doc/articles/defer_panic_recover.html)

Go语言提供一般的流程控制语句: `if`, `for`, `switch`, `goto`. 同时它还提供go语句来执行一个 goroutine. 这里我们将介绍几个不太常见的语句: `defer`, `panic`, 和 `recover`.

一个 `defer` 调用的函数将被暂时保存到调用列表中. 保存的调用列表在当前环境返回的时候被执行.   `Defer` 一般可以用于简化代码, 执行各种清理操作.

让我们演示一个文件复制的例子: 函数需要打开两个文件, 然后将其中一个文件的内容复制到另一个文件:

	func CopyFile(dstName, srcName string) (written int64, err error) {
		src, err := os.Open(srcName)
		if err != nil {
			return
		}

		dst, err := os.Create(dstName)
		if err != nil {
			return
		}

		written, err = io.Copy(dst, src)
		dst.Close()
		src.Close()
		return
	}

上面的代码虽然能够工作, 但是隐藏一个bug. 如果第二个`os.Open`调用失败, 那么会在没有释放 source文件资源的情况下返回. 虽然我们可以通过在第二个返回语句前添加src.Close()调用 来修复这个bug; 但是当代码变得复杂时, 类似bug将很难被发现和修复. 通过`defer`语句, 我们可以确保 每个文件被关闭:

	func CopyFile(dstName, srcName string) (written int64, err error) {
		src, err := os.Open(srcName)
		if err != nil {
			return
		}
		defer src.Close()

		dst, err := os.Create(dstName)
		if err != nil {
			return
		}
		defer dst.Close()

		return io.Copy(dst, src)
	}

Defer语言可以让我们在打开文件时就思考如何关闭文件. 不管函数如何返回, 文件关闭语句始终会被执行.

Defer语句的行为简单且可预测. 有三个基本原则:

*1. 当defer调用函数的时候, 函数用到的每个参数和变量的值也会被计算*

在这个例子中, 表达式`"i"`的值将在`defer fmt.Println(i)`时被计算. Defer将会在 当前函数返回的时候打印`"0"`.

	func a() {
		i := 0
		defer fmt.Println(i)
		i++
		return
	}

*2. Defer调用的函数将在当前函数返回的时候, 以后进先出的顺序执行.*

下面的函数将输出`"3210"`:

	func b() {
		for i := 0; i < 4; i++ {
			defer fmt.Print(i)
		}
	}

*3. Defer调用的函数可以在返回语句执行后读取或修改命名的返回值.*

在这个例子中, `defer`语句将会在当前函数返回后将`i`增加`1`. 实际上, 函数会返回`2`:

	func c() (i int) {
		defer func() { i++ }()
		return 1
	}

利用该特性, 我们可以方便修改函数的错误返回值. 以后应该可以看到类似的例子.

`Panic` 是一个内置的函数: 停止当前控制流, 然后开始`panicking`. 当F函数调用`panic`, `F`函数将停止执行后续的普通语句, 但是之前的`defered`函数调用仍然被正常执行, 然后再返回到F的调用者. 对于F函数的调用者, F 的行为和直接调用`panic`函数类似. 以上的处理流程会一直沿着调用栈回朔, 直到 当前的goroutine返回引起程序崩溃! Panics可以通过直接调用`panic`方式触发, 也可以由某些运行时 错误触发, 例如: 数组的越界访问.

`Recover` 也是一个内置函数: 用于从 `panicking` 恢复. `Recover` 和 `defer` 配合使用会非常有用. 对于一个普通的执行流程, 调用`recover`将返回`nil`, 也没有任何效果. 但如果当前goroutine处于 `panicking`状态, `recover`调用会捕获触发`panic`时的参数, 并且恢复到正常的执行流程.

下面的例子演示了 `panic` 和 `defer` 配合使用的技术:

	package main

	import "fmt"

	func main() {
		f()
		fmt.Println("Returned normally from f.")
	}

	func f() {
		defer func() {
			if r := recover(); r != nil {
				fmt.Println("Recovered in f", r)
			}
		}()
		fmt.Println("Calling g.")
		g(0)
		fmt.Println("Returned normally from g.")
	}

	func g(i int) {
		if i > 3 {
			fmt.Println("Panicking!")
			panic(fmt.Sprintf("%v", i))
		}
		defer fmt.Println("Defer in g", i)
		fmt.Println("Printing in g", i)
		g(i + 1)
	}

函数`g`有一个整型参数`i`, 在参数`i`大于`3`时将触发`panic`异常, 否则将以`i+1`为参数递归调用自己. 函数f通过`defers`中调用`recover`来捕获异常, 并输出触发异常的参数(如果不是`nil`的话). 在查看 输出结果前, 读者可以自己现预测一下输出结果.

程序的输出:

	Calling g.
	Printing in g 0
	Printing in g 1
	Printing in g 2
	Printing in g 3
	Panicking!
	Defer in g 3
	Defer in g 2
	Defer in g 1
	Defer in g 0
	Recovered in f 4
	Returned normally from f.

如果我们从函数`f`中移除 `deferred` 语句, `panic`在扩散到goroutine栈顶前将不会被捕获, 最终会引起 程序崩溃. 下面是修改后的输出结果:

	Calling g.
	Printing in g 0
	Printing in g 1
	Printing in g 2
	Printing in g 3
	Panicking!
	Defer in g 3
	Defer in g 2
	Defer in g 1
	Defer in g 0
	panic: 4

	panic PC=0x2a9cd8
	[stack trace omitted]

一个真实的`panic` 和 `recover`配合使用的用例可以参考标准库: [json package](http://golang.org/pkg/encoding/json/). 它提供JSON格式的解码, 当 遇到非法格式的输入时会抛出`panic`异常, 然后`panicking`扩散到上一级调用者堆栈, 由上一级调用者通过`recover`捕获`panic`和错误信息(参考 [decode.go](http://golang.org/src/pkg/encoding/json/decode.go) 中的 'error' 和 'unmarshal').

Go库的实现习惯: 即使在`pkg`内部使用了`panic`, 但是在导出API时会被转化为明确的错误值.

另一个使用 `defer` 的场景是释放 `mutex` (参考前面给出的`file.Close()`例子):

    mu.Lock()
    defer mu.Unlock()

打印页眉和页脚：

    printHeader()
    defer printFooter()

更多.

总而言之, `defer` 语句(不管是否包含`panic` 和 `recover`)提供了一种不同寻常且十分强大的控制流机制. 它可以用于模拟一些其他语言中的某些特殊的语法结构. 享受defer带来的便利吧!
