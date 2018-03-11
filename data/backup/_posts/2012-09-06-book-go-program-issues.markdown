---
layout: post
title: "关于《Go语言编程》中的一些问题"
date: 2012-09-06 20:30:01 +0800
comments: true
categories: [Go]
---

最近基本看完了《Go语言编程》, 总得感觉还不错, 比较适合Go语言初学者.

![](http://www.ituring.com.cn/bookcover/967.385.jpg)

书中有几个地方描述的可能不太准确，列下来和大家讨论。

### 0.  6页 1.2.4 错误处理

3个关键字为defer、panic和recover。

panic和recover 并不是关键字，而是内置函数。

参考Go Spec 的 Keywords：

	break        default      func         interface    select
	case         defer        go           map          struct
	chan         else         goto         package      switch
	const        fallthrough  if           range        type
	continue     for          import       return       var

Go有很多内置函数和类型，具体参考builtin包。
比如可以将bool等内置类型用作一个普通变量：

	bool := 10
	fmt.Printf("bool = %v\n", bool)

输出: `bool = 10`


### 1. 21页 2.1.2 变量初始化

	var v1 int = 10
	var v2 = 10
	v3 := 10

书中说3种用法完全一样其实并不准确。

查看Go spec的 "Short variable declarations" 描述:

> Short variable declarations may appear only inside functions.

第三种用法只能在函数内部使用。

另外，后面的 “出现在:=左侧的变量不应该是被声明过的，否则会导致编译错误” 也不太准确。

因为，根据spec描述，左边至少要有一个新的变量（不含_），被被声明过的其他变量会被重复被声明过。
比如：

	field1, offset := nextField(str, 0)
	field2, offset := nextField(str, offset)  // redeclares offset


### 2. 24页 2.2.4 枚举

书中提到一个常规的枚举表示法，定义一些列常量：

	const (
		Sunday = iota
		Monday
		Tuesday
		Wednesday
		Thursday
		Friday
		Saturday
		numberOfDays
	)

其实，这里只是定义了一组常量，并不是枚举类型，它们和以下代码等价：

	const (
		Sunday = 0
		Monday = 1
		Tuesday = 2
		Wednesday = 3
		Thursday = 4
		Friday = 5
		Saturday = 6
		numberOfDays = 7
	)

### 3. 33页 2.3.8.1 创建数组切片/基于数组

“甚至可以创建一个比所基于的数组还要大的切片” 说法不准确。

如果切换超出数组的范围:

	myArray := [5]int{1,2,3,4,5}
	mySlice := myArray[1:6]
	fmt.Printf("mySlice = %v\n", mySlice)

运行时会抛出异常：`slice index out of bounds`。

### 4. 39页 2.4 流程控制

关于条件语句的最后一个注意点： 在有返回值的函数中，不允许将“最终的” return 包含在 if/else 中，
否则会编译失败。

如果末尾加 `panic` 的话，可以正常编译。

	func example(x int) int {
		if x == 0 {
			return 5
		} else {
			return x
		}
		panic("")
	}

注: Go1.1已经修复了该问题.

### 5. 63页 3.1 类型系统 3.1.1 类型系统

“在需要的时候，你可以给任何类型（包括内置类型）‘增加’新方法。”

“在Go语言中，你可以给任意类型（包括内置类型，但不包括指针类型）添加相应的方法”

“可以给任意类型添加相应的方法” 是不允许的！

查看 Go Spec 的 Method declarations 一节描述：

> The type denoted by T is called the receiver base type;
> ...
> and it must be declared in the same package as the method.

类型的方法必须和类型的定义在同一个包内。因此，无法在包外给一个类型增加方法（包括内置类型）。

----

当然，书中的很多内容还是很好的，我比较喜欢  “面向对象编程/并发编程/进阶话题” 等内容。

**补充:**

以上都是第一版中存在的, 新版本中应该已经修复了.
感谢 许大 送的签名版《Go语言编程》.

