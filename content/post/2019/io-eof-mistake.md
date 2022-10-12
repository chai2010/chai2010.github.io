---
title: "io.EOF设计的缺陷和改进"
date: 2019-05-14
draft: false

tags: ["golang", "eof"]
categories: ["golang", "eof"]
---

## 1. 认识io.EOF

io.EOF是io包中的变量, 表示文件结束的错误:

```go
package io

var EOF = errors.New("EOF")
```

也通过以下命令查看详细文档:

```
$ go doc io.EOF
var EOF = errors.New("EOF")

EOF is the error returned by Read when no more input is available. Functions
should return EOF only to signal a graceful end of input. If the EOF occurs
unexpectedly in a structured data stream, the appropriate error is either
ErrUnexpectedEOF or some other error giving more detail.
$
```

io.EOF大约可以算是Go语言中最重要的错误变量了,  它用于表示输入流的结尾. 因为每个文件都有一个结尾, 所以io.EOF很多时候并不能算是一个错误, 它更重要的是一个表示输入流结束了.

## 2. io.EOF设计的缺陷

可惜标准库中的io.EOF的设计是有问题的. 首先EOF是End-Of-File的缩写, 根据Go语言的习惯大写字母缩写一般表示常量. 可惜io.EOF被错误地定义成了变量, 这导致了API权限的扩散. 而最小化API权限是任何一个模块或函数设计的最高要求. 通过最小化的权限, 可以尽早发现代码中不必要的错误.

比如Go语言一个重要的安全设计就是禁止隐式的类型转换. 因此这个设计我们就可以很容易发现程序的BUG. 此外Go语言禁止定义没有被使用到的局部变量(函数参数除外, 因此函数参数是函数接口的一个部分)和禁止导入没有用到的包都是最小化权限的最佳实践. 这些最小API权限的设计不仅仅改进了程序的质量, 也提高了编译工具的性能和输出的目标文件.

因为EOF被定义成一个变量, 这导致了该变量可能会被恶意改变. 下面的代码就是一种优雅的埋坑方式:

```go
func init() {
    io.EOF = nil
}
```

这虽然是一个段子, 但是却真实地暴漏了EOF接口的设计缺陷: 它存在严重的安全隐患. 变量的类型似乎也在暗示用户可以放心地修改变量的值. 因此说EOF是一个不安全也不优雅的设计.

## 3. io.EOF改为常量

一个显然的改进思路是将io.EOF定义为常量. 但是因为EOF对应一个表示error接口类型, 而Go语言目前的常量语法并不支持定义常量类型的接口. 但是我们可以通过一些技巧绕过这个限制.

Go语言的常量有bool/int/float/string/nil这几种主要类型. 常量不仅仅不包含接口等复杂类型, 甚至连常量的数组或结构体都不支持! 不过常量有一个重要的扩展规则: 以bool/int/float/string/nil为基础类型定义的新类型也支持常量.

比如, 我们重新定义一个字符串类型, 它也可以支持常量的:

```go
type MyString string

const name MyString = "chai2010"
```

这个例子中MyString是一个新定义的类型, 可以定义这种类型的常量, 因为它的底层的string类型是支持常量的.

那么io.EOF的底层类型是什么呢? EOF是通过errors.New("EOF")定义的, 下面是这个函数的实现:

```go
package errors

// New returns an error that formats as the given text.
func New(text string) error {
    return &errorString{text}
}

// errorString is a trivial implementation of error.
type errorString struct {
    s string
}

func (e *errorString) Error() string {
    return e.s
}
```

因此io.EOF底层的类型是errors.errorString结构体. 而结构体类型是不支持定义常量的. 不过errors.errorString结构体中只有一个字符串类型, io.EOF对应的错误字符串正是"EOF".

我们可以为EOF重新实现一个以字符串为底层类型的新错误类型:

```go
package io

type errorString string

func (e errorString) Error() string {
    return string(e)
}
```

这个新的io.errorString实现了两个特性: 首先是满足了error接口; 其次它是基于string类型重新定义, 因此支持定义常量. 因此我们可以基于errorString重新将io.EOF定义为常量:

```go
const EOF = errorString("EOF")
```

这样EOF就变成了编译时可以确定的常量类型, 常量的值依然是“EOF”字符串. 但是也带来了新的问题: EOF已经不再是一个接口类型, 它会破坏旧代码的兼容性吗?

## 4. EOF常量到error接口的隐式转换

重新将EOF从error类型的变量改定义为errorString类型的常量并不会带来兼容问题!

首先io.EOF虽然被定义为变量, 但是从语义角度看它其实是常量, 换言之我们只会读取这个值. 其次读取到io.EOF之后, 我们是将其作为error接口类型使用, 唯一的用处是和用户返回的错误进行相等性比较.

比如有以下的代码:

```go
func Foo(r io.Reader) {
    var p []byte
    if _, err := r.Read(p); err != io.EOF {
        // ...
    }
}
```

这里和io.EOF进行比较的err变量必然是error类型, 或者是满足error接口的其他类型. 如果err是接口类型, 那么将io.EOF换成errorString("EOF")常量也是可以工作的:

```go
func Foo(r io.Reader) {
    var p []byte
    if _, err := r.Read(p); err != errorString("EOF") {
        // ...
    }
}
```

这是因为Go语言中一个普通类型的值在和接口类型的值进行比较运算时, 会被隐式转会为接口类型(开这个后门的原因时为了方便接口代码的编写). 或则说在进行比较的时刻, errorString("EOF")已经被替换成error(errorString("EOF")).

普通类型到接口的隐式转会虽然方便, 但是也带来了很多坑. 比如以下的例子:

```go
func Foo() error {
    var p *SomeError = nil
    return p
}
```

以上代码的nil其实是`*SomeError(nil)`. 而`if err != nil` 中的nil其实是error(nil).

而定义为常量的io.EOF常量在和error接口类型的值比较时, io.EOF常量会被转化为对应的接口类型. 这样新的io.EOF错误常量就可以和以前的代码无缝兼容了.

## 5. 总结

普通类型到接口类型的隐式转换、常量的默认类型和基础类型是Go语言中比较隐晦的特性, 很多人虽然在使用这些规则但是并没有意识到它们的细节. 本文从分析io.EOF设计缺陷为起点, 讨论了将常量用于接口值定义的一种思路.
