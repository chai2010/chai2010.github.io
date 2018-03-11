---
layout: post
title: "OpenCV的测试框架 "
date: 2009-12-06 09:01:19 +0800
comments: true
categories: [opencv, 测试]
---

OpenCV提供了一套测试, 这里做简要的分析.

我选择的是 `cvFindContours`对应的测试, `cvFindContours` 函数本身的说明请参考:

[http://wiki.opencv.org.cn/index.php/Cv图像处理#FindContours](http://www.opencv.org.cn/index.php/Cv%E5%9B%BE%E5%83%8F%E5%A4%84%E7%90%86#FindContours)

`cvFindContours` 的测试函数对应 `OpenCV\tests\cv\src\acontours.cpp` 文件.

下面我们来分析一下测试代码的结构, 这样可以方便我们以后向opencv集成自己的代码以及代码测试.
测试对应的类为 `CV_FindContourTest`:

	class CV_FindContourTest : public CvTest
	{
	public:
		enum { NUM_IMG = 4 };
		
		CV_FindContourTest();
		~CV_FindContourTest();
		int write_default_params(CvFileStorage* fs);
		void clear();
	
	protected:
		int read_params( CvFileStorage* fs );
		int prepare_test_case( int test_case_idx );
		int validate_test_results( int test_case_idx );
		void run_func();
	
		int min_blob_size, max_blob_size;
		int blob_count, max_log_blob_count;
		int retr_mode, approx_method;
	
		int min_log_img_size, max_log_img_size;
		CvSize img_size;
		int count, count2;
	
		IplImage *img[NUM_IMG];
		CvMemStorage* storage;
		CvSeq *contours, *contours2, *chain;
	};

`CV_FindContourTest` 从 `CvTest` 派生, `CvTest` 位于 `OpenCV\tests\cxts\cxts.h`.
我们主要关注的是基类CvTest的构造函数:

	CvTest::CvTest( const char* _test_name, const char* _test_funcs, const char* _test_descr ) :
		name(_test_name ? _test_name : ""), tested_functions(_test_funcs ? _test_funcs : ""),
		description(_test_descr ? _test_descr : ""), ts(0)
	{
		if( last )
			last->next = this;
		else
			first = this;
		last = this;
		test_count++;
	
	...
	}


其中 `first` 等都是 `CvTest` 中的 `static` 成员:

	protected:
		static CvTest* first;
		static CvTest* last;
		static int test_count;

到这里我们就可以基本断定, `CV_FindContourTest` 在构造的是被连接到了 `CvTest::first` 的链表.
我们通过这个链表就可以访问所有从 `CvTest` 派生的子类, 也就是用户自己实现的测试类.

`OpenCV\tests\cv\src\acontours.cpp` 文件的末尾有一下代码:

	CV_FindContourTest find_contour_test;

该 `find_contour_test` 对象的主要功能是在构造的时候将自身串到 `CvTest::first` 链表.

下面就是测试代码的驱动了. 查看 `OpenCV\tests\cv\src\tsysa.cpp` 中的 `main` 函数:

	#include "cvtest.h"
	
	CvTS test_system;
	
	int main(int argC,char *argV[])
	{
		test_system.run( argC, argV );
		return 0;
	}

`CvTS::run` 的基本功能就是遍历 `CvTest::first` 链表上的每个测试类, 然后调用测试类的
`safe_run`函数. `safe_run` 函数可以包含具体的测试代码, 具体的细节这里这里先不讨论.

C/C++的单元测试框架还有很多, 比如: `CppUint`, `GTest` 等.

**补充(2014):**

还有本人仿造Go语言测试根据而设计的迷你版C++单元测试库:
https://github.com/chai2010/cc-mini-test

