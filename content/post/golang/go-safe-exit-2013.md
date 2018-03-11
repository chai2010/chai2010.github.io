---
title: "Go程序如何安全退出(CTRL+C)"
date: 2013-04-27
draft: false

tags: ["golang"]
categories: []
---

如果是命令行程序需要退出, `CTRL+C`是最直接的方法.

# C语言如何处理`CTRL+C`

`CTRL+C`会向命令行进程发送中断信号, 在C语言的`<signal.h>`中的`signal`函数可以注册信号的处理函数.

`signal`函数的签名如下:

	void (*signal(int sig, void (*func)(int)))(int);

比如, 我们要处理`CTRL+C`对应的`SIGINT`信号:

	#include <stdio.h>
	#include <stdlib.h>
	#include <signal.h>

	void sigHandle(int sig) {
		switch(sig) {
		case SIGINT:
			printf("sigHandle: %d, SIGINT\n", sig);
			break;
		default:
			printf("sigHandle: %d, OTHER\n", sig);
			break;
		}
		exit(1);
	}

	int main() {
		signal(SIGINT, sigHandle);
		for(;;) {}
		return 0;
	}

编译并运行程序后会进入死循环, 按`CTRL+C`强制退出会看到以下的输出:

	sigHandle: 2, SIGINT

当然, 直接从进程管理杀死程序就没办法收到信号的.

`<signal.h>`中除了`signal`函数, 还有一个`raise`函数用于生成信号:

	int raise(int sig);

我们在`sigHandle`截获信号之后如果想重新恢复信号, 可以使用`raise`函数. 但是, 要注意不要导致无穷递归`signal/raise`调用.

# Go语言如何处理`CTRL+C`

Go语言也有类似的函数`signal.Notify`(在`os/signal`包中), 可以过滤信号.

这是`signal.Notify`自带的例子:

	// Set up channel on which to send signal notifications.
	// We must use a buffered channel or risk missing the signal
	// if we're not ready to receive when the signal is sent.
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, os.Kill)

	// Block until a signal is received.
	s := <-c
	fmt.Println("Got signal:", s)

`signal.Notify`会将用户关注的信号转发到信道`c`, 信道`c`不能是阻塞的. 如果信道是缓冲不足的话, 可能会丢失信号. 如果我们不再次转发信号, 设置为1个缓冲大小就可以了.

`signal.Notify`从第二个参数起是可变参数的, 用于指定要过滤的信号.
如果不指定第二个参数, 则默认是过滤全部的信号.

信号的定义一般在`syscall`. `syscall`包是系统相关的,
不同的操作系统信号可能有差异. 不过`syscall.SIGINT`和`syscall.SIGKILL`各个系统是一致的, 分别对应`os.Interrupt`和`os.Kill`.

下面是Go语言版完整的例子:

	package main

	import (
		"fmt"
		"os"
		"os/signal"
	)

	func main() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, os.Kill)

		s := <-c
		fmt.Println("Got signal:", s)
	}

`go run signal.go`运行后会进入死循环, 按`CTRL+C`强制退出会看到以下的输出:

	Got signal: interrupt

当然, 直接从进程管理杀死程序就没办法收到信号的.

如果要恢复信号, 调用`s.Signal()`. 如果要停止信号的过滤, 调用`signal.Stop(c)`.
