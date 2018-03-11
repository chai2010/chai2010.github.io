---
title: "OpenCV中的内存泄漏检测"
date: 2009-12-06

tags: [opencv]
categories: [opencv]
---

内存泄漏时程序开发中经常遇到的问题. 而且出现内存泄漏很难检测,
但是其导致的结果却是灾难性的. 这里讲一下opencv中内存泄漏检测
的一些技巧.

OpenCV中关于内存管理主要涉及到以下3个函数:

	CV_IMPL void  cvSetMemoryManager( CvAllocFunc alloc_func, CvFreeFunc free_func, void* userdata );
	CV_IMPL void* cvAlloc( size_t size );
	CV_IMPL void  cvFree_( void* ptr );

还有一个对应 `cvFree_` 的宏:

	#define cvFree(ptr) (cvFree_(*(ptr)), *(ptr)=0)

宏 `cvFree` 的用处是在释放`ptr`指针对应的内存后, 将`ptr`设置为`NULL`.

这里我们先做个假设: opencv中所有的内存分配和释放都是通过`cvAlloc`和`cvFree`合作完成的.
如果你使用`cvAlloc`分配一个内存, 然后用`delete`来是释放内存是错误的(切记)!!!

因此, 如果我们能够跟踪到`cvAlloc`/`cvFree`的调用流程, 就可以分析内存泄漏的情况了.

一般情况下, 一个`cvAlloc`分配的内存最终必然要对应`cvFree`来释放, 如果`cvAlloc`/`cvFree`不是
匹配出现, 那么可以认为出现了内存泄漏.

为此, 我们需要定义自己的内存管理函数, 然后通过`cvSetMemoryManager`装载到opencv中.
内存管理函数的类型如下:

	typedef void* (CV_CDECL *CvAllocFunc)(size_t size, void* userdata);
	typedef int (CV_CDECL *CvFreeFunc)(void* pptr, void* userdata);

其中的`userdata`是用户通过`cvSetMemoryManager`来设置的. 我们可以简单的吧`userdata`当作一个
容器指针, 在每次执行我们自己的`alloc_func`/`free_func`函数时, 将内存的分配/释放情况记录到
`userdata`对应的容器.

为此, 我自己简单设计了一个`MemTracker`类:

	#ifndef OPENCV_MEM_TRACKER_H
	#define OPENCV_MEM_TRACKER_H

	#include <stdio.h>
	#include <vector>

	// 内存泄漏追踪

	class MemTracker
	{
	public:
		MemTracker(void);
		~MemTracker(void);

	private:

		// 登记分配/释放的内存
		void regAlloc(void *ptr, size_t size);
		void regFree(void *ptr);

		// 输出泄漏的内存
		int output(FILE* fp=stderr);

	private:

		// 分配内存
		static void* alloc_func(size_t size, void *userdata);
		// 释放内存
		static int free_func(void *ptr, void *userdata);

	private:

		struct Ptr
		{
			void *ptr;      // 内存地址
			size_t size;    // 内存大小

			Ptr(void *ptr, size_t size)
			{
				this->ptr = ptr;
				this->size = size;
			}
		};

		// 记录当前使用中的内存
		std::vector<Ptr>   m_memTracker;
	};

	#endif   // OPENCV_MEM_TRACKER_H

类的实现如下:

	#include "MemTracker.h"

	#include <assert.h>
	#include <cv.h>

	MemTracker::MemTracker(void)
	{
		// 注册管理函数
		cvSetMemoryManager(alloc_func, free_func, (void*)this);
	}

	MemTracker::~MemTracker(void)
	{
		// 取消管理函数
		cvSetMemoryManager(NULL, NULL, NULL);

		// 输出结果
		this->output();
	}

	// 登记分配/释放的内存
	void MemTracker::regAlloc(void *ptr, size_t size)
	{
		m_memTracker.push_back(Ptr(ptr, size));
	}

	void MemTracker::regFree(void *ptr)
	{
		int i;
		for(i = 0; i < m_memTracker.size(); ++i)
		{
			// 删除记录
			if(m_memTracker[i].ptr == ptr)
			{
				m_memTracker[i] = m_memTracker[m_memTracker.size()-1];
				m_memTracker.pop_back();
				return;
			}
		}
	}

	// 输出泄漏的内存

	int MemTracker::output(FILE* fp)
	{
		int n = m_memTracker.size();
		int i;

		for(i = 0; i < n; ++i)
		{
			fprintf(fp, "%d: %p, %u\n", i, m_memTracker[i].ptr, m_memTracker[i].size);
		}
		return n;
	}

	// 分配内存

	void* MemTracker::alloc_func(size_t size, void *userdata)
	{
		assert(size > 0 && userdata != NULL);

		// 分配内存
		void *ptr = malloc(size);
		if(!ptr) return NULL;

		// 登记
		MemTracker *tracker = (MemTracker*)userdata;
		tracker->regAlloc(ptr, size);
		return ptr;
	}

	// 释放内存
	int MemTracker::free_func(void *ptr, void *userdata)
	{
		assert(ptr != NULL && userdata != NULL);

		// 释放内存
		free(ptr);

		// 登记
		MemTracker *tracker = (MemTracker*)userdata;
		tracker->regFree(ptr);

		// CV_OK == 0
		return 0;
	}

MemTracker在构造的时候会注册自己的内存管理函数, 在析构的时候会输出没有被释放的内存.
下面我们编写一个测试程序:

	#include <cv.h>
	#include <highgui.h>

	#include "MemTracker.h"

	int main()
	{
		MemTracker mem;

		IplImage *img = cvLoadImage("lena.jpg", 1);
		if(!img) return -1;

		// 没有释放img内存
		// cvReleaseImage(&img);

		return 0;
	}


在main函数退出的时候mem会被析构, 然后输出内存的泄漏情况. 下面是在我的电脑上测试的结果:

	C:\work\vs2005\MemTracker\debug>MemTracker.exe
	0: 00C750C0, 112
	1: 00D90040, 786432

OK, 先说到这里吧, 下次再补充...

前面我们已经解决了内存泄漏的检测, 但是在出现内存泄漏的时候我们怎么才能
跟踪到出现内存泄漏的代码呢? 如果能够调试到没有被释放内存对应的cvAlloc函数就好了.

这个我们可以通过`m_memTracker[i].ptr`来比较内存的地址来检测, 例如在alloc_func中
添加以下代码, 然后设置断点:


	// 检测00C750C0内存
	if(ptr == (void*)00C750C0)
	{
		// 设置断点
	}


但是这个方法可能还有缺陷. 因为每次运行程序的时候, 内存的布局可能是有区别的.
最好的方法是把cvAlloc的调用顺序记录下来.

变动的部分代码:

	class MemTracker
	{
		struct Ptr
		{
			void *ptr;      // 内存地址
			size_t size;    // 内存大小
			int   id;

			Ptr(void *ptr, size_t size, int id)
			{
				this->ptr = ptr;
				this->size = size;
				this->id = id;
			}
		};

		// 记录当前使用中的内存
		std::vector<Ptr>   m_memTracker;

		// alloc_func对应的编号
		int               m_id;
	};

	MemTracker::MemTracker(void)
	{
		m_id = 0;

		// 注册管理函数

		cvSetMemoryManager(alloc_func, free_func, (void*)this);
	}

	void MemTracker::regAlloc(void *ptr, size_t size)
	{
		// 每次记录一个新的m_id
		m_memTracker.push_back(Ptr(ptr, size, m_id++));
	}

	// 输出泄漏的内存
	int MemTracker::output(FILE* fp)
	{
		int n = m_memTracker.size();
		int i;

		for(i = 0; i < n; ++i)
		{
			fprintf(fp, "%d: %p, %u\n", m_memTracker[i].id, m_memTracker[i].ptr, m_memTracker[i].size);
		}
		return n;
	}


以后就可以根据`m_memTracker[i].id`来设置断点跟踪调试. 因为每次运行程序的时候, `cvAlloc`的调用次序是不变
的, 因此可以认为每次`cvAlloc`对应的`id`也是不变的. 这样就可以根据`id`来追踪出现内存泄漏的`cvAlloc`了.

前面的帖子中我们已经讨论了`cvAlloc`/`cvFree_`/`cvSetMemoryManager`等函数的使用技巧.
下面开始分析OpenCV中以上函数的实现代码. 我觉得如果在阅读代码之前, 如果能对函数的
用法有个基本的认识, 那么对于分析源代码是很有帮助的.

	CV_IMPL  void*  cvAlloc( size_t size )
	{
		void* ptr = 0;

		CV_FUNCNAME( "cvAlloc" );

		__BEGIN__;

		if( (size_t)size > CV_MAX_ALLOC_SIZE )
			CV_ERROR( CV_StsOutOfRange,
					"Negative or too large argument of cvAlloc function" );

		ptr = p_cvAlloc( size, p_cvAllocUserData );
		if( !ptr )
			CV_ERROR( CV_StsNoMem, "Out of memory" );

		__END__;

		return ptr;
	}


从代码我们可以直观的看出, `cvAlloc`分配的内存不得大于`CV_MAX_ALLOC_SIZE`, 即使是使用我们
自己的内存管理函数也会有这个限制.

然后通过`p_cvAlloc`对应的函数指针对应的函数来分配内存. `p_cvAlloc`是一个全局`static`变量, 对应的
还有`p_cvFree`和`p_cvAllocUserData`, 分别对应释放内存函数和用户数据. 它们的定义如下:

	// pointers to allocation functions, initially set to default
	static CvAllocFunc p_cvAlloc = icvDefaultAlloc;
	static CvFreeFunc p_cvFree = icvDefaultFree;
	static void* p_cvAllocUserData = 0;

默认的内存管理函数分别为`icvDefaultAlloc`和`icvDefaultFree`(`icv`开头的表示为内部函数), 用户数据指针为空.

继续跟踪默认的内存分配函数`icvDefaultAlloc`, 代码如下:

	static void*
	icvDefaultAlloc( size_t size, void* )
	{
		char *ptr, *ptr0 = (char*)malloc(
			(size_t)(size + CV_MALLOC_ALIGN*((size >= 4096) + 1) + sizeof(char*)));

		if( !ptr0 )
			return 0;

		// align the pointer
		ptr = (char*)cvAlignPtr(ptr0 + sizeof(char*) + 1, CV_MALLOC_ALIGN);
		*(char**)(ptr - sizeof(char*)) = ptr0;

		return ptr;
	}


内部使用的是C语言中的`malloc`函数, 在分配的时候多申请了`CV_MALLOC_ALIGN*((size >= 4096) + 1) + sizeof(char*)`
大小的空间. 多申请空间的用处暂时先不分析.

下面的`cvAlignPtr`函数用于将指针对其到`CV_MALLOC_ALIGN`边界, 对于我们常规的PC来说是32bit, 也就是4字节.
`cvAlignPtr`函数在后面会详细讨论.

下面语句将ptr0记录到`(ptr - sizeof(char*))`, 可以把它看作一个指针. 最后返回`ptr`.
细心的朋友可能会发现, 前面`malloc`分配的是`ptr0`, 现在返回的却是`ptr`, 这个是为什么呢?

这个的原因还是先放下, 但是返回ptr而不返回`ptr0`带来的影响至少有2个:

1. 返回的`ptr`指针不能通过C语言的`free`函数释放(这也是`cvAlloc`/`cvFree`必须配对使用的原因).
2. 在`cvFree`的时候, 可以根据`(ptr - sizeof(char*))`对应的值来检测该内存是不是由`icvDefaultAlloc`申请.

这样应该说可以增加程序的健壮性, `icvDefaultFree`可以不像傻瓜似的对于任何指针都进行释放.

下面来看看`cvAlignPtr`函数:

	CV_INLINE void* cvAlignPtr( const void* ptr, int align=32 )
	{
		assert( (align & (align-1)) == 0 );
		return (void*)( ((size_t)ptr + align - 1) & ~(size_t)(align-1) );
	}

该函数的目的主要是将指针`ptr`调整到`align`的整数倍

其中`align`必须为2的幂, `assert`语言用于该检测. 语句`(align & (align-1))`
一般用于将`align`的最低的为1的bit位设置为0. 如果为2的幂那么就只有1个为1
的bit位, 因此语句`(x&(x-1) == 0)`可以完成该检测.

`return`语句简化后为 `(ptr+align-1)&~(align-1)`, 等价于`((ptr+align-1)/align)*align`.
就是找到不小于`ptr`, 且为`align`整数倍的最小整数, 这里对应为将指针对其到4字节(32bit).

`cvFree_`函数和`cvAlloc`类似, 就不详细分析了:

	CV_IMPL  void  cvFree_( void* ptr )
	{
		CV_FUNCNAME( "cvFree_" );

		__BEGIN__;

		if( ptr )
		{
			CVStatus status = p_cvFree( ptr, p_cvAllocUserData );
			if( status < 0 )
				CV_ERROR( status, "Deallocation error" );
		}

		__END__;
	}

`p_cvFree`默认值为`icvDefaultFree`:

	static int
	icvDefaultFree( void* ptr, void* )
	{
		// Pointer must be aligned by CV_MALLOC_ALIGN
		if( ((size_t)ptr & (CV_MALLOC_ALIGN-1)) != 0 )
			return CV_BADARG_ERR;
		free( *((char**)ptr - 1) );

		return CV_OK;
	}


最后我们简要看下`cvSetMemoryManager`函数, 它主要用来设置用户自己定义的内存管理函数:

	CV_IMPL void cvSetMemoryManager( CvAllocFunc alloc_func, CvFreeFunc free_func, void* userdata )
	{
		CV_FUNCNAME( "cvSetMemoryManager" );

		__BEGIN__;

		// 必须配套出现
		if( (alloc_func == 0) ^ (free_func == 0) )
			CV_ERROR( CV_StsNullPtr, "Either both pointers should be NULL or none of them");

		p_cvAlloc = alloc_func ? alloc_func : icvDefaultAlloc;
		p_cvFree = free_func ? free_func : icvDefaultFree;
		p_cvAllocUserData = userdata;

		__END__;
	}


如果函数指针不为空, 则记录到`p_cvAlloc`和`p_cvFree`指针, 如果为空则恢复到默认的内存管理函数.
需要注意的是if语句的条件`(alloc_func == 0) ^ (free_func == 0)`, 只有当2个函数1个为`NULL`, 1个
不为`NULL`的时候才会出现, 出现这个的原因是内存管理函数的分配和释放函数不匹配了, 这个是不允许的.

因此, 我们需要设置自己的内存管理函数, 就需要同时指定alloc_func和free_func函数, 清空的时候
则把2个参数都设置NULL就可以了.

今天再来补充一个小技巧 :)

我们前面通过`cvSetMemoryManager`函数来重新设置了自己的内存管理函数.
但是前面也说到过, 如果`cvAlloc`/`cvFree`覆盖的周期和`MemTracker`相交, 那么
内存会出现错误.

即,

1. 原来OpenCV默认函数分配的内存可能使用我们自己的`cvFree`函数来释放.
2. 我们自己定义的`cvAlloc`分配的内存可能使用原来OpenCV默认的函数来释放.

这都会造成错误!

其实我们定义的目的只是要统计内存的使用情况, 我们并不想真的使用自己的函数的管理
OpenCV的内存. 道理很简单, OpenCV的内存经过优化, 对齐到某个字节, 效率更好.

如果能获取OpenCV原始的内存管理函数就好了, 但是没有这样的函数!!!

但是, 我们任然有方法来绕过这个缺陷.

我们可以在`MemTracker::alloc_func`函数进入之后, 在用`cvSetMemoryManager`恢复原来的
内存管理函数, 这样我们统计目的也达到了, 而且还是用了OpenCV本身的函数来分配内存.

代码如下:

	void* MemTracker::alloc_func(size_t size, void *userdata)
	{
		assert(size > 0 && userdata != NULL);

		// 取消管理函数
		cvSetMemoryManager(NULL, NULL, NULL);

		// 用OpenCV的方式分配内存
		void *ptr = cvAlloc(size);

		// 登记
		if(ptr)
		{
			MemTracker *tracker = (MemTracker*)userdata;
			tracker->regAlloc(ptr, size);
		}

		// 重新注册注册管理函数
		cvSetMemoryManager(alloc_func, free_func, userdata);

		return ptr;
	}


`MemTracker::free_func`的方法和上面类似, 就不贴代码了.

以后我们就可以透明的使用`MemTracker`了, 不管`MemTracker`对象在那个地方定义,
它对OpenCV的内存管理都不会有影响.

前面的方法虽然使得 `MemTracker` 可以在任何地方使用, 但是可能带来理解的难度.

因为 在`cvAlloc`之后进入的是 `MemTracker::alloc_func`, 但是在这个函数中又调用了`cvAlloc`!
这看起来很像一个无穷递归调用!!

但是实际的运行结果却没有出现无穷递归导致的栈溢出情形. 仔细分析就知道原理了:

**1. 定义MemTracker对象**

中间调用了 `cvSetMemoryManager(alloc_func, free_func, (void*)this);` 函数,
设置 `MemTracker::alloc_func` 为分配函数.

**2. 调用cvAlloc**

内部执行到 `MemTracker::alloc_func`, 依次执行


	// 取消管理函数
	cvSetMemoryManager(NULL, NULL, NULL);


此刻, 分配函数又恢复为OpenCV的`icvDefaultAlloc`函数.

执行

	// 用OpenCV的方式分配内存
	void *ptr = cvAlloc(size);

	// 登记
	if(ptr)
	{
		CvxMemTracker *tracker = (CvxMemTracker*)userdata;
		tracker->regAlloc(ptr, size);
	}


这里的`cvAlloc`函数内部调用的是`icvDefaultAlloc`函数, 并不是`MemTracker::alloc_func` !!
就是这里了, `alloc_func`内部虽然调用了`cvAlloc`, 但是没有执行到`alloc_func`.

因此`alloc_func`不会出现递归.

