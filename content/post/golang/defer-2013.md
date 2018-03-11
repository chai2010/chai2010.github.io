---
title: "使用Defer的几个场景"
date: 2013-06-23
draft: false

tags: [golang, c++]
categories: [c++]
---

<!-- 使用Defer几个场景 -->

Go 语言中的 `defer` 语句是 UNIX 之父 `Ken Thompson` 大神发明的, 是完全正交的设计.

也正因为 Go 语言遵循的是正交的设计, 所以才有了: "[少是指数级的多](http://www.mikespook.com/2012/06/%E7%BF%BB%E8%AF%91%E5%B0%91%E6%98%AF%E6%8C%87%E6%95%B0%E7%BA%A7%E7%9A%84%E5%A4%9A/)/[Less is exponentially more](http://commandcenter.blogspot.com/2012/06/less-is-exponentially-more.html)" 的说法. 因为是正交的设计, 最终得到的组合形式是指数级的组合形式.

相反, C++的特性虽然很多, 但是很多不是正交的设计, 而只是简单的特性罗列,
所以C++的很多地方是无法达到指数级的多的组合方式的. 但是学习成本却非常高.

简单的例子就是C++的构造函数和析构函数和C语言的函数和`struct`完全是互斥的.
具体的例子可以参考: [C++去掉构造函数会怎么样?](/post/cpp/fuck-cpp-constructor/)

关于 Go 语言中 `defer` 语句的详细介绍请参考: [Defer, Panic, and Recover](/post/golang/defer-panic-recover/) .

C++ 中模拟的 `defer` 实现请参考: [C++版的defer语句](/post/cpp/cpp-defer/) .

这里主要是总结 `defer` 语句的一些使用场景.

*1. 简化资源的回收*

这是最常见的 `defer` 用法. 比如:

	mu.Lock()
	defer mu.Unlock()

当然, `defer` 也有一定的开销, 也有为了节省性能而回避使用的 `defer` 的:

	mu.Lock()
	count++
	mu.Unlock()

从简化资源的释放角度看, `defer` 类似一个语法糖, 好像不是必须的.

*2. `panic`异常的捕获*

`defer` 除了用于简化资源的释放外, 还是Go语言异常框架的一个组成部分.

Go语言中, `panic`用于抛出异常, `recover`用于捕获异常. `recover`只能在`defer`语句中使用, 直接调用`recover`是无效的.

比如:

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
		g()
		fmt.Println("Returned normally from g.")
	}

	func g() {
		panic("ERROR")
	}

因此, 如果要捕获Go语言中函数的异常, 就离不开`defer`语句了.

*3. 修改返回值*

`defer` 除了用于配合 `recover`, 用于捕获 `panic` 异常外, 还可以用于在 `return` 之后修改函数的返回值.

比如:

	func doubleSum(a, b int) (sum int) {
		defer func() {
			sum *= 2
		}()
		sum = a + b
	}

当然, 这个特性应该只是 `defer` 的副作用, 具体在什么场景使用就要由开发者自己决定了.

*4. 安全的回收资源*

前面第一点提到, `defer` 最常见的用法是简化资源的回收. 而且, 从资源回收角度看,
`defer` 只是一个语法糖.

其实, 也不完全是这样, 特别是在涉及到第二点提到的`panic`异常等因素导致`goroutine`提前退出时.

比如, 有一个线程安全的slice修改函数, 为了性能没有使用`defer`语句:

	func set(mu *sync.Mutex, arr []int, i, v int) {
		mu.Lock()
		arr[i] = v
		mu.Unlock()
	}

但是, 如果 `i >= len(arr)`的话, `runtime`就会抛出切片越界的异常(这里只是举例, 实际开发中不应该出现切片越界异常). 这样的话, `mu.Unlock()` 就没有机会被执行了.

如果用`defer`的话, 即使出现异常也能保证`mu.Unlock()`被调用:

	func set(mu *sync.Mutex, arr []int, i, v int) {
		mu.Lock()
		defer mu.Unlock()
		arr[i] = v
	}

当然, Go语言约定异常不会跨越`package`边界. 因此, 调用一般函数的时候不用担心`goroutine`异常退出的情况.

不过对于一些比较特殊的`package`, 比如`go test`依赖的`testing`包, 包中的`t.Fatal`就是依赖了Go中类似异常的特性(准确的说是调用了`runtime.Goexit()`).

比如有以下的测试函数(详情请参考[Issue5746](https://code.google.com/p/go/issues/detail?id=5746)):

	func TestFailed(t *testing.T) {
		var wg sync.WaitGroup
		for i := 0; i < 2; i++ {
			wg.Add(1)
			go func(id int) {
				// defer wg.Done()
				t.Fatalf("TestFailed: id = %v\n", id)
				wg.Done()
			}(i)
		}
		wg.Wait()
	}

当测试失败的时候, `wg.Done()`将没有机会执行, 最终导致`wg.Wait()`死锁.

对于这个例子, 安全的做法是使用`defer`语句保证`wg.Done()`始终会被执行.
