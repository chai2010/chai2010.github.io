---
title: "Go1.1有哪些改进?"
date: 2013-03-27

categories: [golang]
---

前几天GCC4.8发布, 已经部分包含Go1.1特性, 详细介绍:

- [http://gcc.gnu.org/gcc-4.8/changes.html#go](http://gcc.gnu.org/gcc-4.8/changes.html#go)

根据golang-nuts的消息, 4月第1周可能会进入Go1.1发布流程(就是下周).
要修复的问题还剩20多一点的, 估计应该不会出现大的延期.

- [http://swtch.com/~rsc/go11.html](http://swtch.com/~rsc/go11.html)

Go1.1主要的目标是性能的优化和一些bug的修复, 详细内容参考:

- [https://go.googlecode.com/hg/doc/go1.1.html](https://go.googlecode.com/hg/doc/go1.1.html)
- [http://tip.golang.org/doc/go1.1](http://tip.golang.org/doc/go1.1)

Go1.1的更新主要涉及 **语言/实现/性能优化/标准库** 几个部分.

**补充:**

- Go1.1正式版本已经于**2013.05.14**正式发布
- Go1.1的二进制安装包将包含[gotour](http://tour.golang.org/)程序(启动命令: `go tool tour`, 但是还有点问题).
- gccgo1.1的发布流程和GCC4.8.1同步.
- 和C的性能对比请参考: **[Go1.1性能测试报告(和C差距在10%以内)](http://my.oschina.net/chai2010/blog/130859)**

# 语言的改变

Go1发布时曾作出承诺, 保证在Go1.x发布后不会修改之前的语言特性. 这里有一些问题的修复, 还有一些新增加的特性.

## 整数除以零是编译错误

在Go1中, 整数被一个常量0除会导致一个运行时 `panic`:

	func f(x int) int {
		return x/0
	}

在 Go1.1 中, 整数被一个常量0将会被当作一个编译错误处理.

## Unicode代理区码点不能用于面值

字符串和 `rune` 字面值的定义更加严格. Unicode代理区码点不能用于面值. 细节请参考后面的 Unicode 章节.

## 方法值和方法表达式

Go1.1新实现了方法值(method values), 它是绑定到receiver值的一个闭包. 比如有一个实现了`Writer` 的 `w` 值, 那么 `w.Write` 将等价于下面的闭包函数:

	func (p []byte) (n int, err error) {
		return w.Write(p)
	}

方法值(method values)不同于方法表达式(method expressions), 方法表达式是从一个类型对应的函数. 比如 `(*bufio.Writer).Write` 和下面的普通函数类型:

	func (w *bufio.Writer, p []byte) (n int, err error) {
		return w.Write(p)
	}

*更新:* 现有的代码不需要更新, 这个是新加的特性.

GoSpec中给出了很多例子:

	f := t.Mv; f(7)   // like t.Mv(7)
	f := pt.Mp; f(7)  // like pt.Mp(7)
	f := pt.Mv; f(7)  // like (*pt).Mv(7)
	f := t.Mp; f(7)   // like (&t).Mp(7)
	f := makeT().Mp   // invalid: result of makeT() is not addressable

有了方法值, Go1.1可以从interface值中取出方法值(Go1.0不支持方法值):

	var i interface { M(int) } = myVal
	f := i.M; f(7)  // like i.M(7)

这样改动的好处是类型的方法和`interface`方法完全统一了.

## Return requirements ##

在Go1.1之前, 函数如果有返回值的话, 则最后必须有一个retune或panic语句.

	func abs(x int) int {
		if x >= 0 {
			return x
		} else {
			return -x
		}
	}

会有以下编译错误:

> function ends without a return statement

之前一般可以在末尾加一个panic来回避这个问题:

	func abs(x int) int {
		if x >= 0 {
			return x
		} else {
			return -x
		}
		panic("not reachable")
	}

在Go1.1规范, 对函数的终结语句做了定义:

- [https://go.googlecode.com/hg/doc/go_spec.html#Terminating_statements](https://go.googlecode.com/hg/doc/go_spec.html#Terminating_statements)

主要有以下几种类型:

- return或者goto语句
- 调用内置的panic函数
- if语句: 必须带else, 并且if和else部分都有明确的终结语句
- for语句: 死循环的类型(无退出条件和break语句)
- switch语句: 没有break语句, 必须有default分支, 每个分支都有终结语句(或者是fallthrough到下个分支的终结语句)
- select语句: 无break语句, 必须有default分支, 每个分支都有终结语句
- 用于goto的Label

已有的代码可以不用更新, 当然有些代码可以写的更简化.

# 实现和工具的变化

## gccgo的变化

上个月发布的 GCC 4.8.0 还没有完整的包含 Go1.1. 确实的主要功能是没有方法值, 标准库也有一些差异. 可以期望5月份发布GCC4.8.1时, gccgo能够完整支持Go1.1.

## 命令行参数解析

在目前的gc工具链中, 编译器和连接器使用的是同样的命令行参数解析规则, 基于Go语言的flag包实现. 和传统的UNIX命令行习惯有些不同. 这可能影响直接调用GC工具的脚本. 例如, 原有的 `go tool 6c -Fw -Dfoo` 命令, 现在要这样写 `go tool 6c -F -w -D foo`.

## 64位系统 int 大小为int64

语言规范运行实现自由选择 `int` 和 `uint` 为32位或64位. 在之前的实现中, `int` 和 `uint`都是32位. 现在, 在 `AMD64/x86-64` 平台, GC和gccgo实现的`int` 和 `uint` 都是64位的. 一个相关的变化是, 在64位系统切片将可以分配超出`int32`能表示的20多亿个元素.

*更新:* 大部分代码不受影响. 如果可能会影响涉及 `int` 类型转换有关的代码:

	x := ^uint32(0) // x is 0xffffffff
	i := int(x)     // i is -1 on 32-bit systems, 0xffffffff on 64-bit
	fmt.Println(i)

下面是一种可移植的写法(-1在所有系统是可以确定的):

	i := int(int32(x))

## 64位平台的堆大小

对于64位平台, 堆的最大上限扩大很大, 从几个GB到几十个GB(具体细节取决于系统,并且可能会更改).

在32位系统, 堆的大小没有变化.

*更新:* 现有代码没有影响. 当时新程序可以使用更多的内存.

**补充:** Windows/amd64目前默认为32GB(以后会根据不同版本调整).

## Unicode

主要是和UTF16相关的代理区码点有关:

- 代理区码点不能用在字符/字符串面值中.
- 代理区码点的输出也有变化

比如:

	import "fmt"

	func main() {
		fmt.Printf("%+q\n", string(0xD800))
	}

Go 1.0输出为 "\ud800", Go 1.1 输出为 "\ufffd".

## Race detector

`go tool`内置数据竞争检测工具. 目前只支持64位系统. 使用时需要指定`-race`选项.

比如以下的代码, 在2个不同goroutine中竞争访问`m`.

	func main() {
		c := make(chan bool)
		m := make(map[string]string)
		go func() {
			m["1"] = "a" // First conflicting access.
			c <- true
		}()
		m["2"] = "b" // Second conflicting access.
		<-c
		for k, v := range m {
			fmt.Println(k, v)
		}
	}

可以这样测试:

	$ go run -race mysrc.go  // to run the source file

**补充:** 检测工具目前是基于LLVM的[ThreadSanitizer race detector](http://llvm.org/svn/llvm-project/compiler-rt/trunk/lib/tsan/go/)实现的.

## gc assemblers

主要是为了适应64位系统`int`的默认大小变化, 和其他一些内部约定的变化.

## go 的变化

`go get`时必须设置`GOPATH`, 并且`GOPATH`和`GOROOT`不能相同.

**补充:** 建议兲朝用户手工下载, 因为`go get`默认使用的`https`协议经常被墙.

## go test 的变化

当启动了剖析选项时, `go test`默认不在删除二进制测试程序. 有专门的选项`-cpuprofile`:

	$ go test -cpuprofile cpuprof.out mypackage

还有`-blockprofile`选项, 可以检测goroutines被阻塞情况.

更多细节请参考: `go help test`

## go fix 的变化

现在`go fix`将不再支持Go1之前的代码到Go1的转换. 如果需要处理Go1之前的代码, 需要先使用Go1的工具做预处理.

## 新的构建约束

如果只在Go1.1+环境编译, 可以设置以下构建选项:

	// +build go1.1

如果是Go1.0.x的变化条件, 则是:

	// +build !go1.1

## 新支持的平台

Go1.1工具链实验性的增加`freebsd/arm`, `netbsd/386`, `netbsd/amd64`, `netbsd/arm`, `openbsd/386` 和 `openbsd/amd64`平台的支持.

对于 `freebsd/arm` 或 `netbsd/arm` 必须是ARMv6或更高的版本.

Go1.1对于`linux/arm`平台实验性的提供`cgo`的支持.

## 交叉编译

交叉编译时, 默认禁止`CGO`. 如果需要启动`CGO`, 需要手工设置`CGO_ENABLED=1`.

# 性能优化

主要有以下几个地方:

- gc编译器生成代码优化, 特别是Intel 32-bit下的浮点运算
- gc编译器采用更多的内联优化, 比如内置的append函数和interface的转换等
- map的一个改进实现, 显著减少内存碎片和CPU时间
- 在多核的CPU上, 可以并行的运行垃圾回收
- 更精确的垃圾回收, 可以显著减少堆的大小, 特别是在32位系统
- 运行时和网络库配合更紧密, 减少上下文切换代价
- 标准库的优化

根据官方的说法, Go1.1性能提升基本有30%-40%, 有时更多(当然也有不明显的情况).

**补充:** Windows版本很多优化的代码还没有合并进来, 特别是运行时/网络部分.

# 标准库的变化

- `reflect`包功能完善: 实现了`select`的支持; 类型转换支持; 变量到闭包的转换; `chan`/`map`/`slice`的支持等.
- 新加的包: `go/format`/`net/http/cookiejar`/`runtime/race`
- 其他很多包的问题修复/功能完善/性能优化 等.

这个部分细节太多, 具体查看官方文档吧.
