---
title: "Go语言嵌入脚本语言"
date: 2018-10-21
draft: true

tags: ["golang", "lua", "js"]
categories: ["golang"]
---

Go语言是静态语言，静态编程语言一般没有脚本语言那么灵活。因此，很多静态语言都会有一些对应脚本语言配合使用。比如，C/C++静态语言可以嵌入小巧的lua脚本，也可以通过Google的V8引擎嵌入JavaScript脚本，甚至还可以嵌入Python和Ruby等更强大的脚本语言。

<!--more-->

Go语言作为一个相对较新的编程语言（其实已经6+年了），Go对已有的脚本语言支持要差一些，而且早期很多脚本语言是以CGO的方式嵌入C语言版本的脚本引擎。随着Go语言的发展，已经出现了很多用Go语言原生实现的脚本语言引擎，比如 [otto](https://github.com/robertkrimen/otto) 就是一款原生的JavaScript脚本引擎，[gopher-lua](https://github.com/yuin/gopher-lua) 则是用Go原生实现的Lua脚本引擎。除了对已有的脚本语言提供选择之外，还有一些专门给Go语言设计的脚本语言，它们的语法和Go语言保持很大的相似性。其中 [Agora](https://github.com/PuerkitoBio/agora) 是出现较早的一个，不过Agora并没有完成全部的设计目标，而且最近几年已经没有继续发展了。另一个是日本知名的Go程序员mattn设计并实现的 [Anko](https://github.com/mattn/anko) 脚本语言。

## BrainFuck语言

BrainFuck是一种极小化的计算机语言，它是由Urban Müller在1993年创建的。BrainFuck语言的中文名字是脑操语言，简称为BF。Müller最初的设计目标是建立一种简单的、可以用最小的编译器来实现的、符合图灵完全思想的编程语言。这种语言由八种状态构成，早期为Amiga机器编写的编译器（第二版）只有240个字节大小！

就象它的名字所暗示的，brainfuck程序很难读懂。尽管如此，brainfuck图灵机一样可以完成任何计算任务。虽然brainfuck的计算方式如此与众不同，但它确实能够正确运行。这种语言基于一个简单的机器模型，除了指令，这个机器还包括：一个以字节为单位、被初始化为零的数组、一个指向该数组的指针（初始时指向数组的第一个字节）、以及用于输入输出的两个字节流。这种 语言，是一种按照“Turing complete（完整图灵机）”思想设计的语言，它的主要设计思路是：用最小的概念实现一种“简单”的语言，BrainF**k 语言只有八种符号，所有的操作都由这八种符号的组合来完成。

下面是这八种状态的描述，其中每个状态由一个字符标识：

| 字符 | C语言类比          | 含义
| --- | ----------------- | ------
| `>` | `++ptr;`          | 指针加一
| `<` | `--ptr;`          | 指针减一
| `+` | `++*ptr;`         | 指针指向的字节的值加一
| `-` | `--*ptr;`         | 指针指向的字节的值减一
| `.` | `putchar(*ptr);`  | 输出指针指向的单元内容（ASCⅡ码）
| `,` | `*ptr = getch();` | 输入内容到指针指向的单元（ASCⅡ码）
| `[` | `while(*ptr) {}`  | 如果指针指向的单元值为零，向后跳转到对应的 `]` 指令的次一指令处
| `]` |                   | 如果指针指向的单元值不为零，向前跳转到对应的 `[` 指令的次一指令处

下面是一个 brainfuck 程序，向标准输出打印"hi"字符串：

```
++++++++++[>++++++++++<-]>++++.+.
```

要用Go语言实现brainfuck引擎，我们先定义一个`Machine`结构对应运行brainfuck虚拟机。

```go
type Machine struct {
	mem  [30000]byte
	code string
	pos  int
	pc   int
	r    io.ByteReader
	w    io.Writer
}
```

其中`code`对应虚拟机的内存，`code`对应brainfuck程序，`pos`和`pc`分别对应当前的内存位置和指令位置。`r`和`w`分别对应标准输入和标准输出。从上述结构可以看出，brainfuck虚拟机的内存和指令是分开寻址的，可以人为brainfuck是一个类似哈弗架构的计算机。

然后创建`New`构造函数，用于创建虚拟机对象：

```go
func New(code string, r io.Reader, w io.Writer) *Machine {
	if r == nil {
		r = os.Stdin
	}
	if w == nil {
		w = os.Stdout
	}
	return &Machine{
		code: code,
		r:    bufio.NewReader(r),
		w:    w,
	}
}
```

同时在创建一个`Reset`函数用于重置虚拟机到开始状态：

```go
func (p *Machine) Reset() *Machine {
	for i, _ := range p.mem {
		p.mem[i] = 0
	}
	p.pos = 0
	p.pc = 0
	return p
}
```

然后是用于运行虚拟机的`Run`函数：

```go
func (p *Machine) Run() error {
	for ; p.pc != len(p.code); p.pc++ {
		switch x := p.code[p.pc]; x {
		case '>':
			p.pos++
		case '<':
			p.pos--
		case '+':
			p.mem[p.pos]++
		case '-':
			p.mem[p.pos]--
		case '[':
			if p.mem[p.pos] == 0 {
				p.loop(1)
			}
		case ']':
			if p.mem[p.pos] != 0 {
				p.loop(-1)
			}
		case '.':
			fmt.Fprintf(p.w, "%c", p.mem[p.pos])
		case ',':
			c, err := p.r.ReadByte()
			if err != nil {
				return err
			}
			p.mem[p.pos] = c
		}
	}
	return nil
}
```

其中`[`和`]`对应的循环跳转有私有`loop`函数处理:

```go
func (p *Machine) loop(inc int) {
	for i := inc; i != 0; p.pc += inc {
		switch p.code[p.pc+inc] {
		case '[':
			i++
		case ']':
			i--
		}
	}
}
```

下面的代码用于运行开始的brainfuck程序，用于向标准输出打印"hi"字符串：

```go
func main() {
	New("++++++++++[>++++++++++<-]>++++.+.", os.Stdin, os.Stdout).Run()
}
```

## Anko（红豆沙）语言

![](/images/anko.png)

Anko是一个专门针对Go语言定制的脚本语言，Anko的语法和Go语言的语法很相似，但是去掉了变量的声明和类型信息。

下面代码演示了Anko脚本的常见用法:

```go
# declare function
func plus(n) {
	return n + 1
}

# declare variables
x = 1
y = x + 1

# print values
println(x * (y + 2 * x + plus(x) / 2))

# if/else condition
if plus(y) > 1 {
	println("你好世界")
} else {
	println("Hello, World")
}

# array type
a = [1,2,3]
println(a[2])
println(len(a))

# map type
m = {"foo": "bar", "far": "boo"}
m.foo = "baz"
for k in keys(m) {
	println(m[k])
}
```

其中`#`开头的表示注释. Anko脚本中函数和Go语言的函数看起来非常相似, 但是Anko中函数的参数没有类型, 虽然函数也没有返回值, 但是可以通过return语句返回结果. Anko中的变量没有类型, 并且也不需要定义, 变量赋值后可以直接使用

我们可以方便地将Anko嵌入到Go程序中：

```go
package main

import (
	"fmt"
	"log"

	"github.com/mattn/anko/vm"
)

func main() {
	env := vm.NewEnv()

	env.Define("foo", 1)
	env.Define("bar", func() int {
		return 2
	})

	v, err := env.Execute(`foo + bar()`)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(v)
}
```

上面的代码中先通过`vm.NewEnv()`定义了一个Anko虚拟机. 然后在虚拟机中通过`env.Define`定义了foo变量, 变量的值为1. 然后统一通过`env.Define`函数定义了一个名为bar的函数对象, 函数体对应一个Go的闭包函数. 最后, 通过`env.Execute`函数来执行`foo + bar()`脚本代码, 并且获取返回值.

## 嵌入Lua脚本语言

Lua 是一个小巧的脚本语言。作者是巴西人。该语言的设计目的是为了嵌入应用程序中，从而为应用程序提供灵活的扩展和定制功能。Lua由标准C编写而成, 一个完整的Lua解释器不过200k，Lua脚本可以很容易在C/C++环境使用.

在Go语言早期, 有一些通过cgo技术包装的C语言版本的Lua实现, 但是它们对Go语言的交互支持并不友好. 随着Go语言的普及, 已经有多个纯Go语言实现的Lua版本. 其中, github.com/yuin/gopher-lua 是相对比较成熟的一个, 它对lua和Go语言的交互支持都比较好, 摒弃了原始Lua采用栈来传递数据的模型.

下面是用Lua实现的斐波那契算法:

```lua
local function fib(n)
    if n < 2 then return n end
    return fib(n - 2) + fib(n - 1)
end

print(fib(35))
```


将GopherLua嵌入到Go程序非常简单:

```go
import (
	"log"

    "github.com/yuin/gopher-lua"
)

func main() {
	L := lua.NewState()
	defer L.Close()

	if err := L.DoString(`print("hello")`); err != nil {
	    log.Fatal(err)
	}
}
```

我们可以将Go语言函数导入到Lua环境:

```go
func main() {
    L := lua.NewState()
    defer L.Close()

    L.SetGlobal("double", L.NewFunction(func(L *lua.LState) int {
    	lv := L.ToInt(1)
    	L.Push(lua.LNumber(lv * 2))
		return 1
	}))


	if err := L.DoString(`print(double(20))`); err != nil {
	    log.Fatal(err)
	}
}
```

GopherLua对Go语言特有的管道也提供了支持. 可以通过lua.LChannel(ch)来包装Go语言环境的管道, 也可以在lua中通过channel.make创建管道, 管道的类型为lua.LValue. 在lua脚本中通过channel.select来操作多个管道:

```go
local idx, recv, ok = channel.select(
  {"|<-", ch1},
  {"|<-", ch2}
)
if not ok then
    print("closed")
elseif idx == 1 then -- received from ch1
    print(recv)
elseif idx == 2 then -- received from ch2
    print(recv)
end
```

同样, 可以通过channel.send向管道发送数据, 用channel.receive从管道接收数据. 最后, 通过channel.close来关闭不使用的管道.

GopherLua针对Go语言的特色对Lua做了很多扩展功能, 详细接受可以参考它的文档和实现.

## 嵌入JavaScript语言

JavaScript是目前使用最广泛的语言, 它不仅可以用于开发网页程序, 而且可以通过NodeJS来开发后台应用, 同时通过ReactNatie来开发iOS和Android移动平台的应用. 同时, 随着WebAssmbler规范的发展, JavaScript很可能作为一个通用平台存在.

在Go语言中, 有基于v8引擎封装的JavaScript实现, 是基于cgo工具. 随着Go语言的普及, 已经有纯Go语言实现的JavaScript引擎出现, 它就是otto.

JavaScript的一大特性就是简单, 在Go语言中使用JavaScript也同样很简单:

```go
import (
   "github.com/robertkrimen/otto"
)

func main() {
	vm := otto.New()
	vm.Run(`
    	abc = 2 + 2;
    	console.log("The value of abc is " + abc); // 4
	`)
}
```

我们也可以获取返回的JavaScript对象:

```go
func main() {
	vm := otto.New()

	vm.Set("s", "abc")
	value, _ = vm.Run("s.length")
    n, _ := value.ToInteger()

	println(n)
}
```

同样, 我们可以将Go语言函数导入到JavaScript环境中:

```go
func main() {
	vm := otto.New()

	vm.Set("sayHello", func(call otto.FunctionCall) otto.Value {
	    fmt.Printf("Hello, %s.\n", call.Argument(0).String())
	    return otto.Value{}
	})
	vm.Set("twice", func(call otto.FunctionCall) otto.Value {
	    right, _ := call.Argument(0).ToInteger()
	    result, _ := vm.ToValue(2 * right)
	    return result
	})

	result, _ = vm.Run(`
	    sayHello("Golang");     // Hello, Golang.
	    sayHello();             // Hello, undefined

	    result = twice(2.0);    // 4
	`)

	fmt.Println(result)
}
```

## 性能对比

GopherLua官网给出了Anko、Lua、JavaScript和Python等语言的性能对比。对比的程序是递归方式计算斐波那契数。

Anko版本的斐波那契函数实现:

```go
func fib(n) {
    if n < 2 {
      return n
    }
    return fib(n - 2) + fib(n - 1)
}

println(fib(35));
```

Lua版本的斐波那契函数实现:

```lua
local function fib(n)
    if n < 2 then return n end
    return fib(n - 2) + fib(n - 1)
end

print(fib(35))
```

JavaScript版本的斐波那契函数实现:

```js
function fib(n) {
    if (n < 2) return n;
    return fib(n - 2) + fib(n - 1);
}

console.log(fib(35));
```

详细的时间比如如下表:

语言       | 时间
--------- | ---
anko      | 182.73s
otto(js)  | 173.32s
go-lua    | 8.13s
Python3.4 | 5.84s
GopherLua | 5.40s
lua5.1.4  | 1.71s

![](/images/lua-fib.png)

纯Go语言实现的Anko和otto引擎的JavaScript性能相近, 它们比官方的Python3.4要慢1-2个数据级. 而纯Go语言实现的Lua则性能比较优异, 和官方的Python3.4性能相近.其中, go-lua 是Go语言环境的lua实现, 它是基于官方C语言接口包装, 但是因为cgo的函数调用代价比较高, go-lua的性能并不占优.

