---
layout: post
title: "ASCII码中大小写字母转换"
date: 2013-05-06 12:16:21 +0800
comments: true
categories: [杂项]
---

ASCII中消息字母比大写字母大32, 比如: 'a'对应97, 'A'对应65(97-32=65).

ASCII中大小写字母都是排列有序的, 一般在转换大小写字母时都会基于这个特性.

下边是<ctypes.h>中转换函数的一种实现:

	int tolower(int c) {return ( c -'A'+'a');}
	int toupper(int c) {return ( c -'a'+'A');}

其实`'a'-'A'`对应的32刚好是2的幂, 二进制表示为: `00010 0000`.
ASCII中大小写字母转换只是将32的二进制中唯一的bit为1的数置0或置1.
置0对应减32转换为大写字母, 置1对应加32转换为小写字母.

我们可以用位运算重新实现上面的函数:

	int tolower(int c) {return (c ^ 32);}
	int toupper(int c) {return (c ^ 32);}

继续观察可以发现32刚好对应ASCII中的空格`' '`, 因此代码调整为:

	int tolower(int c) {return (c ^ ' ');}
	int toupper(int c) {return (c ^ ' ');}

在转换单个字母时这样就可以了: `c ^= ' '`.

