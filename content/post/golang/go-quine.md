---
title: "Go语言的自重写程序"
date: 2013-03-29
draft: false

tags: ["golang"]
categories: [golang]
---

UNIX/Go语言之父 [Ken Thompson][1] 在1983年的图灵奖演讲 [Reflections on Trusting Trust][2] 就给出了一个C语言的自重写程序.

![](/images/go-quine.jpg)

最短的C语言自重写程序是 [Vlad Taeerov 和 Rashit Fakhreyev][4] 的版本:

	main(a){printf(a="main(a){printf(a=%c%s%c,34,a,34);}",34,a,34);}

下面的Go语言版本自重写程序是 [rsc][5] 提供的:

	/* Go quine */
	package main
	import "fmt"
	func main() {
		fmt.Printf("%s%c%s%c\n", q, 0x60, q, 0x60)
	}
	var q = `/* Go quine */
	package main
	import "fmt"
	func main() {
		fmt.Printf("%s%c%s%c\n", q, 0x60, q, 0x60)
	}
	var q = `

在 [golang-nuts][6] 中还有更短的版本([Aram Hăvărneanu][7]):

    package main;func main(){print(c+"\x60"+c+"\x60")};var c=`package main;func main(){print(c+"\x60"+c+"\x60")};var c=`

其实国内出版的<[Go语言.云动力][8]>的1.3节也给出了一个版本(和rsc的类似).

关于其他各种语言的自重写程序, 可以参考这个网站:

- [http://www.nyx.net/~gthompso/quine.htm][9]


  [1]: https://en.wikipedia.org/wiki/Ken_Thompson
  [2]: /docs/p761-thompson.pdf
  [4]: http://hackers-delight.org.ua/003.htm
  [5]: http://research.swtch.com/zip
  [6]: http://groups.google.com/group/golang-nuts
  [7]: http://grokbase.com/t/gg/golang-nuts/1299rdndjv/go-nuts-shortest-quine
  [8]: http://www.ituring.com.cn/book/1040
  [9]: http://www.nyx.net/~gthompso/quine.htm
