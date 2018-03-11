---
layout: post
title: "解浮点数方程: X+1=X"
date: 2011-12-08 09:59:32 +0800
comments: true
categories: [浮点数]
---

不是纯数学意义上的方程, 对应计算机的一个浮点数问题:

	if((float)(x+1.0) == (float)(x)) { x = ? }

简单分析, ieee754中float采用23bit表示有效位, 再加省略的1, 共有24bit.
当结果超出24bit时, 小数部分被被丢失.

大于 `2^24 = 16777216` 的x, 满足 `x+1.0==x`.

测试程序:

	#include <stdio.h>
	
	// Little endian
	union ieee754_float {
		float f;
		
		/* This is the IEEE 754 single-precision format.  */
		struct {
			unsigned int mantissa:23;
			unsigned int exponent:8;
			unsigned int negative:1;
		} ieee;
		
		/* This format makes it easier to see if a NaN is a signalling NaN.  */
		struct {
			unsigned int mantissa:22;
			unsigned int quiet_nan:1;
			unsigned int exponent:8;
			unsigned int negative:1;
		} ieee_nan;
	};
	
	int main()
	{
		union ieee754_float f = { 0.0f };
		
		// Find a positive floating point value x, for which x+1.0=x.
		for(f.ieee.exponent = 127; f.ieee.exponent < 255; f.ieee.exponent++) {
			if((float)(f.f + 1.f) == f.f) {
				printf("%f: exponent = %d\n", f.f, f.ieee.exponent);
			}
		}
		return 0;
	}
	
	// output:
	// 16777216.000000: exponent = 151
	// 33554432.000000: exponent = 152
	// 67108864.000000: exponent = 153
	// 134217728.000000: exponent = 154
	//
	// ... ...
	//
	// 21267647932558654000000000000000000000.000000: exponent = 251
	// 42535295865117308000000000000000000000.000000: exponent = 252
	// 85070591730234616000000000000000000000.000000: exponent = 253
	// 170141183460469230000000000000000000000.000000: exponent = 254

IEEE754相关资源:

- http://en.wikipedia.org/wiki/IEEE_754-2008
- http://en.wikipedia.org/wiki/Single_precision
- http://www.h-schmidt.net/FloatApplet/IEEE754.html
- http://babbage.cs.qc.edu/IEEE-754/
- http://www.scs.stanford.edu/histar/src/pkg/uclibc/include/ieee754.h

