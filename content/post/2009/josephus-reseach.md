---
title: "Josephus问题"
date: 2009-12-05

categories: [算法]
---

**1. 问题的由来**

Josephus问题是以10世纪的著名历史学家Flavius Josephus命名的. 据说, Josephus
如果没有数学才能, 他就不会在活着的时候出名! 在犹太人和古罗马人战争期间, 他是
陷如罗马人陷阱的41个犹太反抗者之一. 反抗者宁死不做俘虏, 他们决定围成一个圆圈,

且围绕圆圈来进行, 杀死所有第3个剩下的人直到没有一个人留下. 但是, Josephus和一个

不告发的同谋者感到自杀是愚蠢的行为, 所以以他快速计算出在此恶性循环中他和他的
朋友应该站的地方. 因此, 他们活了下来...

**2. 平凡的解法  **

我们用一个循环连表来模拟他们的行为。为了省事，我直接找了一个一个java代码：

	class Josephus
	{
		static class Node
		{
			int val; Node next;
			Node(int v) { val = v; }
		}
		public static void main(String[] args)
		{
			int N = Integer.parseInt(args[0]);
			int M = Integer.parseInt(args[1]);

			Node t = new Node(1);
			Node x = t;

			for(int i = 2; i <= N; x = (x.next=new Node(i++)));

			x.next = t;

			while(x != x.next)
			{
				for(int i = 1; i < M; i++) x = x.next;
				x.next = x.next.next;
			}
			Out.println("Survivor is " + x.val);
		}
	}

**3. 递归公式**

喜欢这个问题的朋友肯定不满足上面的方法，很想知道更简单的算法。
其实Josephus问题中的序列确实存在递归的公式。但是递归公式的推导
比较麻烦，我就直接给出结果。如果想了解详细过程可以查阅相关资料。

假设有n个人，每次杀第m个人，则k为第k个被杀死的人...

	j1: x  <- k*m
	j2: if(x <= n) 输入结果x
	j3: x <- floor((m*(x-n)-1)/(m-1)), goto j1

以C语言实现如下：

	unsigned josephus(unsigned  m, unsigned  n, unsigned  k)
	{
		unsigned x = km;
		while(x <= n) x = (m*(x-n)-1)/(m-1);
		return  x;
	}

**4. m为2的情况**

现在考虑一种m为2的特殊情形。
这时候有更简单的递归公式：

	x = 2*n + 1 - (2*n+1-2*k)*2^log2((2*n)/(2*n+1-2*k))

其中，`log2((2*n)/(2*n+1-2*k))`为计算`(2*n)/(2*n+1-2*k)`以`2`为底的对数，
结果向下取整数。

观察`2^log2((2*n)/(2*n+1-2*k))`整体，可以理解为将`(2*n)/(2*n+1-2*k)`向下
舍取到2的幂。有些地方把这中运算称为地板函数，我们定义为flp2，下面是
C语言的实现：

	unsigned flp2(unsigned  x)
	{
		unsigned y;
		do { y = x; x &= x-1; }while(x);
		return y;
	}

其中`x &= x-1;`语句是每次把`x`二进制最右边的`1`修改为`0`，直到最左边的1为止.
这种方法也可以用来计算x二进制中1的数目，当x二进制中1的数目比较小的
时候算法的效率很高。

m为2的代码实现:

	unsigned josephus2k(unsigned n, unsigned k)
	{
		unsiged t = (n<<1) - (k<<1) + 1;
		return (n<<1)+1 - t*flp2((n<<1)/t);
	}

**5. m为2的情况, k为n的情形**

该问题一般都是计算最后一个被杀的人的位置。
现在考虑更为特殊的，m为2的情况, k为n的情形。

令k=n可以化简前边m=2的公式：

	x = 2*n + 1 - (2*n+1-2*n)*2^log2((2*n)/(2*n+1-2*n))

即

	x = 2*n + 1 - 2^log2(2*n)

从二进制的角度可以理解为：
将n左移1位（即乘以2），然后将最右端设置为1（既加1），
最后将左端的1置为0（既减去`2*n`的向下取的2的幂）。

更简单的描述是将n的二进制表示循环左移动一位!

例如: n为`1011001 -> 0110011 -> 110011`

用代码实现为：

	unsigned josephus2n(unsigned n)
	{
		return ((n-flp2(n))<<1)|1;
	}

继续修改：

	unsigned josephus2n(unsigned n)
	{
		return ((n&(~flp2(n)))<<1)|1;
	}

参考资料: 具体数学.
