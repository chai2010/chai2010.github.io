---
title: "Go中的wasm汇编语言"
date: 2018-10-03
draft: false

tags: ["golang", "wasm"]
categories: ["golang", "wasm"]
---

Go1.11已经正式发布，最大的一个亮点是增加了对WebAssembly的实验性支持。对于Go汇编语言爱好者来说，WebAssembly平台是一个新的挑战。本文尝试从最简单的memclr函数入手，简要了解WebAssembly汇编语言。

<!--more-->

## runtime·memclrNoHeapPointers 函数

改函数源文件在：

https://github.com/golang/go/blob/master/src/runtime/memclr_wasm.s

函数的实现如下：

```s
// func memclrNoHeapPointers(ptr unsafe.Pointer, n uintptr)
TEXT runtime·memclrNoHeapPointers(SB), NOSPLIT, $0-16
	MOVD ptr+0(FP), R0
	MOVD n+8(FP), R1

loop:
	Loop
		Get R1
		I64Eqz
		If
			RET
		End

		Get R0
		I32WrapI64
		I64Const $0
		I64Store8 $0

		Get R0
		I64Const $1
		I64Add
		Set R0

		Get R1
		I64Const $1
		I64Sub
		Set R1

		Br loop
	End
	UNDEF
```

## 函数签名

函数的签名如下：

```go
func memclrNoHeapPointers(ptr unsafe.Pointer, n uintptr)
```

对应C语言的签名如下：

```c
void memclrNoHeapPointers(int32_t ptr, int32_t n);
```

对应WebAssembly的函数签名如下：

```lisp
(func $memclrNoHeapPointers (param $ptr i32) (param $n i32)
	...
)
```

## 读取函数参数

因为Go语言是动态栈，和WebAssembly的内存模型并不一样。我们先忽略这些问题的细节，看看如何读取参数的：

```s
	MOVD ptr+0(FP), R0
	MOVD n+8(FP), R1
```

熟悉Go汇编语言的同学肯定很容易理解上述代码。其中第一行指令是将Go函数的第一个参数加载到R0寄存器，第二行指令是将第二个参数加载到R1寄存器。FP是伪寄存器，表示当前函数调用的帧寄存器，每个参数分别使用参数名作为前缀+参数相对于FP的地址偏移量确定。

不过WebAssembly是基于栈式的虚拟机结构，并不存在寄存器的概念。不过我们可以将R0和R1看作是函数的局部变量。因此在memclrNoHeapPointers函数的定义中再增加2个局部变量：

```lisp
(func $memclrNoHeapPointers (param $ptr i32) (param $n i32)
	(local i32) (local f32) ;; R0 R1 寄存器
	...
)
```

## WebAssembly汇编语言

现在将函数的主体指令改为WebAssembly汇编语言，大概是如下的写法：

```lisp
(func $memclrNoHeapPointers (param $ptr i32) (param $n i32)
	(local i32) (local f32) ;; R0 R1 寄存器

loop:
	Loop
		Get R1
		I64Eqz
		If
			RET
		End

		Get R0
		I32WrapI64
		I64Const $0
		I64Store8 $0

		Get R0
		I64Const $1
		I64Add
		Set R0

		Get R1
		I64Const $1
		I64Sub
		Set R1

		Br loop
	End
	UNDEF
)
```

具体的算法类似以下的Go语言代码：

```go
func memclrNoHeapPointers(ptr, n int32) {
	R0 := ptr
	R1 := n

	loop: for {
		if R1 == 0 {
			return
		}

		Memort[R0] = 0
		R0++
		R1--

		continue loop
	}
}
```

在循环中，第一组指令是R1表示的未清0的元素个数是否未0，如果未0则返回。对应代码如下：

```s
		Get R1
		I64Eqz
		If
			RET
		End
```

其中Get对应WebAssembly的get_local指令，用于根据局部变量的索引标号获取一个值，放到栈中。I64Eqz对应i64.eqz指令，从栈中取出一个值，判断是否为0，并将结果从新放入栈中。而If则对应br_if控制流指令，首先从栈取出一个值，如果非0则执行分支内的指令。RET返回函数，和WebAssembly的return指令不一定完全等价。

第二组指令是强R0表示的内存地址对应的空间清0：

```s
		Get R0
		I32WrapI64
		I64Const $0
		I64Store8 $0
```

Get对应get_local指令，取出一个i64类型的值。I32WrapI64对应i32.wrap/i64指令，将i64类型强制转型为i32类型，重新入栈。I64Const则是生成一个常数0，入栈。I64Store8对应i32.store8指令，从栈取出内存地址，第二个参数是0表示地址采用默认的对其方式。简而言之就是将R0对应的地址设置为0。

第三组是将R0加一后存回R0局部变量：

```s
		Get R0
		I64Const $1
		I64Add
		Set R0
```

第四组是将R1减一后存回R1局部变量：

```s
		Get R1
		I64Const $1
		I64Sub
		Set R1
```

循环内的最后一个`Br loop`指令是继续从loop标号开始的循环。

函数最后的UNDEF并不是WebAssembly汇编指令。

## 总结

因为Go语言序言支持栈的分裂，Go语言对WebAssembly的汇编语言是一个变异的版本。Go语言使用局部或者是全局变量来模拟寄存器，在函数的内部在依然基于WebAssembly栈虚拟机的方式工作。

因为WebAssembly也是刚刚支持的平台，很多技术细节还需要进一步确认。想深入了解WebAssembly汇编语言的同学，本人写的 [《Go语言高级编程》](https://github.com/chai2010/advanced-go-programming-book) 和 [《WebAssembly标准入门
》](https://github.com/chai2010/awesome-wasm-zh/blob/master/webassembly-primer.md) 中的汇编语言章节部分的内容。

