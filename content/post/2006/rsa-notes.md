---
title: "RSA学习笔记"
date: 2006-12-27

tags: [算法, 加密, RSA]
categories: [算法]
---

先贴学习RSA时的练习代码(uint32范围):

	// RSA加密系统:
	// 1. 随机选取2个大的素数p和q
	// 2. 根据n=p*q式计算出n的值
	// 3. 选取一个与f(n)互素的小奇数e. 其中f(n)为欧拉装载函数, 值为(p-1)(q-1)
	// 4. 对于模f(n), 计算e的乘法逆元d
	// 5. 公开对P=(e,n), 并把它作为RSA公开秘钥
	// 6. 把对S=(d,n)进行保密, 并把它作为RSA的机密秘钥

	// 加密过程: C = (M^e)%n
	// 解秘过程: M = (C^d)%n

	#include <stdio.h>
	#include <assert.h>
	#include <stdlib.h>
	#include <time.h>

	// 返回一个位于low和high之间的随机数
	#define ran(low,high) ((rand()%((high)-(low)+1))+(low))

	// 计算数组的元素个数
	#define NELEMS(x) ((sizeof(x)) / (sizeof((x)[0])))

	// 构造素数序列primes[]
	void makePrimes(int primes[], int num)
	{
		primes[0] = 2;

		for(int p = 3, cnt = 1; cnt < num; p += 2)
		{
			for(int k = 0; ; ++k)
			{
				// 可以在div时得到余数
				div_t dt = div(p, primes[k]);

				if(dt.rem == 0) break;
				if(dt.quot <= primes[k]) { primes[cnt++] = p; break; }
			}
		}
	}

	// 返回2个随机素数, 在10000~40000之间
	void rand_pq(int& p, int& q)
	{
		// [2, 2^16]范围内有6542个素数
		static int primes[1024*8];
		static int low, high;

		// 初始化(只处理一次)
		if(low == 0 && high == 0)
		{
			// 生成素数序列
			makePrimes(primes, NELEMS(primes));

			// 计算10000和40000附近的素数下标
			for(int i = 0; i < NELEMS(primes); ++i)
			{
				if(!low && primes[i] > 10000) { low = i; continue; }
				if(!high && primes[i] > 40000) { high = i; break; }
			}

			// 设置随机数种子
			srand(time(NULL));
		}

		// 在low, high之间返回2个不同的随机数
		int r1 = ran(low,high);
		int r2 = ran(low,high);

		// r1和r2不能相等
		while(r2 == r1) r2 = ran(low,high);

		// 返回r1,r2位置对应的素数
		p = primes[r1];
		q = primes[r2];
	}

	// 扩展的欧几里得算法
	int xgcd(int a, int b, int& x, int& y)
	{
		if(b == 0) { x = 1, y = 0; return a; }

		int d = xgcd(b, a%b, x, y);
		int t = x-(a/b)*y; x = y; y = t;

		return d;
	}

	// 针对(p-1)(q-1)产生e和d
	void rand_ed(int p, int q, int& e, int &d)
	{
		int n = (p-1)*(q-1);
		int x, y;

		// 选择一个小的互素奇数e
		for(e = 37; ; e += 2)
		{
			if(xgcd(e, n, x, y) == 1) break;
		}

		// 将d转换到[0, n-1]之间
		while(x > 0) x -= n;
		while(x < 0) x += n;

		d = x;
	}

	// 计算(u*v)%m
	unsigned mul_mod(unsigned u, unsigned v, unsigned z)
	{
		// 如果u*v没有溢出, 则直接计算
		if((u*v)/u == v) return (u*v)%z;

		// 进行长乘法(结果为64位)
		unsigned u0, v0, w0;
		unsigned u1, v1, w1, w2, t;

		u0 = u & 0xFFFF;  u1 = u >> 16;
		v0 = v & 0xFFFF;  v1 = v >> 16;
		w0 = u0*v0;
		t  = u1*v0 + (w0 >> 16);
		w1 = t & 0xFFFF;
		w2 = t >> 16;
		w1 = u0*v1 + w1;

		// x为高32位, y为低32位
		unsigned x = u1*v1 + w2 + (w1 >> 16);
		unsigned y = u*v;

		// 进行长除法(被除数为64位)
		for (int i = 1; i <= 32; i++)
		{
			t = (int)x >> 31;           // All 1's if x(31) = 1.

			x = (x << 1) | (y >> 31);   // Shift x || y left
			y <<= 1;                    // one bit.

			if((x|t) >= z) { x -= z; y++; }
		}

		return x; // y为商, x为余数
	}

	// 计算(a^p)%n
	unsigned pow_mod(unsigned a, unsigned p, unsigned n)
	{
		unsigned k = 1;

		// 反复平方法
		while(p > 1)
		{
			if(p&1) k = mul_mod(k, a, n);
			a = mul_mod(a, a, n); p >>= 1;
		}

		return mul_mod(k, a, n);
	}

	// 产生RSA需要的所有参数
	void rsa_rand(int& e, int& d, int& n)
	{
		int p, q;

		rand_pq(p, q);
		rand_ed(p, q, e, d);
		n = p*q;
	}

	// 加密和解密的过程
	int rsa_encryp(int m, int ed, int n)
	{
		assert(m > 0 && m < n);
		return pow_mod(m, ed, n);
	}

	// RSA加密测试
	int main(void)
	{
		int e, d, n;
		int m = 119; // 需要加密的数据

		printf("RSA加密系统.\n\n");

		// 产生秘钥
		rsa_rand(e, d, n);
		printf("秘钥: e = %d, d = %d, n = %d\n\n", e, d, n);

		while(1)
		{
			printf("\n输入数据M(0<M<n): ");
			if(scanf("%d", &m) != 1) break;
			if(m <= 0 || m >= n) break;

			// 加密前数据
			printf("加密前: %d\n", m);

			// 加密文件, 秘钥为(e, n)
			printf("加密后: %d\n", m = rsa_encryp(m, e, n));

			// 解密文件, 秘钥为(d, n)
			printf("解密后: %d\n", m = rsa_encryp(m, d, n));
		}

		return 0;
	}

关于学习RSA的几点体会:

**1. 该实现的RSA密码强度很低, 可能仅满足于学习需要**

具体地n = p*q, n为32位int类型数据, 则p/q中必然
有一个值小于等于sqrt(n) <= sqrt(2^32) == 2^16.
而[0,2^16]范围内只有6542个素数, 因此因式分解n的
难度很低.

**2. 实际产生大的随机素数时, 一般采用费马小定理**

费马定理只是一种概率测试. 由于这里涉及的素数范围
很小, 因此直接从素数表中随机选取. 素数表的构造过
程很有意思, makePrimes从第一个素数2开始, 根据已知
的素数逐步扩充未知的素数.

**3. 关于GCD**

这里采用了扩展的GCD算法, 为的是得到下面的等式:
x*a + y*b == gcd(a,b).
根据x可以得到模线形方程a*x=1(mod b)的解.
GCD还有一种二进制的实现, 这里采用的是Euclid给的
算法.

观察代码可以发现, a/b和x/y参数的传递方向是相反:
a/b在进栈的时候向栈内传递信息; x/y则是在出栈的
时候从栈底向外传递信息.

**4. 关于与(p-1)*(q-1)互素的小奇数e**

满足e的条件的基数很多, 但是具体取哪个呢? 最小的
是否可以?

个人觉得e的值最好不要小于log2(n). 因为如果e的值
太小, 比如为3, 那么当m^3也小于n时就相当于没有加密
了. 针对这里n为int型数据的话, e大于32应该就可以了.

**5. m为1和n-1时**

m为1的话, 加密解密都是1, 因为1的x次幂依然为1.
m为n-1, 测试了一些数据, 加密后的值依然为n-1,
我想应该可以从数论角度给出证明, 数学比较强的朋友
可以尝试证明一下.

**6. m < 0 or m >= n**

因为RSA需要用模n运算, 因此如果m超出n范围的话, 解密
肯定会出现错误. 最好回避.

**7. m为0**

这个情况也比较特殊, 回避.

**8. (a^p)%n运算**

由于a^p结果可能溢出, 因此采用了长乘法(乘积为64位数).

**9. 函数f(a) = (a^p)%n的循环周期**

由于函数f的值域固定(0,n-1), 因此这个函数必然有循环周期.
大家有感兴趣可以自己测试一下循环周期.
