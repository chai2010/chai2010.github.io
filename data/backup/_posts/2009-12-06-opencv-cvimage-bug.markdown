---
layout: post
title: "CvImage中的陷阱和BUG "
date: 2009-12-06 08:50:17 +0800
comments: true
categories: [opencv, 调试]
---

### CvImage类的定义

	class CV_EXPORTS CvImage {
	public:
		CvImage() : image(0), refcount(0) {}
		CvImage( CvSize size, int depth, int channels ) {
			image = cvCreateImage( size, depth, channels );
			refcount = image ? new int(1) : 0;
		}
		CvImage( IplImage* img ): image(img)  {
			refcount = image ? new int(1) : 0;
		}
		~CvImage() {
			if( refcount && !(--*refcount) ) {
				cvReleaseImage( &image );
				delete refcount;
			}
		}
		void attach( IplImage* img, bool use_refcount=true ) {
			if( refcount ) {
				if( --*refcount == 0 ) cvReleaseImage( &image );
				delete refcount;
			}
			image = img;
			refcount = use_refcount && image ? new int(1) : 0;
		}
		void detach() {
			if( refcount ) {
				if( --*refcount == 0 )  cvReleaseImage( &image );
				delete refcount;
				refcount = 0;
			}
			image = 0;
		}
		CvImage& operator = (const CvImage& img)   {
			if( img.refcount ) ++*img.refcount;
			if( refcount && !(--*refcount) ) cvReleaseImage( &image );
			image=img.image;
			refcount=img.refcount;
			return *this;
		}
	protected:
		IplImage* image; // 实际影象
		int* refcount;   // 引用计数
	};

CvImage类的相关代码在以下位置：
`OpenCV\cxcore\include\cxcore.hpp`/`OpenCV\cxcore\src\cximage.cpp`
这里给出的只是部分函数。

为了提高效率，`CvImage`采用的是引用计数。不过目前的`CvImage`实现中，引用计数机制存在bug。

### 关于引用计数

引用计数应该也可以叫写时复制技术。就是在复制一个数据时，先只是简单地复制数据的 指针（地址），只有在数据被修改的时候才真的进行数据的复制操作。写时复制技术对用户 是透明的，也就是说用户可以当作数据是真的复制了。

一般数据（或者是文件，类等）都会对应创建/销毁操作。因此，采用写时复制技术的数据 一般还对应一个计数，记录该数据被别人引用的次数。数据在第一次被创建的时候被设置为1， 以后每次被重复创建则增加1，如果是被销毁则减少1。再销毁数据减少引用计数的时候，如果 记录变为0则真的执行删除数据操作，否则的话只执行逻辑删除。

这里需要注意的一点是，每个引用计数和它对应的数据是绑定的。因此，任何一个引用计数都 不应该独立于数据存在。

### CvImage中的引用计数机制

	class CV_EXPORTS CvImage {
		IplImage* image;
		int* refcount;
	};

`image`指向影像数据的地址，`refcount`指向影像数据对应的引用计数的地址。需要强调的一点是， `refcount`指向的引用计数并不属于哪个类，而是属于`image`指向影像数据！
任何将影像数据 和其对应的引用计数分离的操作都是错误的。


### `CvImage(IplImage* img)` 陷阱

假设有下面一个段代码：

	IplImage *pIplImg = cvLoadImage("load.tiff");  {
		CvImage cvImg(pIplImg);
	}
	cvSaveImage("save.tiff", pIplImg);

虽然逻辑上好像没有错误，但再执行到`cvSaveImage`语句的时候却会产生异常！跟踪调试后发现， 原来pIplImg对应的数据在cvImg析构的时候被释放了！

仔细分析后会发现，`CvImage`将`pIplImg`对应的数据和它本身的`refcount`绑定到一起了。`pIplImg` 对应的数据虽然不属于`CvImage`，但是它却依据`refcount`对其进行管理，直到`(*refcount)`变为0 的时候私自释放了`pIplImg`影像。

对于这个问题，我不建议使用引用计数，因此可以将代码修改为：

	CvImage( IplImage* img, bool use_refcount=false) : image(img)  {
		refcount = use_refcount && image ? new int(1) : 0;
	}

在默认的时候不使用引用计数机制，用户自己维护img内存空间。

### attach问题

	void attach( IplImage* img, bool use_refcount=true ) {
		if( refcount ) {
			if( --*refcount == 0 ) cvReleaseImage( &image );
			delete refcount;
		}
		image = img;
		refcount = use_refcount && image ? new int(1) : 0;
	}

`attach`是将一个`IplImage`影像绑定到`CvImage`。

其中的一个陷阱和前面的`CvImage`类似：

	IplImage *pIplImg = cvLoadImage("load.tiff");
	{
		CvImage cvImg;
		cvImg.attach(pIplImg);
	}  cvSaveImage("save.tiff", pIplImg); // 异常

处理是方法是把参数`use_refcount`的默认值改为`false`。

除了和`CvImage`类型的陷阱外，`attach`本身还有一个bug！

前面我们分析过，CvImage类中 `refcount`指向的空间和image指向的空间是绑在一起的。
因此，`if( --*refcount == 0 )` 语句中将`cvReleaseImage( &image )`和`delete refcount`
分离的操作肯定是错误的！！

假设有以下代码：

	IplImage *pIplImg = cvLoadImage("load.tiff");
	{
		CvImage cvImg;
		cvImg.create(cvSize(600,400), 8, 1); // 创建一个600*400的单字节单通道影像
		CvImage cvImgX(cvImg);               // 由cvImg拷贝构造cvImgX
		cvImgX.attach(pIplImg);
	}
	cvSaveImage("save.tiff", pIplImg);

代码将在执行完`cvImgX.attach(pIplImg)`语句后发生异常！

分析代码可以发现，`cvImg.create`先创建了一个影像，同时影像还对应一个引用计数。
由于`cvImgX` 是有`cvImg`拷贝构造得到，因此`cvImgX`也保存了和`cvImg`一样的`image`和`refcount`。
在接着执行的 `attach`中，`cvImgX`将`refcount`指向的空间释放（`delete refcount`）。
注意, `cvImgX`和`cvImg`的`refcount` 对应同一个空间！！

那么在，`cvImg`退出花括号执行析构函数的时候，`delete refcount`语句就非法了！

修改bug后的`attach`代码：

	void attach( IplImage* img, bool use_refcount=false ) // use_refcount默认值没有修改
	{
		if( refcount )   {
			if( --*refcount == 0 ) { // 同时释放
				cvReleaseImage( &image );
				delete refcount;
			}
		}
		image = img;
		refcount = use_refcount && image ? new int(1) : 0;
	}

由于CvImage中的许多函数都基于`attach`实现，因此没有修改use_refcount的默认值。
`detach`中的问题 和`attach`相似，代码修改如下：

	void detach() {
		if( refcount ) {
			if( --*refcount == 0 ) { // 同时释放
				cvReleaseImage( &image );
				delete refcount;
			}
			refcount = 0;
		}
		image = 0;
	}

重载操作符“=”时的内存泄漏

	CvImage& operator = (const CvImage& img)  {
		if( img.refcount ) ++*img.refcount;
		if( refcount && !(--*refcount) ) cvReleaseImage( &image );
		image=img.image;
		refcount=img.refcount;
		return *this;
	}

假设有以下类似代码：

	CvImage cvImg1, cvImg2;
	cvImg1.create(cvSize(600,400), 8, 1);
	cvImg2.create(cvSize(800,500), 8, 1);
	cvImg1 = cvImg2;

虽然看着很清晰，但是该代码却存在内存泄漏！分析如下：

`cvImg1`先创建一个(600,400)大小的影像，默认还对应一个引用计数（`refcount`指向的空间）。
`cvImg2` 也采用同样的方式创建一个类似的影像。

注意：`cvImg1`和`cvImg1`中`refcount`指向的空间是不同的！！

下面执行“=”操作时，`cvImg1`的`image`空间被释放（`cvReleaseImage( &image )`），
但是`cvImg1`的 `refcount`指向的空间却没有释放！
然后，`cvImg1`的`refcount`指向了`cvImg2`的`refcount`。
这样，`cvImg1` 的`refcount`指向内存就丢失了！

修改后的代码：

	CvImage& operator = (const CvImage& img)  {
		if( img.refcount ) ++*img.refcount;
		if( refcount && !(--*refcount) ) {
			cvReleaseImage( &image ); // 释放refcount
			delete refcount;
		}
		image=img.image;
		refcount=img.refcount;
		return *this;
	}

### 小节

虽然讲了这么多关于CvImage的陷阱和bug，单主要目的还是为了更好地使用CvImage。这里给出一个 建议：
在将IplImage数据和CvImage进行绑定，或者是基于IplImage数据构造CvImage对象的时候， 要清楚是否需要使用CvImage的引用计数技术（有哪些好处/坏处）。
特别是attach默认是采用引用计数的（没改的理由前面已经说明）。


**附：修复的`CvImage`**

	class CV_EXPORTS CvImage  {
	public:
		CvImage() : image(0), refcount(0) {}
		CvImage( CvSize size, int depth, int channels )
		{
			image = cvCreateImage( size, depth, channels );
			refcount = image ? new int(1) : 0;
		}
		// 修改
		CvImage( IplImage* img, bool use_refcount=false): image(img)
		{
			refcount = use_refcount && image ? new int(1) : 0;
		}
		~CvImage()
		{
			if( refcount && !(--*refcount) ) {
				cvReleaseImage( &image );
				delete refcount;
			}
		}
		// 修改
		void attach( IplImage* img, bool use_refcount=false ) // use_refcount默认值没有修改
		{
			if( refcount )    {
				if( --*refcount == 0 ) { // 同时释放
					cvReleaseImage( &image );
					delete refcount;
				}
			}
			image = img;
			refcount = use_refcount && image ? new int(1) : 0;
		}
		// 修改
		void detach()   {
			if( refcount )    {
				if( --*refcount == 0 ) { // 同时释放
					cvReleaseImage( &image );
					delete refcount;
				}
				refcount = 0;
			}
			image = 0;
		}
		// 修改
		CvImage& operator = (const CvImage& img)   {
			if( img.refcount ) ++*img.refcount;
			if( refcount && !(--*refcount) )    {
				cvReleaseImage( &image );
				// 释放refcount
				delete refcount;
			}
			image=img.image;
			refcount=img.refcount;
			return *this;
		}
	protected:
		IplImage* image; // 实际影象
		int* refcount;   // 引用计数
	};

