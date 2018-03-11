---
title: "Go和C如何共享内存资源"
date: 2013-10-13
draft: false

tags: ["golang"]
categories: ["golang"]
---

Go语言作为一个现代化的编程语言以及支持垃圾内存的自动回收特性(GC).
我们现在关注的是C语言返回的内存资源的自动回收技术.


## CGO初步

Go语言的cgo技术允许在Go代码中方便的使用C语言代码. 基本的用法如下:

	package rand

	/*
	#include <stdlib.h>
	*/
	import "C"

	func Random() int {
	    return int(C.random())
	}

	func Seed(i int) {
	    C.srandom(C.uint(i))
	}

其中`"C"`是导入一个虚拟的包, 用于引用C语言的符号.

Go语言和C语言通讯交互主要是通过传递参数和返回值. 其中参数和返回值除了基本的
数据类型外, 最重要的是如何相互**传递/共享**二进制的内存块.

## Go向C语言传递内存块

这个最简单, 有很多现成的例子:

	package print

	// #include <stdio.h>
	// #include <stdlib.h>
	import "C"
	import "unsafe"

	func Print(s string) {
	    cs := C.CString(s)
	    C.fputs(cs, (*C.FILE)(C.stdout))
	    C.free(unsafe.Pointer(cs))
	}

因为C语言的字符串结尾有`\0`, Go语言字符串没有`\0`, 因此需要重新构造一个C字符串.
其中 `C.CString(s)` 是构造一个C的字符串, 然后复制字符串并传入 `C.fputs`.
用完之后不要忘记调用`C.free`释放新创建的C字符串(可以用`defer`释放).

如果是普通的内存块, 可以直接传递给C函数:

	package main

	// #include <stdlib.h>
	import "C"
	import "unsafe"

	func Copy(dst, src []byte, size int) {
	    C.memcpy(unsafe.Pointer(&dst[0]), unsafe.Pointer(&src[0]), C.size_t(size)
	}

这个代码并没有涉及内存的创建/复制/删除等额外的操作, 是比较理想的集成方式.

**注意:** 在C语言使用该资源期间要防止Go语言的GC提前释放被C语言使用的Go内存!

## C向Go语言返回内存块

如果是C语言向Go返回内存块, 一般是先创建一个对应的Go的切片. 有现成的函数`C.GoBytes()`可以基于C的内存块构造切片.

比如获取C返回的内存块数据:

	package main

	// #include <stdlib.h>
	import "C"
	import "unsafe"

	func GetData() []byte {
		p := C.malloc(1024)
		defer C.free(p)
		return C.GoBytes(p, 1024)
	}

代码并不复杂. 但是效率并不理想: 其中需要新创建一个Go的切片, 并进行一次冗余的复制操作.

如果想去掉冗余的复制操作, 就需要基于C的内存块构造切片. 这个需要依赖Go语言的反射技术.

	package main

	// #include <stdlib.h>
	import "C"
	import "unsafe"
	import "reflect"

	func GetData() []byte {
		p := C.malloc(1024)
		var s []byte
		h := (*reflect.SliceHeader)((unsafe.Pointer(&s)))
		h.Cap = 1024
		h.Len = 1024
		h.Data = uintptr(p)
		return s
	}

返回的`s`是基于C语言内存块构造的切片. 没有冗余的内存复制操作.

但是, 上面的代码却有内存泄漏的问题. Go语言的GC并不会自动释放`C.malloc`释放的内存.

如果需要Go语言的GC自动管理C语言返回的内存, 需要基于之前讲过的 "[Go语言资源自动回收技术[OSC源创会主题补充3]](http://my.oschina.net/chai2010/blog/161797)" .

简而言之, 就是要将C语言的内存块绑定到一个Go语言的内存资源, 然后依靠`runtime.SetFinalizer`的技术管理C语言的内存块.

核心代码如下:

	type Slice struct {
		Data []byte
		data *c_slice_t
	}

	type c_slice_t struct {
		p unsafe.Pointer
		n int
	}

	func newSlice(p unsafe.Pointer, n int) *Slice {
		data := &c_slice_t{p, n}
		runtime.SetFinalizer(data, func(data *c_slice_t) {
			C.free(data.p)
		})
		s := &Slice{data: data}
		h := (*reflect.SliceHeader)((unsafe.Pointer(&s.Data)))
		h.Cap = n
		h.Len = n
		h.Data = uintptr(p)
		return s
	}

其中 `newSlice` 基于C语言的内存块构造 `Slice` 结构体.
如果 `Slice.data` 资源没有被引用, 则会自动触发C语言的内存释放函数.

## 完整的测试代码

	package main

	/*
	#include <stdio.h>
	#include <stdlib.h>

	void print(char* s) {
		printf("print: %s\n", s);
	}
	*/
	import "C"
	import (
		"fmt"
		"reflect"
		"runtime"
		"time"
		"unsafe"
	)

	type Slice struct {
		Data []byte
		data *c_slice_t
	}

	type c_slice_t struct {
		p unsafe.Pointer
		n int
	}

	func newSlice(p unsafe.Pointer, n int) *Slice {
		data := &c_slice_t{p, n}
		runtime.SetFinalizer(data, func(data *c_slice_t) {
			println("gc:", data.p)
			C.free(data.p)
		})
		s := &Slice{data: data}
		h := (*reflect.SliceHeader)((unsafe.Pointer(&s.Data)))
		h.Cap = n
		h.Len = n
		h.Data = uintptr(p)
		return s
	}

	func testSlice() {
		msg := "hello world!"
		p := C.calloc((C.size_t)(len(msg) + 1), 1)
		println("malloc:", p)

		s := newSlice(p, len(msg)+1)
		copy(s.Data, []byte(msg))

		fmt.Printf("fmt.Printf: %s\n", string(s.Data))
		C.print((*C.char)(p))
	}

	func main() {
		testSlice()

		runtime.GC()
		runtime.Gosched()
		time.Sleep(1e9)
	}

测试程序的输出:

	D:>go run hello.go
	malloc: 0x6f7f50
	fmt.Printf: hello world!
	print: hello world!
	gc: 0x6f7f50

*注: Go1.3之前有效, Go1.4之后改了移动栈.*
