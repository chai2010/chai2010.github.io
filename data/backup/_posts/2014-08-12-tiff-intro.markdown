---
layout: post
title: "TIFF6.0格式简介"
date: 2013-09-02 11:25:43 +0800
comments: true
categories: [图像]
---

标签图像文件格式(Tagged Image File Format, 简写为TIFF)是一种主要用来存储包括照片和艺术图在内的图像的文件格式. 它最初由Aldus公司与微软公司一起为PostScript打印开发.

TIFF最初的设计目的是为了1980年代中期桌面扫描仪厂商达成一个公用的扫描图像文件格式, 而不是每个厂商使用自己专有的格式. 在刚开始的时候, TIFF只是一个二值图像格式, 因为当时的桌面扫描仪只能处理这种格式. 随着扫描仪的功能愈来愈强大, 并且桌面计算机的磁盘空间越来越大, TIFF逐渐支持灰阶图像和彩色图像.

目前最新的 [TIFF6.0规范](http://partners.adobe.com/public/developer/en/tiff/TIFF6.pdf) 在1992年公布.

## 结构概述

TIFF文件以`.tif`或`.tiff`为扩展名. 其数据格式是一种3级体系结构, 从高到低依次为: 文件头IFH(Image File Header), 一个或多个称为IFD(Image File Directory)的包含标记指针的目录和数据. 一个文件中可以包含多个IFD, 每个IFD对应一个图像.

图像头(IFH)/图像目录(IFD)/标签入口(IFDEntry)的逻辑结构如下:

	+------------------------------------------------------------------------------+
	|                           TIFF Structure                                     |
	|  IFH                                                                         |
	| +------------------+                                                         |
	| | II/MM            |                                                         |
	| +------------------+                                                         |
	| | 42               |      IFD                                                |
	| +------------------+    +------------------+                                 |
	| | Next IFD Address |--->| IFD Entry Num    |                                 |
	| +------------------+    +------------------+                                 |
	|                         | IFD Entry 1      |                                 |
	|                         +------------------+                                 |
	|                         | IFD Entry 2      |                                 |
	|                         +------------------+                                 |
	|                         |                  |      IFD                        |
	|                         +------------------+    +------------------+         |
	|     IFD Entry           | Next IFD Address |--->| IFD Entry Num    |         |
	|    +---------+           +------------------+   +------------------+         |
	|    | Tag     |                                  | IFD Entry 1      |         |
	|    +---------+                                  +------------------+         |
	|    | Type    |                                  | IFD Entry 2      |         |
	|    +---------+                                  +------------------+         |
	|    | Count   |                                  |                  |         |
	|    +---------+                                  +------------------+         |
	|    | Offset  |--->Value                         | Next IFD Address |--->NULL |
	|    +---------+                                  +------------------+         |
	|                                                                              |
	+------------------------------------------------------------------------------+

其中, TIFF中的版本号为42, 包含生命宇宙以及任何事情的终极答案(这也说明了TIFF格式为何这么强大).
文件中的数据指针(offset)最大对应4个字节, 因此一个文件不能超过4GB.
如果需要大于4GB的图像支持, 可以参考基于TIFF的变种格式 [BigTiff](http://www.awaresystems.be/imaging/tiff/bigtiff.html).

## 图像基本信息

基本信息为图像的大小, 图像的颜色模型(黑白图像/灰度图像/调色板图像/真彩色 等),
每个像素的大小和单位等信息.

每个图像必须包含的标签有(含压缩类型):

	ImageWidth 256 SHORT or LONG
	ImageLength 257 SHORT or LONG
	XResolution 282 RATIONAL
	YResolution 283 RATIONAL
	ResolutionUnit 128 SHORT 1, 2 or 3
	Compression 259 SHORT 1, 2 or 32773

其中颜色模型由几个标签组合判断:

	PhotometricInterpretation 262 106 SHORT 0/1/2/3
	BitsPerSample 258 SHORT 4 or 8
	SamplesPerPixel 277 SHORT default(1)
	ColorMap 320 SHORT 3 * (2**BitsPerSample)

## 色彩模型

TIFF基础部分定义了4种色彩模型(这里不讨论掩码图像和扩展色彩模型),
主要有: 二值图像, 灰度图像, 调色板图像, 真彩色图像.

### 二值图像

1. 如果没有 BitsPerSample 则为二值图
2. 颜色模型 PhotometricInterpretation 必须为 0(0为白色) 或 1(1为白色)
3. 压缩类型 Compression 1, 2 or 32773, 支持 Huffman 编码

### 灰度图像

1. 有 BitsPerSample, 且 PhotometricInterpretation 为 0 或 1
2. 压缩类型 Compression 1 or 32773, 不支持 Huffman 编码

### 调色板图像

1. PhotometricInterpretation 为 3
2. 必需包含 ColorMap
3. BitsPerSample 为 4 或 8
4. Compression 为 1 or 32773, 不支持 Huffman 编码

### 真彩色图像

1. PhotometricInterpretation 为 2
2. 必须含 SamplesPerPixel 波段数信息, 值为 3
3. BitsPerSample 必须为 8,8,8
4. Compression 为 1 or 32773, 不支持 Huffman 编码

### 其他模型

TIFF 的扩展特性中还包含 CMYK 和 YCbCr 等其他色彩模型.
详细信息请参考TIFF6.0规范.

## 条带和分片

其中数据的组织方式有条带和分片两种, 默认为条带方式存储.

条带图像必要的标签有:

	RowsPerStrip 278 SHORT or LONG
	StripOffsets 273 SHORT or LONG
	StripByteCounts 279 SHORT or LONG

其中 `RowsPerStrip` 缺省值为 `2^32-1`, 图像将只有1个条带.
如果条带数据不足的话, 末尾并不需要数据填充.

分片图像必要的标签有:

	TileWidth 322 SHORT or LONG
	TileLength 323 SHORT or LONG
	TileOffsets 324 SHORT or LONG
	TileByteCounts 325 SHORT or LONG

每个片的大小必须是16的倍数, 每个片的长和宽可以不同.
如果片数据不足的话, 需要填充(填充数据没有要求).


## 位平面

位平面由 `PlanarConfiguration` 标签确定, 缺省时为1表示按像素组织(比如RGBRGB).
当 `PlanarConfiguration` 为2时, 为按通道存储(比如RRGGBB).

当只有1个通道时(`SamplesPerPixel`), 位平面信息可以忽略.


## 压缩方式

压缩方式由 `Compression` 标签确定.

基本算法:

	1 = No compression
	2 = CCITT modified Huffman RLE
	32773 = PackBits compression, aka Macintosh RLE

扩展特性:

	3 = CCITT Group 3 fax encoding
	4 = CCITT Group 4 fax encoding
	5 = LZW
	6 = JPEG ('old-style' JPEG, later overriden in Technote2)
	7 = JPEG ('new-style' JPEG)
	8 = Deflate ('Adobe-style')


## 常见标签

	ImageDescription 270 ASCII

	CellLength 265 SHORT
	CellWidth 264 SHORT

	Software 305 ASCII
	DateTime 306 ASCII
	Artist 315 ASCII
	HostComputer 316 ASCII

	Copyright 33432 ASCII


## 空闲空间

当创建或更新TIFF文件时, 文件中会有一些空闲的空间(类似malloc/free导致的内存碎片).
TIFF规范中有 `FreeByteCounts` 和 `FreeOffsets` 两个标签用于记录文件中的空闲空间.

但是由于不同标签之间的弱引用关系, `FreeByteCounts` 和 `FreeOffsets` 记录的信息
可能并不可靠. 因此, 并不能完全依赖这个信息.


## 忽略特性

- 文件中含多个图像(多IFD)
- 扩展的压缩算法
- 扩展的色彩模型
- 多通道数大于4


## 文件实例

这是一个二值图像的片段(来自TIFF6.0规范文档):

	Header:
	0000 Byte Order                  4D4D
	0002 42                          002A
	0004 1st IFD offset              00000014

	IFD:
	0014 Number of Directory Entries 000C
	0016 NewSubfileType              00FE 0004 00000001 00000000
	0022 ImageWidth                  0100 0004 00000001 000007D0
	002E ImageLength                 0101 0004 00000001 00000BB8
	003A Compression                 0103 0003 00000001 8005 0000
	0046 PhotometricInterpretation   0106 0003 00000001 0001 0000
	0052 StripOffsets                0111 0004 000000BC 000000B6
	005E RowsPerStrip                0116 0004 00000001 00000010
	006A StripByteCounts             0117 0003 000000BC 000003A6
	0076 XResolution                 011A 0005 00000001 00000696
	0082 YResolution                 011B 0005 00000001 0000069E
	008E Software                    0131 0002 0000000E 000006A6
	009A DateTime                    0132 0002 00000014 000006B6
	00A6 Next IFD offset             00000000

	Values longer than 4 bytes:
	00B6 StripOffsets                Offset0, Offset1, ... Offset187
	03A6 StripByteCounts             Count0, Count1, ... Count187
	0696 XResolution                 0000012C 00000001
	069E YResolution                 0000012C 00000001
	06A6 Software                    “PageMaker 4.0”
	06B6 DateTime                    “1988:02:18 13:59:59”

	Image Data:
	00000700                         Compressed data for strip 10
	xxxxxxxx                         Compressed data for strip 179
	xxxxxxxx                         Compressed data for strip 53
	xxxxxxxx                         Compressed data for strip 160


## 参考信息

- [http://partners.adobe.com/public/developer/en/tiff/TIFF6.pdf](http://partners.adobe.com/public/developer/en/tiff/TIFF6.pdf)
- [http://www.awaresystems.be/imaging/tiff.html](http://www.awaresystems.be/imaging/tiff.html)
- [http://www.libtiff.org/tools.html](http://www.libtiff.org/tools.html)

