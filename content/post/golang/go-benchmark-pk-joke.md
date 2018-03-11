---
title: "系统级编程语言性能大PK的笑话-Go语言"
date: 2013-08-06
draft: false

tags: ["golang"]
categories: [golang]
---

喜欢和不喜欢Go语言的都喜欢拿性能PK说事.

流传比较广的是benchmarksgame的PK数据: [http://benchmarksgame.alioth.debian.org/u64q/go.php](http://benchmarksgame.alioth.debian.org/u64q/go.php)

在 [benchmarksgame](http://benchmarksgame.alioth.debian.org/u64q/go.php)
测试中, Go语言的性能已经由之前的很烂到现在和C语言持平或2倍差距之内, 当然还有
3个测试性能差距比较大.

具体的原因我就不细说了, 可以参考我另一个文章: [Go1.1性能测试报告(和C差距在10%以内)](http://my.oschina.net/chai2010/blog/130859) .

当然, 很多Go语言黑是从来不相信Go语言的性能的, 特别是不相信**和C差距在10%以内**的说法.
不过在这个老外的最新测试结果中, Go的性能又超出了GCC的性能(GCC比clang有一些差距).

最近, 有另一个外国的博客评测了各种系统级编程语言的性能, 而翻译后标题给出了PK的字样.
内容摘要有2点: D语言很NB(clang的99%性能)和超烂的Go性能(clang的22%垫底).

这个性能测试结果几乎是每几天就一个惊喜, 具体数据请看:

**1. Go性能是clang的22% (2012.07.24)**

> 匿名读者 写道
"C/C++已经统治系统编程很久，除了ObjectiveC之外语言都无法获得很高的关注。有人用多种系统级语言编写了同样的地图生成工具来测试他们的性能，包括D(DMD,LDC,GDC)、Go(GCC-Go,6g)、Haskell(GHC)和Rust。相比C/C++，这些语言都原生支持了诸如垃圾回收这些高级特性，也因此无一能达到C/C++的运行速度。这其中表现最差的是原生Go语言编译器6g，只有Clang22%的速度，而表现最好的是基于LLVM的D语言编译器LDC，达到了79%。由于原生就使用了LLVM编译，Rust成为各语言原生编译器里最快的一个，但也只达到了45%。从结果来看，D语言一定是首选。由于D语言许多特性都依赖垃圾回收，如果需要关闭垃圾回收而又要保持良好的使用体验，则推荐Rust。"

Go语言光荣的以22%的成绩垫底!

链接: [系统级编程语言性能大PK](http://www.solidot.org/story?sid=35724)

**2. Go性能是clang的51% (2013.07.27)**

> 匿名读者写道 "上一篇发的时候，作者优化不够，现在在几天的修改以后结果完全不一样了。
C/C++已经统治系统编程很久，除了ObjectiveC之外语言都无法获得很高的关注。有人用多种系统级语言编写了同样的地图生成工具来测试他们的性能， 包括D(DMD,LDC,GDC)、Go(GCC-Go,6g)、Haskell(GHC)和Rust。相比C/C++，这些语言都原生支持了诸如垃圾回 收这些高级特性，也因此无一能达到C/C++的运行速度。其中表现最好的是基于LLVM的D语言编译器LDC，与同样基于LLVM的C编译器Clang相比，可以达到它96%的速度。其次是基于LLVM的Rust编译器，达到了89%。因为LLVM编译的优化做的太好，即使GCC都只能达到Clang 72%。另一个令人惊讶的结果是，基于JVM的Scala竟然能达到Clang70%的速度。几乎相当于GCC。 "

因为前一个新闻刚发不久, 就有回复说原网站数据已经更新. Go语言的性能大约是51%.

这个新闻是是之前的补充, 因为没垫底也不突出, 也就闭口不提Go语言的性能测试结果了.

国外原网站作者也采用更委婉的说法: Go语言让人感到惊喜! (不知道51%倒数性能有什么值得作者惊喜的).

链接: [系统级编程语言性能PK](http://www.solidot.org/story?sid=35754)

**3. 继续PK, Go语言性能是69%, GCC是72% (2013.07.30)**

**4. 继续PK, Go语言性能是75%, GCC是81% (2013.08.??)**

这个数据变化国内的网站没有都更新. 其中, 还有一些细微的变化过程.

还有一些网站的数据还停留在22%的时代, 比如一直在帮助码农保存密码的CSDN大网站:
[系统级编程语言性能大PK D语言成首选](http://www.csdn.net/article/2013-07-25/2816347-benchmarking-level-generation-go-rust-haskell-and-d).

**5. Go语言性能是87%, GCC是81%, 终极PK吗?(2013.08.06)**

	Compiler Speed(s) %Fastest
	Clang    0.280    100%
	LDC      0.281    99%
	FCC**    0.283    99%
	Rustc    0.303    92%
	6g       0.323    87%
	G++*     0.330    85%
	Scala    0.344    81%
	GCC      0.347    81%
	LLVM-GHC 0.428    65%
	GHC      0.546    51%
	DMD      0.567    49%
	GCCGO    0.598    47%

国外的原网站: [Benchmarking level generation: Go, Rust, Haskell and D (and now Scala)](http://togototo.wordpress.com/2013/07/23/benchmarking-level-generation-go-rust-haskell-and-d/)

**结尾**

其实, 我很想将这个PK中各个语言的性能变化曲线画出来, 特别是Go语言怎么从22%倒数第一
到87%中等偏上的走势. 我相信其他语言也有类似的变化过程, 但是不会像Go语言变化的这么
有喜感.

我想导致Go语言巨大变化的原因之一是: 在对Go语言不熟悉的前提下编写的Go测试代码超烂,
不完全相同的测试环境. 具体表现有以下几点:

 - 6g默认的int是int64和C默认的int32比较性能
 - Go语言系统包的随机数生成函数针对并发场景, 和C语言的随机数设计目标不同, 算法也不同
 - C语言代码全是在栈上分配空间, Go语言代码不该make的地方很多
 - Go语言代码中很多别扭的写法(早期版本)
 - D语言测试中直接关闭了下标越界检测(`-noboundscheck`), Go语言是开启的
 - 当然, 这些都是Go粉的理由...

最后我总结的经验是: 不要把各种PK的结果当真, 要关注它的变化过程, 这个更有意思!
