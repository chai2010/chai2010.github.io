---
title: "Go语言并发编程 - 并发的演化历史"
date: 2018-09-20
draft: false

tags: ["golang"]
categories: ["golang"]
---

根据2018年09月16日武汉·光谷猫友会，武汉的Gopher小伙伴分享的Go并发编程整理的内容。本次分享的主题内容包含Go语言并发哲学，并发的演化历史，你好并发，并发的内存模型，常见的并发模式等内容。关于并发编程的补充内容可以参考[《Go语言高级编程》](https://github.com/chai2010/advanced-go-programming-book)第一章的相关内容。

本次整理并发的演化历史部分的内容。

<!--more-->

## Go语言并发哲学

> Do not communicate by sharing memory, instead, share memory by communicating!

> 不要通过共享内存来通信, 而是通过通信来共享内存!

**不要逆行!**

## 并发的演化历史

Go语言最早从UNIX系统的B语言和C语言演化而来，其中的并发特性是从Newsqueak、Alef和Limbo等语言演化而来。其中Newsqueak是Go之父Rob Pike于989年设计的语言，Alef则是Phil Winterbottom于1993年对C语言扩展了并发特性的语言，Limbo也是Rob Pike参与设计的支持并发的语言。由此可见，Rob Pike在并发编程语言领域已经积累了几十年的设计经验，Go语言正是站在这些前辈的基础上涅槃重生的。

Go语言并发的理论基础是来自Hoare于1978年发表的CSP论文（Hoare就是发明快速排序的大牛）。更通俗的类比，CSP对应的编程模型和UNIX中的管道非常相似，而管道更是在1964年就已经发明了。因此，从理论上看，Go语言的并发并非什么新发明的特性，它只不过是将CSP代表的通过消息同步的编程模型带入了工业开发领域。

### Newsqueak素数筛 - Rob Pike, 1989

先看看素数筛的原理图：

![](https://raw.githubusercontent.com/chai2010/awesome-go-zh/master/chai2010/chai2010-golang-concurrency/prime-sieve.png)

然后是Newsqueak素数筛代码：

```
counter := prog(c:chan of int) {
	i:=2;
	for(;;)
		c <-= i++;
};

filter := prog(prime:int, listen, send:chan of int) {
	i:int;
	for(;;)
		if((i = <-listen)%prime)
			send <-= i;
};

sieve := prog() of chan of int {
	c := mk(chan of int);
	begin counter(c);
	prime := mk(chan of int);
	begin prog(){
		p:int;
		newc:chan of int;
		for(;;){
			prime <-= p =<- c;
			newc = mk();
			begin filter(p, c, newc);
			c = newc;
		}
	}();
	become prime;
};

prime:=sieve();
```

其中begin关键字启动一个并发，类似Go语言的go关键字。而become关键字表示返回值，类似return语句。因此说Newsqueak和Go语言的并发有很多相似之处。

### Alef - Phil Winterbottom, 1993

然后是Alef语言。据说这个语言是C语言之父Ritchie所钟爱的语言。不过Alef只是短暂地出现在Plan9系统中。目前传世的官方文档只有入门指南和参考手册。

下面的代码是Alef文档中摘取的片段：

```
#include <alef.h>

void receive(chan(byte*) c) {
    byte *s;
    s = <- c;
    print("%s\n", s);
    terminate(nil);
}

void main(void) {
    chan(byte*) c;
    alloc c;
    proc receive(c);
    task receive(c);
    c <- = "hello proc or task";
    c <- = "hello proc or task";
    print("done\n");
    terminate(nil);
}
```

可以将Alef看作是类似C++的语言，基础的语法完善和C语言保存一致，但是在并发编程方向做了扩展。其中proc是启动一个进程，task是启动一个线程。

因为C语言没有GC特性，因此Alef并发所创建或分享的资源管理将会是一个极大的调整。并发的语法虽然看着很美，但是进行真正的并发编程可能没有那么容易。

Alef产生的并发体可能异常复杂，下图是Alef文档中摘取的图片：

![](https://raw.githubusercontent.com/chai2010/awesome-go-zh/master/chai2010/chai2010-golang-concurrency/alef.png)

总共有6个线程分布在3个进程中，现场并发体相互之间通过管道进行通信。因为Alef同时支持进程和线程，可以说它其实是伪装成编程语言的操作系统!

## 其它内容待续

在线浏览幻灯片：

https://talks.godoc.org/github.com/chai2010/awesome-go-zh/chai2010/chai2010-golang-concurrency.slide

幻灯片源文件：

https://github.com/chai2010/awesome-go-zh/tree/master/chai2010

