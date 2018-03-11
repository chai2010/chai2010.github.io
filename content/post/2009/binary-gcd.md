---
title: "二进制的GCD算法"
date: 2009-12-05

tags: [算法]
categories: [算法]
---

GCD的几个性质(针对二进制数):

1. 如果a,b都是偶数, 则gcd(a, b) = gcd(a/2, b/2)
2. 如果a是奇数, b是偶数,  则gcd(a, b) =  gcd(a, b/2)
3. 如果a,b都是奇数, 则gcd(a, b) = gcd((a-b)/2, b)

基于上述性质实现的二进制GCD算法:

	unsigned binary_gcd(unsigned x, unsigned y)
	{
		// 记录2的幂数
		unsigned k = 0;

		// 处理特殊的情况

		if(x == 0) return y;
		if(y == 0) return x;

		// xy都是偶数, 则根据性质1
		while(((x&brvbary)&1) == 0)
		{
			x  >>= 1;  y >>= 1; k++;
		}

		// xy中只有一个是偶数, 根据性质2
		while((x&1) == 0) x >>= 1;

		// xy都是奇数, 根据性质3
		while(y)
		{
			while((y&1) == 0) y >>= 1;

			unsigned t = y;
			y = (x>y)? x-y: y-x;
			x = t;
		}

		// 根据性质1
		return (x<<k);
	}

这个算法比Euclid算法更复杂，但可能更快。
因为一些C语言实现求余运算的速度比较慢，
特别是对无符号的操作数。

该算法的时间复杂度为`O(lg(max(a,b)))`.
