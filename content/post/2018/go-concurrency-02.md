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


## 并发小问题的解决思路

前面代码运行有一定的随机性，无法保证并发程序的正确运行。导致可能产生错误结果的原因有2个：第一个是go启动Goroutine时无法保证新线程马上运行（它的启动是并发的）；第二个是main函数代表的主Goroutine退出将直接退出进程。

在了解了原因之后，并发小问题的解决思路也就清晰了：在后台Goroutine完成任务之前，main函数代表的主Goroutine不能退出！

阻止main函数退出的方式有很多：

```go
func main() {
    go println("你好, 并发!")

    for {}
    select {}
    <-make(chan bool)
}
```

在这个代码中，for、select或管道，任何一个方式都可以阻止在完成任务前退出（其实main函数根本无法退出），因此这个程序好像是可以完成输出任务的（虽然解决方案不太完美）！

在上述的方案中，for循环阻止main退出是比较特色的一个方案。for其实执行的是一个死循环、忙等待，它会消耗大量的CPU资源。特别是，当只有一个系统线程资源时，main 将独占活跃的 系统线程，其它线程将有被饿死风险！

因此for循环的方案在单核系统中依然是有问题的：

```go
func main() {
    runtime.GOMAXPROCS(1)
    go println("你好, 并发!")
    for {}
}
```

通过`runtime.GOMAXPROCS(1)`将系统线程限制为一个。然后println函数还没有启动前如果进入了for循环的话，后台的println函数将没有机会再次被执行（被饿死）！

其实每个已经获取CPU资源的Goroutine都可以霸占CPU：

```go
func main() {
    runtime.GOMAXPROCS(1)
    go func() { for {} }()
    time.Sleep(time.Second)

    fmt.Println("the answer to life:", 42)
}
```

在这个例子中，Goroutine霸占了CPU，main函数可能被饿死在`time.Sleep`行代码，因此宇宙的秘密也就永远无法揭晓！

既然for循环霸占CPU，那我们换个不占用CPU的方式好了。select和管道都可以：

```go
func main() {
    runtime.GOMAXPROCS(1)
    go println("你好, 并发!")
    select {}
}
```

目前的代码确实更改进了一步，单核心也可以保证输出结果了！不过这个暴力的解决方法依然有点问题，这个程序退出前出现了异常：

```
你好, 并发!
fatal error: all goroutines are asleep - deadlock!

goroutine 1 [select (no cases)]:
main.main()
        /path/to/main.go:8 +0x5c
exit status 2
```

我首先要强调的是，这个异常其实不是问题。我们的首要目标是输出字符串，而且这个目标我们已经顺利完成了。出现异常的原因只是程序退出的善后工作处理不太完美（和C语言程序退出前并不需要释放全部的内存资源类似）。

异常的提示是，系统中没有其它可运行的goroutine，这就是一种死锁状态。其实如果换会for死循环的话是不会提示死锁的（因为runtime会将for循环当作一个正常执行的goroutine看待）。

理解的解决方案是：main函数在println完成输出任务前不退出，但是在println完成任务后可以正确退出。改进代码如下：

```go
func main() {
    done := make(chan bool)
    go func() {
        println("你好, 并发!")
        done <- true
    }()

    <-done
}
```

main函数在退出前需要从done管道取一个消息，后台任务在将消息放入done管道前必须先完成自己的输出任务。因此，main函数成功取到消息时，后台的输出任务确定已经完成了，main函数也就可以放心退出了。

## 其它内容待续

猫友会：Go语言并发编程01 - 并发的演化历史

https://mp.weixin.qq.com/s/UaY9gJU85dq-dXlOhLYY1Q

在线浏览幻灯片：

https://talks.godoc.org/github.com/chai2010/awesome-go-zh/chai2010/chai2010-golang-concurrency.slide

幻灯片源文件：

https://github.com/chai2010/awesome-go-zh/tree/master/chai2010

