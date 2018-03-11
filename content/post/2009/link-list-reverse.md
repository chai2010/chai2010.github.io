---
title: "单向链表的逆序"
date: 2009-12-07

categories: [链表, 逆序, 算法]
---

假设链表的结构为:

	struct Node { int item; Node* next; };

单向链表是一个有序的序列.假设有一个单向链表A:

	1, 2, 3, 4, 5, ...

现在将A表逆序后得到链表B:

	..., 5, 4, 3, 2, 1


常规的反转链表方法:

	Node *reverse(Node *list)
	{
		link t, y = list, r = 0;
		while (y != 0) { t = y->next; y->next = r; r = y; y = t; }
		return r;
	}

其实上面的这个操作自然地对应于栈的出栈/压栈操作.
因此, 单向链表的逆序问题我们也可以抽象为A和B两个栈的转换问题.

现在给Node实现用于栈的操作函数:

	// 1. 判断栈是否为空
	bool isEmpty(Node* stack)
	{
		return (stack == NULL);
	}

	// 2. 向栈stack中压入一个node元素
	void push(Node* &stack, Node* node)
	{
		node->next = stack;
		stack = node;
	}

	// 3. 从栈stack中弹出一个元素
	Node* pop(Node* &stack)
	{
		assert(!isEmpty(stack));

		Node *t = stack;
		stack = stack->next;

		return t;
	}

下面可以基于栈实现单向链表的逆序操作了.

	Node *reverse(Node *oldList)
	{
		Node *newList = NULL;

		while(!isEmpty(oldList))
		{
			push(newList, pop(oldList));
		}

		return newList;
	}

采用栈的思维来思考单向链表的逆序问题之后,许多本来相对复杂的问题都会变得异常简单.
例如, 我们现在再考虑用递归的方法来逆序链表.

	// 递归实现反转链表
	Node *reverse(Node *oldList, Node *newList=NULL)
	{
		// 判断oldList是否为空
		if(isEmpty(oldList)) return newList;

		// 从oldList栈弹出一个元素
		// 然后将弹出的元素压到newList栈中
		push(newList, pop(oldList));

		// 递归处理剩下的oldList链表
		return reverse(oldList, newList);
	}

递归版本的调用方式:

	int main()
	{
		Node *list = NULL;

		// newList采用默认的NULL
		Node *t = reverse(list);

		// ...
	}
