---
title: "Go语言如何深度拷贝对象"
date: 2013-12-11
draft: false

tags: ["golang"]
categories: ["golang"]
---

深度复制可以基于`reflect`包的反射机制完成, 但是全部重头手写的话会很繁琐.

最简单的方式是基于序列化和反序列化来实现对象的深度复制:

	func deepCopy(dst, src interface{}) error {
		var buf bytes.Buffer
		if err := gob.NewEncoder(&buf).Encode(src); err != nil {
			return err
		}
		return gob.NewDecoder(bytes.NewBuffer(buf.Bytes())).Decode(dst)
	}

Gob和bytes.Buffer简单组合就搞定了. 当然, Gob的底层也是基于`reflect`包完成的.
