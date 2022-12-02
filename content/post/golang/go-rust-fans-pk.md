---
title: "驳狗屎文 '我为什么放弃Go语言'"
date: 2015-06-30
draft: false

tags: [golang, rust]
categories: ["golang"]
---

# 驳狗屎文 "我为什么放弃Go语言"

此篇文章流传甚广, 其实里面没啥干货， 而且里面很多观点是有问题的. 这个文章在 [golang-china](https://groups.google.com/d/msg/golang-china/v8c_xjjM-Pg/XSa3RjJbNCUJ) 很早就讨论过了.
最近因为 Rust 1.0 和 1.1 的发布, 导致这个文章又出来毒害读者.
所以写了这篇反驳文章, 指出其中的问题.


原文链接：[http://blog.csdn.net/liigo/article/details/23699459](http://blog.csdn.net/liigo/article/details/23699459)


> 有好几次，当我想起来的时候，总是会问自己：我为什么要放弃Go语言？这个决定是正确的吗？是明智和理性的吗？其实我一直在认真思考这个问题。

> 开门见山地说，我当初放弃Go语言（golang），就是因为两个“不爽”：第一，对Go语言本身不爽；第二，对Go语言社区里的某些人不爽。毫无疑问，这是非常主观的结论。但是我有足够详实的客观的论据，用以支撑这个看似主观的结论。

> 文末附有本文更新日志。

确实是非常主观的结论, 因为里面有不少有问题的观点(用来忽悠Go小白还行).


## 第0节：我的Go语言经历

> 先说说我的经历吧，以避免被无缘无故地当作Go语言的低级黑。

> 2009年底，Go语言（golang）第一个公开版本发布，笼罩着“Google公司制造”的光环，吸引了许多慕名而来的尝鲜者，我（Liigo）也身居其中，笼统的看了一些Go语言的资料，学习了基础的教程，因对其语法中的分号和花括号不满，很快就遗忘掉了，没拿它当一回事。

在2009年Go刚发布时, 确实是因为“Google公司制造”的光环而吸引了(包括文章作者和诸多IT记者)很多低级的尝鲜者.
还好, 经过5年的发展, 这些纯粹因为光环来的投机者所剩已经不多了([Google趋势](https://www.google.com/trends/explore#q=golang)).
目前, 真正的Go用户早就将Go用于实际的生产了.

说到 **其语法中的分号和花括号不满**, 我想说这只是你的 **个人主观感受**, 还有很多人对Go的分号和花括号很满意,
包括水果公司的的 Swift 的语言设计者也很满意这种风格(Swift中的分号和花括号和Go基本相同).

如果只谈 **个人主观感受**, 我也可以说 Rust 的 `fn` 缩写也很蛋疼!


> 两年之后，2011年底，Go语言发布1.0的计划被提上日程，相关的报道又多起来，我再次关注它，[重新评估][1]之后决定深入参与Go语言。我订阅了其users、nuts、dev、commits等官方邮件组，坚持每天阅读其中的电子邮件，以及开发者提交的每一次源代码更新，给Go提交了许多改进意见，甚至包括[修改Go语言编译器源代码][2]直接参与开发任务。如此持续了数月时间。

这个到是事实, 在 [golang-china](https://groups.google.com/d/forum/golang-china) 有不少吵架的帖子, 感兴趣的可以去挖下, 我就不展开说了.

> 到2012年初，Go 1.0发布，语言和标准库都已经基本定型，不可能再有大幅改进，我对Go语言未能在1.0定型之前更上一个台阶、实现自我突破，甚至带着诸多明显缺陷走向1.0，感到非常失望，因而逐渐疏远了它（所以Go 1.0之后的事情我很少关心）。后来看到即将发布的Go 1.1的Release Note，发现语言层面没有太大改变，只是在库和工具层面有所修补和改进，感到它尚在幼年就失去成长的动力，越发失望。外加Go语言社区里的某些人，其中也包括Google公司负责开发Go语言的某些人，其态度、言行，让我极度厌恶，促使我决绝地离弃Go语言。


真的不清楚楼主说的可以在 Go1.0 之前短时间内能实现的 **重大改进和诸多明显缺陷** 是什么.

如果是楼主说前面的 **其语法中的分号和花括号不满** 之类的重大改进, 我只能说这只是你的 **个人主观感受** 而已,
你的很多想法只能说服你自己, 没办法说服其他绝大部分人(不要以为像C++或Rust那样什么特性都有就NB了, 各种NB特性加到一起只能是 **要你命3000**, 而绝对不会是什么 **银弹**).


**Go 1.1的Release Note，发现语言层面没有太大改变**. 语言层没有改变是是因为 [Go1](http://golang.org/doc/go1compat) 作出的向后兼容的承诺. 对于工业级的语言来说,  [Go1](http://golang.org/doc/go1compat) 这个只能是优点. 如果连语言层在每个版本都会出现诸多大幅改进, 那谁还敢用Go语言来做生产开发呢(我承认Rust的改动很大胆, 但也说明了Rust还处于比较幼稚和任性的阶段)?

说 **Go语言社区里的某些人固执** 的观点我是同意的. 但是这些 **固执** 的人是可以讲道理的, 但是他们对很多东西的要求很高(特别是关于Go的设计哲学部分).
只要你给的建议有依据(语言的设计哲学是另外一回事情), 他们绝对不会盲目的拒绝(只是讨论的周期会比较长).

关于楼主提交的[给Go文件添加BOM的文章](http://blog.csdn.net/liigo/article/details/7467309), 需要补充说明下.

在Go1.0发布的时候, Go语言的源文件(`.go`)明确要求必须是UTF8编码的, 而且是无BOM的UTF8编码的(G公司的Protobuf也不支持带BOM的UTF8编码).

**注意:** 这个 **无BOM的UTF8编码** 的限制仅仅是 针对  Go语言的源文件(`.go`).

这个限制并不是说不允许用户处理带BOM的UTF8的txt文件!

我觉得对于写Go程序来说, 这个限制是没有任何问题的, 到目前为止, 我还从来没有使用过带BOM的`.go`文件.

不仅是因为带BOM的`.go`文件没有太多的意义, 而且有很多的缺陷.

BOM的原意是用来表示编码是大端还是小端的, 主要用于UTF16和UTF32. 对于 UTF8 来说, BOM 没有任何存在的意义(正是Go的2个作者发明了UTF8, 彻底解决了全球的编码问题).

但是, 在现实中, 因为MS的txt记事本, 对于中文环境会将txt(甚至是C/C++源文件)当作GBK编码(GBK是个烂编码),
为了区别到底是GBK还是UTF8, MS的记事本在前面加了BOM这个垃圾(被GBK占了茅坑), 这里的bom已经不是表示字节序本意了. 不知道有没有人用ms的记事本写网页, 然后生成一个带bom的utf8网页肯定很有意思.
**这是MS的记事本的BUG: 它不支持生成无BOM的UTF8编码的文本文件!**

这些是现实存在的带BOM的UTF8编码的文本文件, 但是它们肯定都不是Go语言源文件!

所以说, Go语言的源文件即使强制限制了无BOM的UTF8编码要求, 也是没有任何问题的(而且我还希望有这个限制).

虽然后来Go源文件接受带BOM的UTF8了, 但是运行 `go fmt` 之后, 还是会删除掉BOM的(因为BOM就是然并卵). 也就是说 带 BOM 的 Go 源文件是不符合 Go语言的编码风格的, `go fmt` 会强制删除 BOM 头.

前面说了BOM是MS带来的垃圾, 但是BOM的UTF8除了然并卵之外还有很多问题, 因为BOM在string的开头嵌入了垃圾,
导致正则表达式, string的链接运算等操作都被会被BOM这个垃圾所污染. 对于`.go`语言, 即使代码完全一样, 有BOM和无BOM会导致文件的MD5之类的校验码不同.

所以, 我觉得Go用户不用纠结BOM这个无关紧要的东西(语言源文件不是文本编辑器, 没必要支持各种文件格式).

> 在上一个10年，我（Liigo）在我所属的公司里，深度参与了两个编程语言项目的开发。我想，对于如何判断某个编程语言的优劣，或者说至少对于如何判断某个编程语言是否适合于我自己，我应该还是有一点发言权的。

> [1]: https://plus.google.com/+LiigoZhuang/posts/CpRNPeDXUDW

> [2]: http://blog.csdn.net/liigo/article/details/7467309

## 第1节：我为什么对Go语言不爽？

> Go语言有很多让我不爽之处，这里列出我现在还能记起的其中一部分，排名基本上不分先后。读者们耐心地看完之后，还能淡定地说一句“我不在乎”吗？

### 1.1 不允许左花括号另起一行

> 关于对花括号的摆放，在C语言、C++、Java、C#等社区中，十余年来存在持续争议，从未形成一致意见。在我看来，这本来就是主观倾向很重的抉择，不违反原则不涉及是非的情况下，不应该搞一刀切，让程序员或团队自己选择就足够了。编程语言本身强行限制，把自己的喜好强加给别人，得不偿失。无论倾向于其中任意一种，必然得罪与其对立的一群人。虽然我现在已经习惯了把左花括号放在行尾，但一想到被禁止其他选择，就感到十分不爽。Go语言这这个问题上，没有做到“团结一切可以团结的力量”不说，还有意给自己树敌，太失败了。

我觉得Go最伟大的发明是 `go fmt`, 从此Go用户不会再有花括弧的位置这种无聊争论了(当然也少了不少灌水和上tiobe排名的机会).

是这优点, Swift 语言也使用和 Go 类似的风格(当然楼主也可能鄙视swift的作者).

### 1.2 编译器莫名其妙地给行尾加上分号

> 对Go语言本身而言，行尾的分号是可以省略的。但是在其编译器（gc）的实现中，为了方便编译器开发者，却在词法分析阶段强行添加了行尾的分号，反过来又影响到语言规范，对“怎样添加分号”做出特殊规定。这种变态做法前无古人。在左花括号被意外放到下一行行首的情况下，它自动在上一行行尾添加的分号，会导致莫名其妙的编译错误（Go 1.0之前），连它自己都解释不明白。如果实在处理不好分号，干脆不要省略分号得了；或者，Scala和JavaScript的编译器是开源的，跟它们学学怎么处理省略行尾分号可以吗？

又是楼主的 **个人主观感受**, 不过我很喜欢这个特性. Swift 语言也是类似.

### 1.3 极度强调编译速度，不惜放弃本应提供的功能

> 程序员是人不是神，编码过程中免不了因为大意或疏忽犯一些错。其中有一些，是大家集体性的很容易就中招的错误（Go语言里的例子我暂时想不起来，C++里的例子有“基类析构函数不是虚函数”）。这时候编译器应该站出来，多做一些检查、约束、核对性工作，尽量阻止常规错误的发生，尽量不让有潜在错误的代码编译通过，必要时给出一些警告或提示，让程序员留意。编译器不就是机器么，不就是应该多做脏活累活杂活、减少人的心智负担么？编译器多做一项检查，可能会避免数十万程序员今后多年内无数次犯同样的错误，节省的时间不计其数，这是功德无量的好事。但是Go编译器的作者们可不这么想，他们不愿意自己多花几个小时给编译器增加新功能，觉得那是亏本，反而减慢了编译速度。他们以影响编译速度为由，拒绝了很多对编译器改进的要求。典型的因噎废食。强调编译速度固然值得赞赏，但如果因此放弃应有的功能，我不赞成。

编译速度是很重要的, 如果编译速度够慢, 语言再好也不会有人使用的.
比如C/C++的增量编译/预编译头文件/并发编译都是为了提高编译速度.
Rust1.1 也号称 比 1.0 的编译时间减少了32% (注意: 不是运行速度).

当然, Go刚面世的时候, 编译速度是其中的一个设计目标.

不过我想楼主, 可能想说的是因为编译器自己添加分号而导致的编译错误的问题.
我觉得Go中 `{` 不能另起一行是语言特性, 如果修复这个就是引入了新的错误.

其他的我真想不起来还有哪些 **调编译速度，不惜放弃本应提供的功能** (不要提泛型, 那是因为还没有好的设计).

### 1.4 错误处理机制太原始

> 在Go语言中处理错误的基本模式是：函数通常返回多个值，其中最后一个值是error类型，用于表示错误类型极其描述；调用者每次调用完一个函数，都需要检查这个error并进行相应的错误处理：if err != nil { /*这种代码写多了不想吐么*/ }。此模式跟C语言那种很原始的错误处理相比如出一辙，并无实质性改进。实际应用中很容易形成多层嵌套的if else语句，可以想一想这个编码场景：先判断文件是否存在，如果存在则打开文件，如果打开成功则读取文件，如果读取成功再写入一段数据，最后关闭文件，别忘了还要处理每一步骤中出现错误的情况，这代码写出来得有多变态、多丑陋？实践中普遍的做法是，判断操作出错后提前return，以避免多层花括号嵌套，但这么做的后果是，许多错误处理代码被放在前面突出的位置，常规的处理逻辑反而被掩埋到后面去了，代码可读性极差。而且，error对象的标准接口只能返回一个错误文本，有时候调用者为了区分不同的错误类型，甚至需要解析该文本。除此之外，你只能手工强制转换error类型到特定子类型（静态类型的优势没了）。至于panic - recover机制，致命的缺陷是不能跨越库的边界使用，注定是一个半成品，最多只能在自己的pkg里面玩一玩。Java的异常处理虽然也有自身的问题（比如Checked Exceptions），但总体上还是比Go的错误处理高明很多。

话说, 软件开发都发展了半个世纪, 还是无实质性改进. 不要以为弄一个异常的语法糖就是革命了.

我只能说错误和异常是2个不同的东西, 将所有错误当作异常那是SB行为.

正因为有异常这个所谓的银弹, 导致很多等着别人帮忙擦屁股的行为(注意 `shit` 函数抛出的绝对不会是一种类型的 `shit`, 而被其间接调用的各种 `xxx_shit` 也可能抛出各种类型的异常, 这就导致 `catch` 失控了):

```
int main() {
	try {
		shit();
	} catch( /* 到底有几千种 shit ? */) {
		...
	}
}
```

Go的建议是 panic - recover 不跨越边界, 也就是要求正常的错误要由pkg的处理掉.
这是负责任的行为.

再说Go是面向并发的编程语言, 在海量的 goroutine 中使用 `try/catch` 是不是有一种不伦不类的感觉呢?

### 1.5 垃圾回收器（GC）不完善、有重大缺陷

> 在Go 1.0前夕，其垃圾回收器在32位环境下有内存泄漏，一直拖着不肯改进，这且不说。Go语言垃圾回收器真正致命的缺陷是，会导致整个进程不可预知的间歇性停顿。像某些大型后台服务程序，如游戏服务器、APP容器等，由于占用内存巨大，其内存对象数量极多，GC完成一次回收周期，可能需要数秒甚至更长时间，这段时间内，整个服务进程是阻塞的、停顿的，在外界看来就是服务中断、无响应，再牛逼的并发机制到了这里统统失效。垃圾回收器定期启动，每次启动就导致短暂的服务中断，这样下去，还有人敢用吗？这可是后台服务器进程，是Go语言的重点应用领域。以上现象可不是我假设出来的，而是事实存在的现实问题，受其严重困扰的也不是一家两家了（2013年底ECUG Con 2013，京东的刘奇提到了Go语言的GC、defer、标准库实现是性能杀手，最大的痛苦是GC；美团的沈锋也提到Go语言的GC导致后台服务间隔性停顿是最大的问题。更早的网络游戏仙侠道开发团队也曾受Go垃圾回收的沉重打击）。在实践中，你必须努力减少进程中的对象数量，以便把GC导致的间歇性停顿控制在可接受范围内。除此之外你别无选择（难道你还想自己更换GC算法、甚至砍掉GC？那还是Go语言吗？）。跳出圈外，我近期一直在思考，一定需要垃圾回收器吗？没有垃圾回收器就一定是历史的倒退吗？（可能会新写一篇博客文章专题探讨。）

这是说的是32位系统, 这绝对不是Go语言的重点应用领域!! 我可以说Go出生就是面向64位系统和多核心CPU环境设计的. (再说 Rust 目前好像还不支持 XP 吧, 这可不可以算是影响巨大?)

32位当时是有问题, 但是对实际生产影响并不大(请问楼主还是在用32位系统吗, 还只安装4GB的内存吗). 如果是8位单片机环境, 建议就不要用Go语言了, 直接C语言好了.

而且这个问题早就不存在了(大家可以去看Go的发布日志).

Go的出生也就5年时间, GC的完善和改进是一个持续的工作, 2015年8月将发布的 [Go1.5将采用并行GC](http://dotgo.sourcegraph.com/post/99652962343/brad-fitzpatrick-on-the-future-of-the-go), 每次 ["stop the world" 时间低于 10 毫秒](http://tip.golang.org/doc/go1.5#gc), 具体请参考 [GopherCon2015: Go GC: Solving the Latency Problem in Go 1.5](https://sourcegraph.com/blog/live/gophercon2015/123574706480).

关于GC的被人诟病的地方是会导致卡顿, 但是我以为这个主要是因为GC的实现还不够完美而导致的.
如果是完美的并发和增量的GC, 那应该不会出现大的卡顿问题的.

当然, 如果非要实时性, 那用C好了(实时并不表示性能高, 只是响应时间可控).

对于Rust之类没有GC的语言来说, 想很方便的开发并发的后台程序那几乎是不可能的.

不要总是吹Rust能代替底层/中层/上层的开发, 我们要看有谁用Rust真的做了什么.

### 1.6 禁止未使用变量和多余import

> Go编译器不允许存在被未被使用的变量和多余的import，如果存在，必然导致编译错误。但是现实情况是，在代码编写、重构、调试过程中，例如，临时性的注释掉一行代码，很容易就会导致同时出现未使用的变量和多余的import，直接编译错误了，你必须相应的把变量定义注释掉，再翻页回到文件首部把多余的import也注释掉，……等事情办完了，想把刚才注释的代码找回来，又要好几个麻烦的步骤。还有一个让人蛋疼的问题，编写数据库相关的代码时，如果你import某数据库驱动的pkg，它编译给你报错，说不需要import这个未被使用的pkg；但如果你听信编译器的话删掉该import，编译是通过了，运行时必然报错，说找不到数据库驱动；你看看程序员被折腾的两边不是人，最后不得不请出大神：`import _`。对待这种问题，一个比较好的解决方案是，视其为编译警告而非编译错误。但是Go语言开发者很固执，不容许这种折中方案。

这个问题我只能说楼主的吐槽真的是没水平.

为何不使用的是错误而不是警告? 这是为了将低级的bug消灭在编译阶段(大家可以想下C/C++的那么多警告有什么卵用).

而且, `import` 即使没有使用的话, 也是用副作用的, 因为 `import` 会导致 `init` 和全局变量的初始化.
如果某些代码没有使用, 为何要执行 `init` 这些初始化呢?

如果是因为调试而添加的变量, 那么调试完删除不是很正常的要求吗?

如果是因为调试而要导入`fmt`或`log`之类的包, 删除调试代码后又导致 `import` 错误的花,
楼主难道不知道在一个独立的文件包装下类似的辅助调试的函数吗?

```
import (
	"fmt"
	"log"
)

func logf(format string, a ...interface{}) {
	file, line := callerFileLine()
	fmt.Fprintf(os.Stderr, "%s:%d: ", file, line)
	fmt.Fprintf(os.Stderr, format, a...)
}

func fatalf(format string, a ...interface{}) {
	file, line := callerFileLine()
	fmt.Fprintf(os.Stderr, "%s:%d: ", file, line)
	fmt.Fprintf(os.Stderr, format, a...)
	os.Exit(1)
}
```

`import _` 是有明确行为的用法, 就是为了执行包中的 `init` 等函数(可以做某些注册操作).

将警告当作错误是Go的一个哲学, 当然在楼主看来这是白痴做法.

### 1.7 创建对象的方式太多令人纠结

> 创建对象的方式，调用new函数、调用make函数、调用New方法、使用花括号语法直接初始化结构体，你选哪一种？不好选择，因为没有一个固定的模式。从实践中看，如果要创建一个语言内置类型（如channel、map）的对象，通常用make函数创建；如果要创建标准库或第三方库定义的类型的对象，首先要去文档里找一下有没有New方法，如果有就最好调用New方法创建对象，如果没有New方法，则退而求其次，用初始化结构体的方式创建其对象。这个过程颇为周折，不像C++、Java、C#那样直接new就行了。

C++的`new`是狗屎. `new`导致的问题是构造函数和普通函数的行为不一致, 这个补丁特性真的没啥优越的.

我还是喜欢C语言的 `fopen` 和 `malloc` 之类构造函数, 构造函数就是普通函数, Go语言中也是这样.

C++中, 除了构造不兼容普通函数, 析构函数也是不兼容普通函数. 这个而引入的坑有很多吧.

### 1.8 对象没有构造函数和析构函数

> 没有构造函数还好说，毕竟还有自定义的New方法，大致也算是构造函数了。没有析构函数就比较难受了，没法实现RAII。额外的人工处理资源清理工作，无疑加重了程序员的心智负担。没人性啊，还嫌我们程序员加班还少吗？C++里有析构函数，Java里虽然没有析构函数但是有人家finally语句啊，Go呢，什么都没有。没错，你有个defer，可是那个defer问题更大，详见下文吧。

`defer` 可以覆盖析构函数的行为, 当然 `defer` 还有其他的任务. Swift2.0 也引入了一个简化版的 `defer` 特性.

### 1.9 defer语句的语义设定不甚合理

> Go语言设计defer语句的出发点是好的，把释放资源的“代码”放在靠近创建资源的地方，但把释放资源的“动作”推迟（defer）到函数返回前执行。遗憾的是其执行时机的设置似乎有些不甚合理。设想有一个需要长期运行的函数，其中有无限循环语句，在循环体内不断的创建资源（或分配内存），并用defer语句确保释放。由于函数一直运行没有返回，所有defer语句都得不到执行，循环过程中创建的大量短暂性资源一直积累着，得不到回收。而且，系统为了存储defer列表还要额外占用资源，也是持续增加的。这样下去，过不了多久，整个系统就要因为资源耗尽而崩溃。像这类长期运行的函数，http.ListenAndServe()就是典型的例子。在Go语言重点应用领域，可以说几乎每一个后台服务程序都必然有这么一类函数，往往还都是程序的核心部分。如果程序员不小心在这些函数中使用了defer语句，可以说后患无穷。如果语言设计者把defer的语义设定为在所属代码块结束时（而非函数返回时）执行，是不是更好一点呢？可是Go 1.0早已发布定型，为了保持向后兼容性，已经不可能改变了。小心使用defer语句！一不小心就中招。

前面说到 `defer` 还有其他的任务, 也就是 `defer` 中执行的 `recover` 可以捕获 `panic` 抛出的异常.
还有 `defer` 可以在 `return` 之后修改命名的返回值.

上面2个工作要求 `defer` 只能在函数退出时来执行.

楼主说的 `defer` 是类似 Swift2.0 中 `defer` 的行为, 但是 Swift2.0 中 `defer` 是没有前面2个特性的.

Go中的`defer`是以函数作用域作为触发的条件的, 是会导致楼主说的在 `for` 中执行的错误用法(哪个语言没有坑呢?).

不过 `for` 中 局部 `defer` 也是有办法的 (Go中的`defer`是以函数作用域):

```
for {
	func(){
		f, err := os.Open(...)
		defer f.Close()
	}()
}
```

在 `for` 中做一个闭包函数就可以了. 自己不会用不要怪别人没告诉你.

Swift 的块级 `defer` 也不方便实现以下的场景:

```
func (t *T) Serve() {
    if debug {
        log.Println(t, "starting")
        defer log.Println(t, "exiting")
    }
    // stuff
}
```

Nigel Tao 给的 [解释](https://groups.google.com/d/msg/golang-nuts/uSKodjFJDf4/wsZhh1Lk7swJ):

```
The longer answer is that while there's benefit of a scope-scoped
defer, there's also benefit in a function-scoped defer. This code:

func foo(filename string) error {
  var r io.Reader
  if filename != "" {
    f, err := os.Open(filename)
    if err != nil {
      return err
    }
    defer f.Close()
    r = f
  } else {
    r = strings.NewReader(fakeInput)
  }
  // More code that reads from r.
  etc
}
```

### 1.10 许多语言内置设施不支持用户定义的类型

> for in、make、range、channel、map等都仅支持语言内置类型，不支持用户定义的类型(?)。用户定义的类型没法支持for in循环，用户不能编写像make、range那样“参数类型和个数”甚至“返回值类型和个数”都可变的函数，不能编写像channel、map那样类似泛型的数据类型。语言内置的那些东西，处处充斥着斧凿的痕迹。这体现了语言设计的局限性、封闭性、不完善，可扩展性差，像是新手作品——且不论其设计者和实现者如何权威。延伸阅读：Go语言是30年前的陈旧设计思想，用户定义的东西几乎都是二等公民（Tikhon Jelvis）。

说到底, 这个是因为对泛型支持的不完备导致的.

Go语言是没啥NB的特性, 但是Go的特性和工具组合在一起就是好用.

这就是Go语言NB的地方.

### 1.11 没有泛型支持，常见数据类型接口丑陋

> 没有泛型的话，List、Set、Tree这些常见的基础性数据类型的接口就只能很丑陋：放进去的对象是一个具体的类型，取出来之后成了无类型的interface{}（可以视为所有类型的基础类型），还得强制类型转换之后才能继续使用，令人无语。Go语言缺少min、max这类函数，求数值绝对值的函数abs只接收/返回双精度小数类型，排序接口只能借助sort.Interface无奈的回避了被比较对象的类型，等等等等，都是没有泛型导致的结果。没有泛型，接口很难优雅起来。Go开发者没有明确拒绝泛型，只是说还没有找到很好的方法实现泛型（能不能学学已经开源的语言呀）。现实是，Go 1.0已经定型，泛型还没有，那些丑陋的接口为了保持向后兼容必须长期存在着。

Go有自己的哲学, 如果能有和目前哲学不冲突的泛型实现, 他们是不会反对的.

如果只是简单学学(或者叫抄袭)已经开源的语言的语法, 那是C++的设计风格(或者说C++从来都是这样设计的, 有什么特性就抄什么), 导致了各种脑裂的编程风格.

编译时泛型和运行时泛型可能是无法完全兼容的, 看这个例子:

```
type Adder<T> interface {
	Add(a, b T) T
}
```

请问 `Adder<int>` 和 `Adder<float>` 是一个接口吗?

```
type Adder interface {
	Add(a, b interface{}) interface{}
}
```

对于这种场景, `interface{}` 虽然性能不是最好, 但是接口却是一致的:

而且, 目前已经有 `go generate` 可以弥补范型和宏部分的不足.

[golang-china](https://groups.google.com/d/msg/golang-china/v8c_xjjM-Pg/XSa3RjJbNCUJ) 关于该文的讨论中有涉及到泛型的讨论.

感觉Go即使真有泛型, 也得等到Go2.0了(猜测Go2.0能在2020年诞生10周年发布).

### 1.12 实现接口不需要明确声明

> 这一条通常是被当作Go语言的优点来宣传的。但是也有人不赞同，比如我。如果一个类型用Go语言的方式默默的实现了某个接口，使用者和代码维护者都很难发现这一点（除非仔细核对该类型的每一个方法的函数签名，并跟所有可能的接口定义相互对照），自然也想不到与该接口有关的应用，显得十分隐晦，不直观。支持者可能会辩解说，我可以在文档中注明它实现了哪些接口。问题是，写在文档中，还不如直接写到类型定义上呢，至少还能得到编译器的静态类型检查。缺少了编译器的支持，当接口类型的函数签名被改变时，当实现该接口的类型方法被无意中改变时，实现者可能很难意识到，该类型实现该接口的隐含约束事实上已经被打破了。又有人辩解说，我可以通过单元测试确保类型正确实现了接口呀。我想说的是，明明可以通过明确声明实现接口，享受编译器提供的类型检查，你却要自己找麻烦，去写原本多余的单元测试，找虐很爽吗？Go语言的这种做法，除了减少一些对接口所在库的依赖之外，没有其他好处，得不偿失。延伸阅读：为什么我不喜欢Go语言式的接口（老赵）。

Go是面向组合的, 和UNIX的哲学类似. 使用Go你要知道 `io` 放的是什么, `fmt` 包放的是什么, 习惯之后会很方便.

你不能说UNIX的命令行工具`sort`没有实现强的接口依赖检测会有很多问题.
如果你非要乱用`sort`的捣蛋话当然有很多问题.

但是Go和`sort`之类的工具是给想组合和合作的人使用的.

不要提 老赵 那个文章了, 我发了反驳文章后他已经闭嘴了: [http://my.oschina.net/chai2010/blog/122400](http://my.oschina.net/chai2010/blog/122400)

对于IDE环境, Go的工具 `go oracle`可以回答某类型实现了哪些接口这类问题.


### 1.13 省掉小括号却省不掉花括号

> Go语言里面的if语句，其条件表达式不需要用小括号扩起来，这被作为“代码比较简洁”的证据来宣传。可是，你省掉了小括号，却不能省掉大括号啊，一条完整的if语句至少还得三行吧，人家C、C++、Java都可以在一行之内搞定的（可以省掉花括号）。人家还有x?a:b表达式呢，也是一行搞定，你Go语言用if else写至少得五行吧？哪里简洁了？

“代码比较简洁”, 谁告诉你是这个原因了? 不懂别瞎说!

必须花括弧的原因是C语言中 `if else` 的悬挂问题:

```
if(1)
	....;
	if(2)
		...;
else
	...;
```

请问上面的 `else` 是属于哪个 `if` 的?

必须加花括弧可以避免上面的问题.

而小括弧又不是必须的因此就去掉了(Swift同样用了Go的设计).

至于 `x?a:b` 虽然是简洁, 但是容易泛滥 `(x?a:b)?(x?a:b):(x?a:(x?a:(...)))`.

Go不是因为 简洁 的 `x?a:b` 而禁止三元操作符, 而是为了防止泛滥使用而禁止三元操作符.

### 1.14 编译生成的可执行文件尺寸非常大

> 记得当年我写了一个很简单的程序，把所有系统环境变量的名称和值输出到控制台，核心代码也就那么三五行，结果编译出来把我吓坏了：EXE文件的大小超过4MB。如果是C语言写的同样功能的程序，0.04MB都是多的。我把这个信息反馈到官方社区，结果人家不在乎。是，我知道现在的硬盘容量都数百GB、上TB了……可您这种优化程度……怎么让我相信您在其他地方也能做到不错呢。（再次强调一遍，我所有的经验和数据都来自Go 1.0发布前夕。）

C语言的0.04MB程序如果崩了(Windows64环境TDM-GCC生成128KB), 你就只能知道它崩了.

而Go1.0的4MB程序如果崩了, 你可以知道在哪个文件的哪行代码崩了, 这就是差别!

对于Go1.5, Windows64环境, 使用 `fmt.Println`, `Hello world` 生成的 exe 有 2.4 MB.

对于 Rust1.1, Windows64环境, 生成的 exe 有 2.3 MB.

做了一个数组越界导致崩溃的测试, Go生成的2.4MB的程序可以输出导致崩溃的文件名和行号:

```
panic: runtime error: index out of range

goroutine 1 [running]:
main.main()
	D:/path/to/main.go:7 +0x1b9
```

Rust 生成的exe只能输出以下没啥用的信息:

```
thread '<main>' panicked at 'index out of bounds: the len is 2 but the index is
100', C:/bot/slave/stable-dist-rustc-win-gnu-64/build/src/libcollections\vec.rs:
1359
```

关于exe大小的问题可以关注 [Issue6853](https://github.com/golang/go/issues/6853).

### 1.15 不支持动态加载类库

> 静态编译的程序当然是很好的，没有额外的运行时依赖，部署时很方便。但是之前我们说了，静态编译的文件尺寸很大。如果一个软件系统由多个可执行程序构成，累加起来就很可观。如果用动态编译，发布时带同一套动态库，可以节省很多容量。更关键的是，动态库可以运行时加载和卸载，这是静态库做不到的。还有那些LGPL等协议的第三方C库受版权限制是不允许静态编译的。至于动态库的版本管理难题，可以通过给动态库内的所有符号添加版本号解决。无论如何，应该给予程序员选择权，让他们自己决定使用静态库还是动态库。一刀切的拒绝动态编译是不合适的。

假设系统由100多个exe组成了, 那总共也就是不超过1GB的磁盘空间, 没觉得有多大.

而且DLL依赖的地狱难道忘记了吗.

如果非要DLL动态加载, 自己 `cgo` 或 `syscall` 动态加载吧.

### 1.16 其他

> - 不支持方法和函数重载（overload）
- 导入pkg的import语句后边部分竟然是文本（import ”fmt”）
- 没有enum类型，全局性常量难以分类，iota把简单的事情复杂化
- 定义对象方法时，receiver类型应该选用指针还是非指针让人纠结
- 定义结构体和接口的语法稍繁，interface XXX{} struct YYY{} 不是更简洁吗？前面加上type关键字显得罗嗦。
- 测试类库testing里面没有AssertEqual函数，标准库的单元测试代码中充斥着if a != b { t.Fatal(...) }。
- 语言太简单，以至于不得不放弃很多有用的特性，“保持语言简单”往往成为拒绝改进的理由。
- 标准库的实现总体来说不甚理想，其代码质量大概处于“基本可用”的程度，真正到企业级应用领域，往往就会暴露出诸多不足之处。
- 版本都发展到1.2了，goroutine调度器依旧默认仅使用一个系统线程。GOMAXPROCS的长期存在似乎暗示着官方从来没有足够的信心，让调度器正确安全地运行在多核环境中。这跟Go语言自身以并发为核心的定位有致命的矛盾。（直到2015年下半年1.5发布后才有改观）
- 官方发行版中包含了一个叫oracle的辅助程序，与Oracle数据库毫无关系，却完全无视两者之间的名称混淆。

- 不支持函数重载减轻了读代码的负担, 是好事情. 可变的`a+b`行为比可变的`Add(a,b)`难发现多了
- `import`导入文本绝对是优点, 因为可以支持很多以特殊字符命名的路径: `import "_-aa/bb~/dd/xx"`, 只有包名满足ID命名规则就可以了, 前缀部分可以很随意
- `receiver` 就是普通函数: `func(self T, ...)` 和 `func(self *T, ...)` 的差别不是很明显吗
- `type` 开始规则更统一, 和 `var x int` 和 `func Add(a, b int) int` 类型后缀的规则是一致的(Rust中的变量和函数也是类型后置吧), 比如 `type MyInt int`, `type MyFunc func(...)`, 而且也非常便于解析和查找(正则`^type`就可以定位了)
- 如果要加 `AssertEqual` 的话, 那么什么叫 `equal` 呢? 2个map或struct如何才是叫相等, chan成员呢? 别总是想着增加功能, 增加功能的同时带来的问题和复杂性难道不需要考虑吗?
- 语言太简单难道不是优点吗? C++语言够复杂, 建议楼主深入学习
- 标准库的一大原则就是基本可用, 标准库不是一个大杂烩, 我想"少即是多"的哲学你是不会理解的
- Go1.5默认N个系统线程, N为CPU核心数目. 默认值并不是没有信心, 而是对于不同的程序, 需要几个线程最好是一个比较困难的事情(比如gui程序为何不用多线程呢).
- `oracle` 就是一个普通的单词, 为何不能使用? 楼主会不会因为买了水果的手机, 以后就不认识 `apple` 这个单词了?


> 上面列出的是我目前还能想到的对Go语言的不爽之处，毕竟时间过去两年多，还有一些早就遗忘了。其中一部分固然是小不爽，可能忍一忍就过去了，但是很多不爽积累起来，总会时不时地让人难受，时间久了有自虐的感觉。程序员的工作生活本来就够枯燥的，何必呢。

> 必须要说的是，对于其中大多数不爽之处，我（Liigo）都曾经试图改变过它们：在Go 1.0版本发布之前，我在其官方邮件组提过很多意见和建议（甚至包括提交代码CL），极力据理力争，可以说付出很大努力，目的就是希望定型后的Go语言是一个相对完善的、没有明显缺陷的编程语言。结果是令人失望的，我人微言轻、势单力薄，不可能影响整个语言的发展走向。1.0之前，最佳的否定自我、超越自我的机会，就这么遗憾地错过了。我最终发现，很多时候不是技术问题，而是技术人员的问题。

给Go提交的CL的要求是非常高, 楼主的BOM提法我觉得可以讨论, 但是不要以为CL增加了特性就必须得通过.

还好, Go团队没有接受你上面的诸多建议, 要不然我估计我现在已经放弃Go了.

## 第2节：我为什么对Go语言的某些人不爽？

> 这里提到的“某些人”主要是两类：一、负责专职开发Go语言的Google公司员工；二、Go语言的推崇者和脑残粉丝。我跟这两类人打过很多交道，不胜其烦。再次强调一遍，我指的是“某些”人，而不是所有人，请不要对号入座。

对于一, 固执的G员工, 你要通过逻辑来说服他们, 如果自己都没有干货, 别人凭什么要采纳你的建议(上面的绝大部分建议我就反对)?

对于二, 脑残粉丝谁都烦, 希望楼主下次吐槽能给点干货, 别把自己也整成了脑残粉.

> Google公司内部负责专职开发Go语言的核心开发组某些成员，他们倾向于闭门造车，固执己见，对第三方提出的建议不重视。他们常常挂在嘴边的口头禅是：现有的做法很好、不需要那个功能、我们开发Go语言是给Google自己用的、Google不需要那个功能、如果你一定要改请fork之后自己改、别干提意见请提交代码。很多言行都是“反开源”的。通过一些具体的例子，还能更形象的看清这一层。就留下作为课后作业吧。

对于技术而言, 我更喜欢独裁者. 所谓的开源烂民主那是活稀泥的.

你可以尝试去提一个Linux内核也增加GUI模块的建议试试.

> 我最不能接受的就是他们对1.0版本的散漫处理。那时候Go还没到1.0，初出茅庐的小学生，有很大的改进空间，是全面翻新的最佳时机，彼时不改更待何时？1.0是打地基的版本，基础不牢靠，等1.0定型之后，处处受到向后兼容性的牵制，束手缚脚，每前进一步都阻力重重。急于发布1.0，过早定型，留下诸多遗憾，彰显了开发者的功利性强，在技术上不追求尽善尽美。

Go1.5的地基已经非常的牢固, 这个你不用担心.

> Go语言的核心开发成员，他们日常的开发工作是使用C语言——Go语言的编译器和运行时库，包括语言核心数据结构和算法map、channel、scheduler，都是C开发的——真正用自己开发的Go语言进行实际的大型应用开发的机会并不多。虽然标准库是用Go语言自己写的，但他们却没有大范围使用标准库的经历。实际上，他们缺少使用Go语言的实战开发经验，往往不知道处于开发第一线的用户真正需要什么，无法做到设身处地为程序员着想。缺少使用Go语言的亲身经历，也意味着他们不能在日常开发中，及时发现和改进Go语言的不足。这也是他们往往自我感觉良好的原因。

**缺少使用Go语言的亲身经历**, 楼主也真的敢信口开河. 你不是以为G公司开发Go真的是用来玩的吧.

再说Go1.5已经完全没有C代码了, 这下你该闭口了吧.

> Go语言社区里，有一大批Go语言的推崇者和脑残粉丝，他们满足于现状，不思进取，处处维护心中的“神”，容不得批评意见，不支持对语言的改进要求。当年我对Go语言的很多批评和改进意见，极少得到他们的支持，他们不但不支持还给予打击，我就纳闷了，他们难道不希望Go语言更完善、更优秀吗？我后来才意识到，他们跟乔帮主的苹果脑残粉丝们，言行一脉相承，具有极端宗教倾向，神化主子、打击异己真是不遗余力呀。简简单单的技术问题，就能被他们上升到意识形态之争。现实的例子是蛮多的，有兴趣的到网上去找吧。正是因为他们的存在，导致更多理智、清醒的Go语言用户无法真正融入整个社区。

你的很多批评和改进意见都是狗屎(包括BOM那个). 你这样的用户没有融入社区时好事情, Go语言只要在生产环境好用就可以了.

> 如果一个项目、团队、社区，到处充斥着赞美、孤芳自赏、自我满足、不思进取，排斥不同意见，拒绝接纳新方案，我想不到它还有什么前进的动力。逆水行舟，是不进反退的。

可惜世界不是以你的意志改变的, Go还将继续快速发展, 你是很难受吧?

## 第3节：还有比Go语言更好的选择吗？

> 我始终坚持一个颇有辩证法意味的哲学观点：在更好的替代品出现之前，现有的就是最好的。失望是没有用的，抱怨是没有用的，要么接受，要么逃离。我曾经努力尝试过接受Go语言，失败之后，注定要逃离。发现更好的替代品之后，无疑加速了逃离过程。还有比Go语言更好的替代品吗？当然有。作为一个屌丝程序员，我应该告诉你它是什么，但是我不说。现在还不是时候。我现在不想把这两门编程语言对立起来，引发另一场潜在的语言战争。这不是此文的本意。如果你非要从现有信息中推测它是什么，那完全是你自己的事。如果你原意等，它或许很快会浮出水面，也未可知。

不就是号称银弹的 Rust 吗, 但是 然并卵. 我也断言一句: Rust 最终只能是小众语言, 想代替 Go语言/C语言 根本是没戏的(Swift开源后基本可以秒杀Rust).

## 第4节：写在最后

> 我不原意被别人代表，也不愿意代表别人。这篇文章写的是我，一个叫Liigo的80后屌丝程序员，自己的观点。你完全可以主观地认为它是主观的，也完全可以客观地以为它是客观的，无论如何，那是你的观点。

> 这篇文字是从记忆里收拾出来的。有些细节虽可考，而不值得考。——我早已逃离，不愿再回到当年的场景。文中涉及的某些细节，可能会因为些许偏差，影响其准确性；也可能会因为缺少出处，影响其客观性。如果有人较真，非要去核实，我相信那些东西应该还在那里。

> Go语言也非上文所述一无是处，它当然有它的优势和特色。读者们判断一件事物，应该是优劣并陈，做综合分析，不能单听我一家负面之言。但是它的那些不爽之处，始终让我不爽，且不能从其优秀处得以完全中和，这是我不得不放弃它的原因。

走好, 不送!

----


### Liigo 2014-4-29 补记1：

> Go语言社区还有一个很奇特的现象，就是中国社区独大，国外社区要小的多。有外国网友还专门写了一篇文章研究《为什么Golang中国社区独大》这个问题（文中也提到了我这篇博文）。通常来说，在IT和软件领域，向来都是国外先进国家引领技术潮流，然后国内缓慢跟进。而到了Go语言这里，恰恰反过来了，似乎暗示着在国外的主流软件开发技术人员并不怎么待见Go语言，Go只是在国内受到一帮人的盲目推崇而已，至于这帮人的眼光如何，反正我不看好。

在工作中都已经用上了, 你还在想象别人是在盲目推崇, 是你自己在梦游吧.

### Liigo 2014-4-29 补记2：

> 著名的编程语言研究专家王垠写了一篇《对 Go 语言的综合评价》（晚于本博文发表约三五天），也是总体上持批判态度，看衰Go语言。读者们可以对照阅读。

王的垠语言出来了吗? 等着10年后他再次扇自己的脸(参考Windows无用那篇).

### Liigo 2014-4-29 补记3：

> Go语言的拥护者们，似乎连Go语言的“核心优势”都说不出几条。知乎上很有人气的一条问答《为什么要使用 Go 语言，Go 语言的优势在哪里》，连静态编译、GC、跨平台都拿出来说了（无视C/C++/Java），甚至连简单易学（无视Python/易语言）、“丰富的”标准库（跟谁比?敢跟Java/C#/Python比么?）、好用的工具链（gofmt）都扯出来了，可见除了“并发、网络”之外，他们也讲不出另外的什么核心优势了，只能靠一些周边的东西凑数。

不需要NB的特性, 只需要简单/好用/实用就行.

### Liigo 2015-1-31 补记4：

> 全世界认为Go语言不好的可不只是我Liigo一个人。国外著名的问答网站Quora上面有个人气很高的提问，“为什么不要用Go语言”（英文网页），看看那排名最前的两个答案，以及广大程序员们给这两个答案的数百个“赞”，都足以说明Go语言自身的问题是客观存在的。人民群众的眼睛是雪亮的。

就是数万个“赞”又怎么样? 关键是很多地方Go已经用起来了.

### Liigo 2015-4-1 补记5：

> 文中1.10（黑魔法）和1.12（接口）章节增加了两处“延伸阅读”链接，被引用的链接后面均有大量网友评论。此举主要是为了说明本文观点并非一家之言。

### Liigo 2015-5-29 补记6：

> 补充说明Go语言直到2015年下半年1.5发布后才将GOMAXPROCS设置为大于1的默认值(HN)，他们文中承认之前一直默认设置为1是因为调度器不完善（与我此文最初发表时的猜测一致）。

原来这是你的功劳!

### Liigo 2015-6-2 补记7：

> 补充两篇英文：Why Go Is Not Good（作者Will Yager重点批评了Go语言的设计不佳甚至是倒退），Leaving Go（作者Danny Gratzer放弃Go语言的原因主要是：没有泛型，充满黑魔法）。这两篇文章都是针对具体问题做具体分析的，与本文写作精神一致，务实不务虚。其中提到的对Go语言不满的地方，本文也多有涉及，结论类似。

放弃Go语言很正常, 也有很多放弃X语言投奔Go语言的例子.


### 关于对作者倾向性质疑的声明：

> 读者看到本文全都是Go语言负面性的内容，没有涉及一点Go语言好的地方，因而质疑作者的盲目倾向。出现这种结果完全是因为文章主题所限。此前本文末尾也简单提到过，评估一件事物，应当优劣并陈，优势项加分，劣势项减分，做综合评估分析。如果有突出的重大优势，则可以容忍一些较大的劣势；但如果有致命的劣势或多项大劣势，则再大的优势也无法与之中和。中国乒乓球界讲领军人物必须做到“技术全面，特长突出，没有明显弱点”，我甚为赞同。用这句话套用Go语言，可以说“技术不全面（人家自己说成简洁），有一点特长（并发），有明显的弱点（包括但不限于本文列出的这些）”。如此一来，优势都被劣势中和了，劣势还是那么突出，自然是得负分，自然是弃用，自然是没有好印象。我在这里可以说观点鲜明、态度明确，不和稀泥。与其看那些盲目推崇Go语言的人和文章，笼统的说“好”，不如也顺便看看本文，具体到细节地说“不好”。凡是具体到细节的东西，都是容易证实或证伪的，比笼统的东西（无论是"黑"还是"粉"）可信性更高一些。

不需要NB的特性, 只需要简单/好用/实用就行.


### 关于对作者阴谋论的声明：

> 有某些阴谋论者（例如谢某），说我因一个Pull Request被Go开发者拒绝而“怀恨至今”，暗示此文是故意报复、抹黑Go语言。我对Golang有恨吗？当然是有的，那是一个不爽接一个不爽（如本文一一罗列的那些），逐步累积，由量变形成质变的结果，是我对Golang综合客观评估之后的主观态度，并非由哪一个单独的事件所主导。要说Pull Request被拒绝，Rust开发者拒绝我的PR次数还少吗？比如 [https://github.com/mozilla/rust/pull/13014](https://github.com/mozilla/rust/pull/13014) 和 [https://github.com/liigo/rust/tree/xp](https://github.com/liigo/rust/tree/xp) 和 [https://github.com/rust-lang/rust/issues/12842](https://github.com/rust-lang/rust/issues/12842)，要是再算上被拒的Issues，那就多的数不清了。我显然不可能因为某些个别的事件，影响到我对某个事物的综合评估（参见前文）。那本文是“故意抹黑”Go语言吗？我觉得不是，理由有二：1、这是作者的主观感受，2、这些感受是以许多客观事实为基础的。如果本文一一列出的那些现象，是不存在的，是虚构出来的，是凭空生成的，那么作者一定是“低级黑”。问题是，那些都是客观存在的事实。把事实说出来，怎么能叫“黑”呢？欢迎读者客观而详细的指正本文中的所有错误。

CL被据而怀恨至今真的是没冤枉楼主, 希望下次抹黑Go能来点干货.

-------

当然Go语言也不是完美的, 作为Windows下的Go用户, 说下我比较希望的改进.

首先在下面的bug修复前，我并不十分关心Go的性能改进。

- 修复 [Issue11058](https://github.com/golang/go/issues/11058), 让 Go 可以生成 dll, 这样我就可以基本抛弃 C++ 了
- 修复 [Issue9510](https://github.com/golang/go/issues/9510), 这样 cgo 才可以放心地静态链接 c++ 库

上面2个bug是支持go和c库双向合作的关键(Linux和Darwin已经支持生成动态库). 然后就是 cgo 调用 c 函数的参数传递的性能能改善下.

在go1.5中, 新引入了 vendor 的试验性的特性, 因此go的包依赖管理算是基本解决.

长远看希望语言方面能有以下的特性:

- 范型支持, 可以简陋些, 但是不要破坏go已有的风格
- 希望能有不支持嵌套的三元表达式的支持
- 大小写的导出规则对中文能友好一些
- 接口瘾式转换导致的一些坑(`error`和`nil`)
- 官方的leveldb库和基于其封装的sql数据库
- os 的文件系统做成接口, 提共自定义文件系统的挂载功能
- image 包能增加 GrayA/GrayA32/RGB/RGB48 之类的类型支持
- 性能改进

可有可无的：

- GUI支持
- IDE支持