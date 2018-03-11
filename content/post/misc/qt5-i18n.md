---
title: "VC2010下Qt5的中文乱码问题"
date: 2013-04-04
draft: false

tags: ["qt", "i18n", misc]
categories: [misc]
---

要搞清楚这个问题，先要弄明白编码。但是编码问题实在太复杂，这里肯定讲不开。

我先找一个例子，比如："中文" 的 Unicode 码点/UTF8编码/GBK 分别是多少。

先去这个网站，输入 "中文" 查询对应的 Unicode 码点/UTF8编码：

<!--more-->

[http://www.mytju.com/classcode/tools/encode_utf8.asp](http://www.mytju.com/classcode/tools/encode_utf8.asp)


Unicode的码点分别是(十进制)：中(20013)，文(25991)。
对应的UTF8编码分别(16进制): 中(E4B8AD)，文(E69687)。

然后再去下面这个网站，输入 "中文" 查询对应的 GBK 编码：
[http://www.mytju.com/classcode/tools/encode_gb2312.asp](http://www.mytju.com/classcode/tools/encode_gb2312.asp)

GBK编码16进制(GBK内码)分别是：中(D6D0)，文(CEC4)。

现在已经知道了"中文"的UTF8和GBK编码的具体值。
我们再看看VC2010是怎么处理的。


## 1. 先看 无 BOM 的 UTF8 编码的代码 (utf8_no_bom.cpp)

	// utf8 no bom
	// 文件中包含不能在当前代码页（936）中表示的字符
	#include <stdio.h>

	int main() {
		const char* str = "中文";
		for(int i = 0; i < sizeof(str); ++i) {
			printf("0x%x ", str[i]&0xFF);
		}
		return 0;
		// Output:
		// 0xe4 0xb8 0xad 0xe6
	}

输出是：0xe4 0xb8 0xad 0xe6。
感觉好像是对的。

但是，先别急：VC编译时输出了一条警告信息：
utf8_no_bom.cpp : warning C4819: 该文件包含不能在当前代码页(936)中表示的字符。
请将该文件保存为 Unicode 格式以防止数据丢失。

潜台词就是，你这个代码有GBK不能表示的字符，请用Unicode方式保存。
VC根本就没把 代码(utf8_no_bom.cpp) 当作UTF8，VC只是把它作为GBK处理罢了。

那为什么又输出了正确的结果呢？

因为 VC 把 (utf8_no_bom.cpp) 当作 GBK，而编译时也要转换为本地编码(也是GBK)。
因此，UTF8编码的 "中文"，被VC当作编码为 "0xe4 0xb8 0xad 0xe6" 的其他中文处理了。
VC已经不知道 "0xe4 0xb8 0xad 0xe6" 是对应 "中文" 字面值了。

但是在GBK(实际是无BOM的UTF8)转GBK的过程中，发现了一些UTF8编码的字符并不是
GBK能表达的合理方式，因此就出现了那个C4819编译警告。

## 2. 再看带BOM的UTF8是怎么处理的 (utf8_with_bom.cpp)

	// utf8 with bom
	#include <stdio.h>

	int main() {
		const char* str = "中文";
		for(int i = 0; i < sizeof(str); ++i) {
			printf("0x%x ", str[i]&0xFF);
		}
		return 0;
		// Output:
		// 0xd6 0xd0 0xce 0xc4
	}

编译没有警告，但是输出有问题：0xd6 0xd0 0xce 0xc4。

源文件明明是 UTF8 编码的格式"0xe4 0xb8 0xad 0xe6"，
怎么变成了 "0xd6 0xd0 0xce 0xc4" (这个是GBK编码)？

这就是VC私下干的好事：它自作聪明的将UTF8源代码转换为GBK处理了！

VC为何要做这样蠢事？

原因是为了兼容老的VC版本。
因为以前的VC不能处理UTF8，都是用本地编码处理的。

## 3. 在看看真的GBK是怎么处理的 (gbk.cpp)

	// gbk
	#include <stdio.h>

	int main() {
		const char* str = "中文";
		for(int i = 0; i < sizeof(str); ++i) {
			printf("0x%x ", str[i]&0xFF);
		}
		return 0;
		// Output:
		// 0xd6 0xd0 0xce 0xc4
	}

没有编译错误，输出也和源代码一致："0xd6 0xd0 0xce 0xc4"。

因为源文件就是GBK，cl在编译时GBK转化为GBK，没有改变字符串。

只是，现在很多人不想用GBK了（因为只能在中国地区用，不能表示全球字符）。

----------

到这里，可以初步小结一下：

1. VC编辑器和VC编译器是2个概念，VC编辑器支持UTF8并不能表示VC编译器也支持UTF8
2. VC编辑器从2008?开始支持带BOM的UTF8(不带BOM的暂时没戏，因为会本地编码冲突)
3. VC编译器从2010开始重要可以支持UTF8了(虽然支持方式很不优雅)

----------

## 4. 看看VC2010是怎么处理带BOM的UTF8的 (utf8_with_bom_2010.cpp)

VC2010重要增加了UTF8的编译支持(`#pragma execution_character_set("utf-8")`),
具体查看:

[http://social.msdn.microsoft.com/Forums/en-US/vcgeneral/thread/2f328917-4e99-40be-adfa-35cc17c9cdec](http://social.msdn.microsoft.com/Forums/en-US/vcgeneral/thread/2f328917-4e99-40be-adfa-35cc17c9cdec)

	// utf8 with bom (VC2010), 这句是重点！
	#pragma execution_character_set("utf-8")

	#include <stdio.h>

	int main() {
		const char* str = "中文";
		for(int i = 0; i < sizeof(str); ++i) {
			printf("0x%x ", str[i]&0xFF);
		}
		return 0;
		// Output:
		// 0xe4 0xb8 0xad 0xe6
	}

没有编译错误，输出也和源代码一致："0xe4 0xb8 0xad 0xe6"。

UTF8编码，UTF8输出。完美!

----------

# 回到 Qt5 的中文输出问题。

Qt默认支持 VS2010/MinGW/Gcc 等编译器，而它们现在都已经真正支持UTF8了。

当然，VS2010 对UTF8的支持会入侵代码(`#pragma execution_character_set("utf-8")`)。

看看Qt官方论坛别人是怎么说的：
[http://qt-project.org/forums/viewthread/17617](http://qt-project.org/forums/viewthread/17617)

> Nothing special need to do, it will works by default.
> If the exec-charset of your your compiler is UTF-8.

简单的说，从Qt5开始，源代码就是默认UTF8编码的。

当然，VC2010编辑器对带BOM的UTF8也是认识，只可惜VC2010编译器根本承认它是UTF8！

在继续看官方论坛的回复：

> You can write a simple example like this
>
> 		#include <QApplication>
> 		#include <QLabel>
>
> 		#if _MSC_VER >= 1600
> 		#pragma execution_character_set("utf-8")
> 		#endif
>
> 		int main(int argc, char *argv[])
> 		{
> 		    QApplication a(argc, argv);
> 		    QLabel label("ąśćółęńżź");
> 		    label.show();
>
> 		    return a.exec();
> 		}
>
> If other people can reproduce your problem, you can file a bug.

教完整的解决方案(增加了Qt4/Qt5和非VC环境的判断):

	// Coding: UTF-8(BOM)
	#if defined(_MSC_VER) && (_MSC_VER >= 1600)
	# pragma execution_character_set("utf-8")
	#endif

	#include <QApplication>
	#include <QTextCodec>
	#include <QLabel>

	int main(int argc, char* argv[])
	{
		QApplication app(argc, argv);

	#if QT_VERSION < QT_VERSION_CHECK(5,0,0)
	#if defined(_MSC_VER) && (_MSC_VER < 1600)
		QTextCodec::setCodecForTr(QTextCodec::codecForName("GB18030-0"));
	#else
		QTextCodec::setCodecForTr(QTextCodec::codecForName("UTF-8"));
	#endif
	#endif

		QLabel *label = new QLabel(QObject::tr("你好！"));
		label->show();

		return app.exec();
	}

有以下几种类型(源代码必须是带BOM的UTF8):

- Qt5+/VC2010+: 包含了 `# pragma execution_character_set("utf-8")` 已经支持中文
- Qt5/VC2008-: 这个暂时误解(我还没找到方法)
- Qt4+/VC2008-: 采用以前老的方式, 指定代码为 "GB18030-0" 编码
- Qt4/Qt5/Linux: 只要是默认的UTF8环境, 应该都没问题

其实这个问题不是Qt特有的, 追根溯源还是C/C++和编译器的问题.

即使是支持UTF16的Java也同样难逃此问题.

不过还好, [Go语言](http://golang.org) 算是彻底了解决了这个问题.
以后转向 [Go语言](http://golang.org) 了 !
