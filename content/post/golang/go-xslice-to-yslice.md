---
title: "Go语言中不同类型切片之间的相互转换"
date: 2014-05-20
draft: false

tags: ["golang"]
categories: ["golang"]
---

# 将 `[]T` 切片转换为 `[]byte`

类似C语言中将其他类型的数组转换为`char`数组：

	func ByteSlice(slice interface{}) (data []byte) {
		sv := reflect.ValueOf(slice)
		if sv.Kind() != reflect.Slice {
			panic(fmt.Sprintf("ByteSlice called with non-slice value of type %T", slice))
		}
		h := (*reflect.SliceHeader)((unsafe.Pointer(&data)))
		h.Cap = sv.Cap() * int(sv.Type().Elem().Size())
		h.Len = sv.Len() * int(sv.Type().Elem().Size())
		h.Data = sv.Pointer()
		return
	}

基于该函数，我们可以方便调用 `[]byte` 类型参数的函数：

	func SaveImageData(name string, data []color.RGBA) error {
		return ioutil.WriteFile(name, ByteSlice(data), 0666)
	}

# 将 `[]X` 转换为 `[]Y` 切片

类似C语言中将不同类型的数组转之间的相互转换：

	func Slice(slice interface{}, newSliceType reflect.Type) interface{} {
		sv := reflect.ValueOf(slice)
		if sv.Kind() != reflect.Slice {
			panic(fmt.Sprintf("Slice called with non-slice value of type %T", slice))
		}
		if newSliceType.Kind() != reflect.Slice {
			panic(fmt.Sprintf("Slice called with non-slice type of type %T", newSliceType))
		}
		newSlice := reflect.New(newSliceType)
		hdr := (*reflect.SliceHeader)(unsafe.Pointer(newSlice.Pointer()))
		hdr.Cap = sv.Cap() * int(sv.Type().Elem().Size()) / int(newSliceType.Elem().Size())
		hdr.Len = sv.Len() * int(sv.Type().Elem().Size()) / int(newSliceType.Elem().Size())
		hdr.Data = uintptr(sv.Pointer())
		return newSlice.Elem().Interface()
	}

转换时需要传入一个期望的目标切片类型，以 `interface{}` 形式返回转换后的切片。

比如，在图像处理中，转换 RGB 格式为 BGR 格式：

	type RGB struct {
		R, G, B uint8
	}
	type BGR struct {
		B, G, R uint8
	}

	func RGB2BGR(data []RGB) []BGR {
		d := Slice(data, reflect.TypeOf([]BGR(nil)))
		return d.([]BGR)
	}

类似于C语言中，将`RGB`指针转换为`BGR`指针的思路。 数据的底层结构并没有变化。

# 注意事项

该转换操作有一定的风险，用户需要自己保证安全。主要涉及以下几种类型：

- 当结构体中含有指针时，转换会导致垃圾回收的问题。
- 如果是 `[]byte` 转 `[]T` 可能会导致起始地址未对齐的问题 （`[]byte` 有可能从奇数位置切片）。
- 该转换操作可能依赖当前系统，不同类型的处理器之间有差异。

该转换操作的优势是性能和类似`void*`的泛型，与`cgo`接口配合使用会更加理想。
