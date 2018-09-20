---
title: "Go语言并发编程02 - 你好，并发"
date: 2018-09-21
draft: true

tags: ["golang"]
categories: ["golang"]
---

根据2018年09月16日武汉·光谷猫友会，武汉的Gopher小伙伴分享的Go并发编程整理的内容。本次分享的主题内容包含Go语言并发哲学，并发的演化历史，你好并发，并发的内存模型，常见的并发模式等内容。关于并发编程的补充内容可以参考[《Go语言高级编程》](https://github.com/chai2010/advanced-go-programming-book)第一章的相关内容。

本次整理“你好，并发”部分的内容。

<!--more-->

## 并发很简单也很强大

Go语言通过`go`关键字可以将调用的函数直接在新的Goroutine上启动：

```go
// 普通版本
func main() {
    println("你好, 并发!")
}

// 并发版本
func main() {
    go println("你好, 并发!")
}
```

相比于传统的通过库的方式启动进程、线程等，`go`关键字丢弃了很多心智包袱，降低了并发入门等门槛。当一个新技术随手可得，随便一个按钮开关或一个指令就可以尝试使用等时候，用户总会在下意识中就掌握了改技术。

Go的并发不仅仅启动简单，而且功能确实很强大。首先是每个 Goroutine 栈很小，切换代价很低，很容易就可以实现海量并发。其次，每个 Goroutine 栈又可以动态扩展到很大，基本可以近似做到无限递归了。Go语言的并发从横向和纵向都可以无限扩展，用户在编写并发程序时不在需要时刻关心栈够不够用、并发数量是否太多等非核心逻辑等问题，极大地释放了并发编程等自由度：

我们看看如何编写一个海量并发，并且深度递归等程序：

```go
func main() {
    for i := 0; i < 10000*100; i++ {
        go printsum(i)
    }
}

func printsum(n int) {
    fmt.Println("sum(%[1]d): %[1]d\n", n)
}

func sum(n int) int {
    return sum(n-1) + n
}
```

上述代码中，printsum函数通过递归计算1到n的和，基本不用太考虑爆栈的问题。同时在main函数中，在for循环内部通过go关键字启动了海量的并发来打印sum的结果。


## 并发中的小问题

GO语言并发很简单其实是一个表象，是为了忽悠不懂并发的新手的口号。随便运行下程序就可以戳穿这个纸做的口号：

```go
package main

func main() {
    go println("你好, 并发!")
}
```

上面等程序需要有中彩票特大奖的运气才能有机会执行成功。大部分普通用户将无法看到输出信息！

针对这个代码，网上有很多不负责任的Go语言教程教你如何通过调用`time.Sleep`或`runtime.Gosched`假装解决这个问题：

```go
func main() {
    go println("你好, 并发!")
    time.Sleep(time.Second) // or runtime.Gosched()
}
```

每一个严肃的码农在看到这种解决方案的时候，首先需要弄明白time.Sleep为何只休眠了1秒钟？如果换一种极限的思维来问这个问题就是，休眠1万年、1微妙、1纳秒、0纳秒可以吗？

没有人能够回答为何刚好需要休眠1秒钟就看似能工作了，其实这只是他们常识测试的一个经验值。我们把这种尝试通过调整某些随机的经验值来写代码的方式叫 **“撞大运编程模式”**。

打败这个“撞大运编程模式”写的并发程序很简单，只需要一个或一次反例即可：

```go
func main() {
    go println("你好, 并发!")
    time.Sleep(time.Second)
}

func println(s string) {
    time.Sleep(time.Second*2)
    print(s+"\n")
}
```

上面的反例中，我们在不改变println函数输出的前提下，休眠了2秒钟（一定要大于前面的1秒钟）。另一种反面的证明是假设，输出的字符串足够大，输出的设备足够慢。因此println很可能需要1万年才能完成工作。因为main函数作为println的使用者，不能也无法要求println函数在几个时钟周期内完成任务（毕竟Go语言无法做到实时编程），因此当println函数执行的时间稍微出现波动时就将影响上述代码的正确性！


Go语言并发编程的学习一般要经过2个阶段：第一阶段是这个并发程序终于可以产生正确的输出了；第二个阶段是这个并发程序不会产生错误的输出！通过撞大运编程模式编写的代码一般至少处于第一个阶段。

每一个严禁的并发编程码农，我们的并发程序不仅仅要可以产生正确的输出，而且要保证不会产生错误的输出！


## 并发小问题分析

前面代码运行有一定的随机性, 无法保证并发程序的正确运行.

并发的几个原则:

go启动Goroutine时无法保证新线程马上运行
main退出时程序退出
解决的思路:

后台Goroutine完成之前main函数不能退出.

-------


地毯的比喻，小问题一般都是大问题

而大问题很可能是小问题


```go
package main

import "time"

func main() {
    go println("你好, 并发!")
    time.Sleep(time.Second)
}

func println(s string) {
    time.Sleep(time.Second*2)
    print(s+"\n")
}
```

## 其它内容待续

在线浏览幻灯片：

https://talks.godoc.org/github.com/chai2010/awesome-go-zh/chai2010/chai2010-golang-concurrency.slide

幻灯片源文件：

https://github.com/chai2010/awesome-go-zh/tree/master/chai2010

