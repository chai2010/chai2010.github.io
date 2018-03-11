---
title: "OpenCV的图像读写框架"
date: 2009-12-06

categories: [opencv]
---

`cvSaveImage`/`cvLoadImage`函数用于保存和读取图像，两者的结构基本相似。
下面我们主要分析`cvSaveImage`函数的实现。

`cvLoadImage`函数位于 "OpenCV\otherlibs\highgui\loadsave.cpp" 文件：

	CV_IMPL IplImage*
	cvLoadImage( const char* filename, int iscolor )
	{
		return (IplImage*)icvLoadImage( filename, iscolor, false );
	}


内部基于`icvLoadImage`函数实现。其中`icvLoadImage`函数的第三个参数可以
用于装载矩阵，这里被忽略（`false`表示读图像）。

`icvLoadImage`函数的主要部分如下：

	static void*
	icvLoadImage( const char* filename, int flags, bool )
	{
		// 查找图像的读驱动

		GrFmtReader* reader = g_Filters.FindReader( filename );

		// 利用图像读驱动读出图像头信息（高宽等属性）

		reader->ReadHeader();

		// 高度/宽度

		size.width = reader->GetWidth();
		size.height = reader->GetHeight();

		// 是否彩色

		int iscolor = reader->IsColor();

		// 彩色通道数为3，灰度为1

		int cn = iscolor ? 3 : 1;

		// 创建影像

		IplImage* image = cvCreateImage( size, type, cn );

		// 利用读驱动读图像的所有像素
		// image->data.ptr对应数据的开始地址
		// image->step表示每行像素所在内存的大小

		reader->ReadData( image->data.ptr, image->step, iscolor );

		return image;
	}


其中`g_Filters`是一个静态变量：

	// global image I/O filters
	static CvImageFilters  g_Filters;


CvImageFilters在构造的时候，将已知的图像读写驱动保存到一个链表中。

	CvImageFilters::CvImageFilters()
	{
		m_factories = new GrFmtFactoriesList;

		m_factories->AddFactory( new GrFmtBmp() );
		m_factories->AddFactory( new GrFmtJpeg() );
		m_factories->AddFactory( new GrFmtSunRaster() );
		m_factories->AddFactory( new GrFmtPxM() );
		m_factories->AddFactory( new GrFmtTiff() );

		...
	}


`GrFmtFactoriesList`在`grfmt_base.h`/`grfmt_base.cpp`中定义，用于保存`GrFmtFilterFactory`
对象指针的链表。`GrFmtFilterFactory`为各种格式图像读写驱动的构造工厂基类：

	class   GrFmtFilterFactory
	{
	public:

		GrFmtFilterFactory();
		virtual ~GrFmtFilterFactory() {};

		const char*  GetDescription() { return m_description; };
		int     GetSignatureLength()  { return m_sign_len; };
		virtual bool CheckSignature( const char* signature );
		virtual bool CheckExtension( const char* filename );
		virtual GrFmtReader* NewReader( const char* filename ) = 0;
		virtual GrFmtWriter* NewWriter( const char* filename ) = 0;

	protected:
		const char* m_description;
			// graphic format description in form:
			// <Some textual description>( *.<extension1> [; *.<extension2> ...]).
			// the textual description can not contain symbols '(', ')'
			// and may be, some others. It is safe to use letters, digits and spaces only.
			// e.g. "Targa (*.tga)",
			// or "Portable Graphic Format (*.pbm;*.pgm;*.ppm)"

		int          m_sign_len;    // length of the signature of the format
		const char*  m_signature;   // signature of the format
	};

其中`GetDescription()`用于获取图像文件名的描述，类似于"文本文件 (\*.txt)"格式。

`GetSignatureLength()`用于获取图像文件的标志大小。对于tiff格式，开头有一个"II"或者是"MM"的标志，长度为2。
如果是算上tiff后面的42版本号，长度则为4。长度大小和`CheckSignature`相关。

`CheckSignature`用于匹配图像文件的标志。如果对应的图像不需要标志，则可以在从`GrFmtFilterFactory`派生的
子类中将其屏蔽。

`CheckExtension`匹配图像文件名的后缀名，用于也可以自己重新实现。

`NewReader`/`NewWriter`为读写驱动对应的构造函数，利用它们可以针对不同图像构造相应的驱动。

工厂类链表定义如下：

	class   GrFmtFactoriesList
	{
	public:

		GrFmtFactoriesList();
		virtual ~GrFmtFactoriesList();
		void  RemoveAll();
		bool  AddFactory( GrFmtFilterFactory* factory );
		int   FactoriesCount() { return m_curFactories; };
		ListPosition  GetFirstFactoryPos();
		GrFmtFilterFactory*  GetNextFactory( ListPosition& pos );
		virtual GrFmtReader*  FindReader( const char* filename );
		virtual GrFmtWriter*  FindWriter( const char* filename );

	protected:

		GrFmtFilterFactory** m_factories;
		int  m_maxFactories;
		int  m_curFactories;
	};


FindReader/FindWriter用于查找图像对应的驱动。如果想修改查找的规则，可以通过
GetNextFactory遍历链表来实现。

真正的读写类从GrFmtReader派生，分别对应grfmt_bmp/grfmt_jpeg等各种格式驱动。
然后通过前面的CvImageFilters::CvImageFilters()来讲各个驱动串到g_Filters.m_factories链表中。

	class   GrFmtReader
	{
	public:

		GrFmtReader( const char* filename );
		virtual ~GrFmtReader();

		int   GetWidth()  { return m_width; };
		int   GetHeight() { return m_height; };
		bool  IsColor()   { return m_iscolor; };
		int   GetDepth()  { return m_bit_depth; };
		void  UseNativeDepth( bool yes ) { m_native_depth = yes; };
		bool  IsFloat()   { return m_isfloat; };

		virtual bool  ReadHeader() = 0;
		virtual bool  ReadData( uchar* data, int step, int color ) = 0;
		virtual void  Close();

	protected:

		bool    m_iscolor;
		int     m_width;    // width  of the image ( filled by ReadHeader )
		int     m_height;   // height of the image ( filled by ReadHeader )
		int     m_bit_depth;// bit depth per channel (normally 8)
		char    m_filename[_MAX_PATH]; // filename
		bool    m_native_depth;// use the native bit depth of the image
		bool    m_isfloat;  // is image saved as float or double?
	};


`GrFmtReader`比较核心的地方是3个`virtual`函数，分表用于读图像文件头、读数据、关闭图像文件。
图像文件在读图像头的时候被打开。

对于图像的其他属性，可以通过在子类中直接操作`m_iscolor`等`protected`成员完成。

先大概说这么多，下一步将在上述分析的基础上，自己定义一个图像格式，然后提供相应的读写驱动，
然后集成到`cvSaveImage`/`cvLoadImage`函数中。

