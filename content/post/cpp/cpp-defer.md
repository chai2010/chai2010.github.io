---
title: "C++版的defer语句"
date: 2013-03-27

tags: [
	"golang", "defer", "c++",
]
categories: [
	"c++",
]
---

Go语言的defer语句是汤普森大神的神来之笔, 非常适合于局部资源安全的延迟释放. 本文将探讨如何在C++语言中实现一个近似的defer特性.

<!--more-->

Go语言的defer具体用法可参考:

- [http://golang.org/doc/articles/defer_panic_recover.html](http://golang.org/doc/articles/defer_panic_recover.html)


## C++版defer

一直想在C++中也能模拟类似defer的效果, 经过无数次google和尝试之后重要找到解决方法.
整理后的代码在这里:

- [https://github.com/chai2010/defer](https://github.com/chai2010/defer)

基本的使用方法:

	FILE* fp = fopen("foo.txt", "rt");
	if(fp == NULL) return false;
	defer([&](){ printf("fclose(fp)\n"); fclose(fp); });

	char* buf = new char[1024];
	defer([&](){ printf("delete buf\n"); delete[] buf; });

	defer([](){ printf("defer a: %d\n", __LINE__); });
	defer([](){ printf("defer a: %d\n", __LINE__); });
	defer([](){ printf("defer a: %d\n", __LINE__); });

	{
		defer([](){ printf("defer b: %d\n", __LINE__); });
		defer([](){ printf("defer b: %d\n", __LINE__); });
		defer([](){ printf("defer b: %d\n", __LINE__); });
	}

	defer([](){
		printf("defer c:\n");
		for(int i = 0; i < 3; ++i) {
			defer([&](){ defer([&](){
				printf("\ti = %d: begin\n", i);
				defer([&](){ printf("\ti = %d\n", i); });
				printf("\ti = %d: end\n", i);
			});});
		}
	});

需要注意的地方:

- defer 定义的对象在超出作用域时执行闭包函数(析构函数)
- defer 定义的对象在同一个文件内部标识符不同(根据行号生成)
- defer 在全局作用域使用可能会出现重名现象(行号相同)
- defer 在判断语句使用可能提前执行(作用域结束时)
- defer 在循环语句内使用无效(作用域结束时)
- defer 和Go语言的defer并不完全等价

## 参考链接

- [http://blog.korfuri.fr/post/go-defer-in-cpp/](http://blog.korfuri.fr/post/go-defer-in-cpp/)
- [http://blog.korfuri.fr/attachments/go-defer-in-cpp/defer.hh](http://blog.korfuri.fr/attachments/go-defer-in-cpp/defer.hh)
- [http://blogs.msdn.com/b/vcblog/archive/2011/09/12/10209291.aspx](http://blogs.msdn.com/b/vcblog/archive/2011/09/12/10209291.aspx)
- [http://golang.org/doc/effective_go.html#defer](http://golang.org/doc/effective_go.html#defer)
- [http://golang.org/ref/spec#Defer_statements](http://golang.org/ref/spec#Defer_statements)
