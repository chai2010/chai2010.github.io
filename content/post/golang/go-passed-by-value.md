---
title: "Go语言的传参和传引用"
date: 2013-09-14
draft: false

tags: ["golang"]
categories: []
---

## 传参和传引用的问题

很多非官方的文档和教材(包括一些已经出版的图书), 对Go语言的传参和引用的讲解
都有很多问题. 导致众多Go语言新手对Go的函数参数传参有很多误解.

而传参和传引用是编程语言的根本问题, 如果这个问题理解错误可能会导致很多问题.

## 传slice不是传引用!

首先, Go语言的函数调用参数全部是传值的, 包括 `slice`/`map`/`chan` 在内所有类型, 没有传引用的说法.

具体请看Go语言的规范:

> After they are evaluated, **the parameters of the call are passed by value** to the function and the called function begins execution.

> from: [http://golang.org/ref/spec#Calls](http://golang.org/ref/spec#Calls)


## 什么叫传引用?

比如有以下代码:

	var a Object
	doSomething(a) // 修改a的值
	print(a)

如果函数`doSomething`修改`a`的值, 然后`print`打印出来的也是修改后的值,
那么就可以认为`doSomething`是通过引用的方式使用了参数`a`.


## 为什么传slice不是传引用?

我们构造以下的代码:

	func main() {
		a := []int{1,2,3}
		fmt.Println(a)
		modifySlice(a)
		fmt.Println(a)
	}

	func modifySlice(data []int) {
		data = nil
	}

其中`modifySlice`修改了切片`a`, 输出结果如下:

	[1 2 3]
	[1 2 3]

说明`a`在调用`modifySlice`前后并没有任何变化, 因此`a`必然是传值的!

## 为什么很多人误以为slice是传引用呢?

可能是FAQ说slice是引用类型, 但并不是传引用!

下面这个代码可能是错误的根源:

	func main() {
		a := []int{1,2,3}
		fmt.Println(a)
		modifySliceData(a)
		fmt.Println(a)
	}

	func modifySliceData(data []int) {
		data[0] = 0
	}

输出为:

	[1 2 3]
	[0 2 3]

函数`modifySliceData`确实通过参数修改了切片的内容.

但是请注意: 修改通过函数修改参数内容的机制有很多, 其中传参数的地址就可以修改参数的值(其实是修改参数中指针指向的数据), 并不是只有引用一种方式!

## 传指针和传引用是等价的吗?

比如有以下代码:

	func main() {
		a := new(int)
		fmt.Println(a)
		modify(a)
		fmt.Println(a)
	}

	func modify(a *int) {
		a = nil
	}

输出为:

	0xc010000000
	0xc010000000

可以看出指针`a`本身并没有变化. 传指针或传地址也只能修改指针指向的内存的值,
并不能改变指针本身在值.

**因此, 函数参数传传指针也是传值的, 并不是传引用!**

## 所有类型的函数参数都是传值的!

包括`slice`/`map`/`chan`等基础类型和自定义的类型都是传值的.

但是因为`slice`和`map`/`chan`底层结构的差异, 又导致了它们传值的影响并不完全等同.

重点归纳如下:

- GoSpec: the parameters of the call are passed by value!
- map/slice/chan 都是传值, 不是传引用
- map/chan 对应指针, 和引用类似
- slice 是结构体和指针的混合体

- slice 含 values/count/capacity 等信息, 是按值传递
- slice 中的 values 是指针, 按值传递
- 按值传递的 slice 只能修改values指向的数据, 其他都不能修改

- 以指针或结构体的角度看, 都是值传递!


## 那Go语言有传引用的说法吗?

Go语言其实也是有传引用的地方的, 但是不是函数的参数, 而是闭包对外部环境是通过引用访问的.

查看以下的代码:

	func main() {
		a := new(int)
		fmt.Println(a)
		func() {
			a = nil
		}()
		fmt.Println(a)
	}

输出为:

	0xc010000000
	<nil>

因为闭包是通过引用的方式使用外部环境的`a`变量, 因此可以直接修改`a`的值.

比如下面2段代码的输出是截然不同的, 原因就是第二个代码是通过闭包引用的方式输出`i`变量:

	for i := 0; i < 5; i++ {
		defer fmt.Printf("%d ", i)
		// Output: 4 3 2 1 0
	}

	fmt.Printf("\n")
		for i := 0; i < 5; i++ {
		defer func(){ fmt.Printf("%d ", i) } ()
		// Output: 5 5 5 5 5
	}

像第二个代码就是于闭包引用导致的副作用, 回避这个副作用的办法是通过参数传值或每次闭包构造不同的临时变量:

	// 方法1: 每次循环构造一个临时变量 i
	for i := 0; i < 5; i++ {
		i := i
		defer func(){ fmt.Printf("%d ", i) } ()
		// Output: 4 3 2 1 0
	}
	// 方法2: 通过函数参数传参
	for i := 0; i < 5; i++ {
		defer func(i int){ fmt.Printf("%d ", i) } (i)
		// Output: 4 3 2 1 0
	}

## 什么是引用类型, 和指针有何区别/联系 ?

在Go语言的官方FAQ中描述, `maps`/`slices`/`channels` 是引用类型, 数组是值类型:

> **Why are maps, slices, and channels references while arrays are values?**

> There's a lot of history on that topic. Early on, maps and channels were syntactically pointers and it was impossible to declare or use a non-pointer instance. Also, we struggled with how arrays should work. Eventually we decided that the strict separation of pointers and values made the language harder to use. Changing these types to act as references to the associated, shared data structures resolved these issues. This change added some regrettable complexity to the language but had a large effect on usability: Go became a more productive, comfortable language when it was introduced.

> from: [http://golang.org/doc/faq#references](http://golang.org/doc/faq#references)

我个人理解, 引用类型和指针在底层实现上是一样的.
但是引用类型在语法上隐藏了显示的指针操作.
引用类型和函数参数的传引用/传值并不是一个概念.

我们知道 `maps`/`slices`/`channels` 在底层虽然隐含了指针,
但是使用中并没有需要使用指针的语法.
但是引用内存毕竟是基于指针实现, 因此就必须依赖 `make`/`new` 之类的函数才能构造出来.
当然它们都支持字面值语法构造, 但是本质上还是需要一个构造的过程的.

要用好Go语言的引用类型, 必须要了解一些底层的结构(特别是`slice`的混合结构).

我们可以自己给Go语言模拟一个引用类型.
我们可以将值类型特定的数组类型定义为一个引用类型(同时提供一个构造函数):

	type RefIntArray2 *[2]int

	func NewRefIntArray2() RefIntArray2 {
		return RefIntArray2(new([2]int))
	}

这样我们就可以将 `RefIntArray2` 当作引用类型来使用.

	func main() {
		refArr2 := NewRefIntArray2()
		fmt.Println(refArr2)
		modifyRefArr2(refArr2)
		fmt.Println(refArr2)
	}

	func modifyRefArr2(arr RefIntArray2) {
		arr[0] = 1
	}

输出为:

	&[0 0]
	&[1 0]

之所以选择数组作为例子, 是因为Go语言的数组指针可以直接用`[]`访问的语法糖.
所以, 引用类型一般都是底层指针实现, 只是在上层加上的语法糖而已.

*注: 本节根据 @hooluupog 和 @LoongWong 的评论做的补充.*

## 总结

- 函数参数传值, 闭包传引用!
- slice 含 values/count/capacity 等信息, 是按值传递
- 按值传递的 slice 只能修改values指向的数据, 其他都不能修改
- slice 是结构体和指针的混合体
- 引用类型和传引用是两个概念
