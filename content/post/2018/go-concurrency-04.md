---
title: "Go语言并发编程04 - 并发的常见模式"
date: 2018-09-30
draft: true

tags: ["golang", "并发"]
categories: ["golang"]
---

根据2018年09月16日武汉·光谷猫友会，武汉的Gopher小伙伴分享的Go并发编程整理的内容。本次分享的主题内容包含Go语言并发哲学，并发的演化历史，你好并发，并发的内存模型，常见的并发模式等内容。关于并发编程的补充内容可以参考[《Go语言高级编程》](https://github.com/chai2010/advanced-go-programming-book)第一章的相关内容。

本次整理并发的常见模式部分的内容。

<!--more-->

## 并发的模式

```go
func main() {
    go println("你好, 并发!") // 干活的

    go func() { <-make(chan int) } () // 滥竽充数的, Goroutine 泄露
    go func() { for{} } () // 浪费资源的, 但不是 Goroutine 泄露
    go func() {} () // 滥竽充数的, 但不是 Goroutine 泄露

    time.Sleep(time.Second)
    println("Done")
}
```

```go
    const N = 10
    done := make(chan bool, N)

    for i := 0; i < N; i++ {
        go func(i int) {
            println(i, "你好, 并发!")
            done <- true
        }(i)
    }

    for i := 0; i < N; i++ {
        <-done
    }
}
```

## 其它内容待续

在线浏览幻灯片：

https://talks.godoc.org/github.com/chai2010/awesome-go-zh/chai2010/chai2010-golang-concurrency.slide

幻灯片源文件：

https://github.com/chai2010/awesome-go-zh/tree/master/chai2010

