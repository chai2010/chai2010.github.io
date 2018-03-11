---
layout: post
title: "C++去掉构造函数会怎么样?"
date: 2013-03-27 21:00:40 +0800
comments: true
categories: [C++, 构造函数]
---

其实C++的构造函数差不多是个鸡肋: 用处不多, 但是却导致了有些不方便的地方.
如果再参考Go语言的defer语句, C++的析构函数也可以算是残废品了.

构造函数可以用一个普通函数代替(当然值容器也要改变使用方式).
比如我们可以这样将C语言的FILE对象封装为类的形式(inline方式):

	// 采用C++封装C语言的FILE(inline)
	// MyFile指针运行时完全等价FILE指针
	struct MyFile {
		static MyFile* Open(const char* fname, const char* mode) {
			return (MyFile*)fopen(fname, mode);
		}
		inline void Close() {
			fclose((FILE*)this);
		}
	
		inline int Printf(const char * format, ...) {
			return fprintf((FILE*)this, format, ...);
		}
		inline int Scanf(const char * format, ...) {
			return fscanf((FILE*)this, format, ...);
		}
	
	private:
		MyFile();
		~MyFile();
	};

需要注意的是, Open返回的虽然是FILE指针, 但是被强制转换为MyFile类的this指针了.
以C语言的角度看, MyFile*和FILE*是完全等价的.

而且没有了构造函数, 也便于接口和实现的分离:

	// MyObject.h
	struct MyObject {
	
		// 构造对象
		static MyObject* New();
		// 释放对象
		virtual void Delete()=0;
		
		// funxxx
		virtual void FunXXX()=0;
	
	protected:
		MyObject(){}
		virtual ~MyObject(){}
	};
	
	// MyObject.cpp
	namespace {
	struct MyObjectImpl: public MyObject {
		// ...
	}
	}
	
	MyObject* MyObject::New() {
		return new MyObjectImpl();
	}

然后再结合前面提到的 [C++版的defer语句][1] 就可以实现类似 MutexLocker 之类的功能了.

当然, 因为C++没有GC, 复杂环境下对象的生命周期管理还是比较麻烦的.

