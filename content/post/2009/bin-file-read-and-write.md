---
title: "关于二进制格式数据读写"
date: 2009-12-05

tags: []
categories: []
---

在实际工作中经常会需要处理一些格式的数据。
而许多数据为了压缩空间通常会把多个信息放到一个字节中。

例如LIDAR激光雷达数据标准格式为LAS数据。
LAS数据在定义点的时候将点的回波编号和回波次数以及扫描方向等信息
全部放在一个字节中：

	=====================================================
	X                    long                   4 bytes
	y                    long                   4 bytes
	z                    long                   4 bytes
	Intensity            unsigned short         2 bytes
	Return Number        3 bits (bits 0, 1, 2)  3 bits
	Number of Returns    3 bits (bits 3, 4, 5)  3 bits
	Scan Direction Flag  1 bit (bit 6)          1 bits
	Edge of Flight Line  1 bit (bit 7)          1 bits
	Classification       unsigned char          1 byte
	=====================================================

开发人员在处理这类数据的时候一般会定义如下结构：

	struct Point
	{
		long x, y, z;
		unsigned short intensity;
		unsigned rerutn_number : 3;
		unsigned number_of_returns : 3;
		unsigned scan_direction_flag : 1;
		unsigned edge_of_flight_line :1;
	};

读写点的时候可能是用下面类似的语句：

	bool readPoint(FILE *fp, Point *p)
	{
		return fread(p, sizeof(*p), 1, fp) == 1;
	}
	bool writePoint(FILE *fp, Point *p)
	{
		return fwrite(p, sizeof(*p), 1, fp) == 1;
	}

这样的方法看起来很老到，但是却隐藏许多陷阱！！

**1. 位字段不可移植！！**

为了知道位字段的实际布局需要知道计算机在存储位字段时是从左向右还是从右向左，
即是使用 **高位存储法** 还是 **低位存储法**。如果位字段从左向右存储，则

	struct Point
	{
		unsigned rerutn_number : 3;
		unsigned number_of_returns : 3;
		unsigned scan_direction_flag : 1;
		unsigned edge_of_flight_line :1;
	};

和数据定义的布局一致。

在实际的处理器中Motolora一般为高位存储，而Inter一般为低为存储。
换言之，这个结构在Motolora的机器上是可以正常运行，在Inter机器
则可能完全错误。

**2. sizeof(*p)大小可能会因编译器不同而不同**

C语言中`sizeof(*p)`一般可以计算`(*p)`数据类型对应的内存大小。但是令人失望的是
这个大小是不确定的！因为编译器可能为了对齐结构中的各个成员地址到2^n位置，
从而对其进行扩充。因此`sizeof(*p)`实际计算得到的地址可能比预想的要大。

这样在 `fread(p, sizeof(*p), 1, fp)` 读数据的时候就很可能多读了数据！！


为了能正确处理数据，我们需要回避上面提到的2个问题。

**1. 我们先处理sizeof(*p)的大小扩充问题**

由于在写程序的时候不能假设编译器是否会对结构进行优化，因为我们就做最坏的
打算：即假设结构的大小是被扩充的。这个时候我们可以采用逐个读取结构体成员的
方法来回避：

	bool readPoint(File *fp, Point *p)
	{
		if(fread(&(p->x), sizeof(long), 1, fp) != 1) return false;
		if(fread(&(p->y), sizeof(long), 1, fp) != 1) return false;
		if(fread(&(p->z), sizeof(long), 1, fp) != 1) return false;
		...
	}

这样即使结构体被扩充了，也不会多读去数据。虽然看似麻烦了一点，但却是正确的方案
。

**2. 位字段的顺序问题**

由于位字段的顺序是不确定的，因此我们假设两种情况都有可能出现。但是C语言中的
位运算对字节顺序不敏感，即使字节顺序不相同位运算的结构也是一致的。而位运算
也可以很容易模拟实现位字段。因此可移植的解决方法是用位运算，而不要用位字段
（位字段不可移植）。

对应的位字段读代码如下：

	bool readPoint(File *fp, Point *p)
	{
		...

		char byte;
		if(fread(&byte, sizeof(char), 1, fp) != 1) return false;

		p->rerutn_number = byte&7; byte >>= 3;
		p->number_of_returns = byte&7; byte >>= 3;
		p->scan_direction_flag = byte&1; byte >>= 1;
		p->edge_of_flight_line = byte&1;

		return true;
	}

这样，我们就以一种完全可移植的、不依赖于编译器、不依赖处理器字节顺序的方式
解决了数据读写问题。

