---
title: "给OpenCV增加新的图像格式支持"
date: 2009-12-06

tags: [opencv]
categories: [opencv]
---

在<highgui.h>中提供了cvSaveImage/cvLoadImage两个
函数用来读写影像。opencv本身支持一些常见的格式。

但是如果是自己定义的特殊影像格式，cvSaveImage/cvLoadImage则不能正确处理。

不过opencv本身的影像读写模块设计的比较好，很容易进行扩充。而且opencv在处理
tiff等格式的图像的时候也是借用了libtiff库。因此，我们自己也可以给opencv的
cvSaveImage/cvLoadImage增加新的图像格式支持。

例如，假设定义了一个txt格式的图像。那么就可以用以下代码进行读写：


	IplImage *img;
	img = cvLoadImage("test.txt", 1);
	cvSaveImage("save.txt", img);


具体的示例代码现在没有完全写好，等完善之后会将驱动的实现细节整理出来。

由于内容比较多，我另开了一帖 [OpenCV的图像读写框架](/blog/2009/12/06/opencv-image-driver-framework).

关于cvLoadImage/cvSaveImage的读写框架已经分析过。
现在我们来尝试自己实现一个图像格式的读写操作。

现在，我们定义图像后缀名为bin，例如image.bin等。
bin格式的结构和IplImage结构基本对应，具体如下：


	"BIN"          // 文件类型，三个字节
	width          // 图像宽度，int
	height         // 图像高度，int
	depth          // 像素深度，int
	channels       // 通道数，int
	data           // 每个像素数据


bin格式图像文件为二进制格式。由于opencv内部实现的一些限制，
对于文本格式的图像文件支持可能相对困难一些（后面会提到）。

现在，参考grfmt_bmp代码，创建对应的grfmt_bin.h/grfmt_bin.cpp文件。

grfmt_bin.h内容如下：


	#ifndef _GRFMT_BIN_H_
	#define _GRFMT_BIN_H_

	#include "grfmt_base.h"

	// 测试：自己实现的图像格式

	// 采用内存格式
	// 内部保存一个img图像
	// IplImage

	class GrFmtBinReader : public GrFmtReader
	{
	public:

		GrFmtBinReader( const char* filename );
		~GrFmtBinReader();

		bool  ReadData( uchar* data, int step, int color );
		bool  ReadHeader();
		void  Close();

	protected:

	FILE*   m_fp;        // 文件指针
	int     m_channels;  // 通道数
	};


	// ... writer
	class GrFmtBinWriter : public GrFmtWriter
	{
	public:

		GrFmtBinWriter( const char* filename );
		~GrFmtBinWriter();

		bool  WriteImage( const uchar* data, int step,
						int width, int height, int depth, int channels );
	protected:

	FILE*   m_fp;  // 文件指针
	};


	// ... and filter factory
	class GrFmtBin : public GrFmtFilterFactory
	{
	public:

		GrFmtBin();
		~GrFmtBin();

		GrFmtReader* NewReader( const char* filename );
		GrFmtWriter* NewWriter( const char* filename );

	};

	#endif/*_GRFMT_BIN_H_*/


grfmt_bin.cpp对应各个成员函数的实现。首先包含必要的头文件：


	#include "_highgui.h"
	#include "grfmt_bin.h"


GrFmtBin对应bin格式的对象工厂，其中NewReader/NewWriter用于创建
用于读/写bin格式图像的驱动。


	GrFmtBin::GrFmtBin()
	{
		// 文件标志在开头，对应3个字节
		m_sign_len = 3;

		// 文件标志为"BIN"
		m_signature = "BIN";

		// 图像文件名描述，小括弧中的为后缀名
		m_description = "Bin image (*.bin)";

		// 只有后缀名为bin，并且以"BIN"3个字节开头的
		// 文件才会被当作bin格式图像。
	}

	GrFmtBin::~GrFmtBin()
	{
	}

	// 构造读驱动
	GrFmtReader* GrFmtBin::NewReader( const char* filename )
	{
		return new GrFmtBinReader( filename );
	}

	// 构造写驱动
	GrFmtWriter* GrFmtBin::NewWriter( const char* filename )
	{
		return new GrFmtBinWriter( filename );
	}


读驱动为GrFmtBinReader，从GrFmtReader派生：

	GrFmtBinReader::GrFmtBinReader( const char* filename ) : GrFmtReader( filename )
	{
		m_fp = NULL;
	}

	GrFmtBinReader::~GrFmtBinReader()
	{
	}

	// 关闭图像文件
	void  GrFmtBinReader::Close()
	{
		if(m_fp) fclose(m_fp);
		GrFmtReader::Close();
	}

	// 读图像的属性
	bool  GrFmtBinReader::ReadHeader()
	{
		// 打开图像文件
		m_fp = fopen(m_filename, "rb");
		if(!m_fp) return false;

		// 跳过图像格式"BIN"
		char signature[3];
		fread(signature, 1, 3, m_fp);

		// int t[] = { width, height, depth, channels };
		// fwrite(t, sizeof(t), 1, m_fp);

		int t[4];
		fread(t, sizeof(t), 1, m_fp);

		m_width      = t[0];
		m_height   = t[1];
		m_bit_depth   = t[2];
		m_channels   = t[3];

		m_iscolor   = (m_channels>1)? true: false;

		assert(m_height > 0 && m_width > 0);
		return true;
	}

	// 图像的像素数据
	bool  GrFmtBinReader::ReadData( uchar* data, int step, int color)
	{
		if(color && m_channels == 1)
		{
			// 转换为彩色
			int y;
			for( y = 0; y < m_height; y++, data += step )
			{
				int x;
				for(x = 0; x < m_width; ++x)
				{
					int size = m_channels*m_bit_depth/8;

					char buf[8];
					fread(buf, 1, size, m_fp);

					data[size*x+0] = buf[0];
					data[size*x+1] = buf[1];
					data[size*x+2] = buf[2];
				}
			}
		}
		else
		{
			// 这里有待完善
			int y;
			for( y = 0; y < m_height; y++, data += step )
			{
				int size = m_channels*m_bit_depth*m_width/8;
				fread(data, 1, size, m_fp);
			}
		}

		return true;
	}


写驱动为GrFmtBinWriter，从GrFmtWriter派生：

	GrFmtBinWriter::GrFmtBinWriter( const char* filename ) : GrFmtWriter( filename )
	{
	}

	GrFmtBinWriter::~GrFmtBinWriter()
	{
	}

	bool  GrFmtBinWriter::WriteImage( const uchar* data, int step,
									int width, int height, int depth, int channels )
	{
		m_fp = fopen(m_filename, "wb");
		if(!m_fp) return false;

		const char *signature = fmtSignBin;
		fwrite(signature, 1, 3, m_fp);

		{
			int t[] = { width, height, depth, channels };
			fwrite(t, sizeof(t), 1, m_fp);
		}

		int i;
		for(i = 0; i < height; ++i, data += step)
		{
			fwrite(data, depth*channels/8, width, m_fp);
		}

		fclose(m_fp);

		return true;
	}


到这里bin格式的驱动已经基本实现。下面还需要将驱动集成到opencv中。

**1. 在grfmts.h包含bin格式图像驱动**


	#include "grfmt_bin.h"


**2. 在loadsave.cpp中构造g_Filters的时候，添加驱动到链表**

具体代码在CvImageFilters构造函数中完成：


	CvImageFilters::CvImageFilters()
	{
		m_factories = new GrFmtFactoriesList;

		m_factories->AddFactory( new GrFmtBmp() );
		m_factories->AddFactory( new GrFmtJpeg() );
		m_factories->AddFactory( new GrFmtSunRaster() );
		m_factories->AddFactory( new GrFmtPxM() );
		m_factories->AddFactory( new GrFmtTiff() );
	#ifdef HAVE_PNG
		m_factories->AddFactory( new GrFmtPng() );
	#endif
	#ifdef HAVE_JASPER
		m_factories->AddFactory( new GrFmtJpeg2000() );
	#endif
	#ifdef HAVE_ILMIMF
		m_factories->AddFactory( new GrFmtExr() );
	#endif

		// Bin格式图像驱动
		m_factories->AddFactory( new GrFmtBin() );
	}


这里需要补充的是，m_factories链表中的顺序可能会影响
FindReader/FindWriter查找结果。在默认实现中是顺序查找，
因此链表中排在前面的驱动被优先查找。

现在bin格式图像的驱动已经全部实现，重新编译highgui工程。

下一节将讲述cvLoadImage/cvSaveImage的具体执行流程。

测试bin格式的驱动代码：


	#include <assert.h>
	#include <highgui.h>

	int main()
	{
		const char *file_bmp = "E:\\TestXX\\gtalk-Alien.bmp";
		const char *file_bin = "E:\\TestXX\\gtalk-Alien.bin";

		// 将bmp转换为bin格式

		IplImage *img_bmp = cvLoadImage(file_bmp, 1);
		assert(img_bmp != NULL);

		cvSaveImage(file_bin, img_bmp);

		// 从bin格式装载图像
		// 目前bin驱动还不完善，第二个参数需设置为1

		IplImage *img_bin = cvLoadImage(file_bin, 1);
		assert(img_bin != NULL);

		// 创建窗口，用于显示图像

		const char *win_bmp = "Bmp Image";
		const char *win_bin = "Bin Image";

		cvNamedWindow(win_bmp);
		cvNamedWindow(win_bin);

		// 显示2个图像
		cvShowImage(win_bmp, img_bmp);
		cvShowImage(win_bin, img_bin);

		// 等待
		cvWaitKey(0);

		// 释放资源
		cvDestroyAllWindows();

		cvReleaseImage(&img_bmp);
		cvReleaseImage(&img_bin);

		return 0;
	}


转换后的bin格式图像见附件，用户可以自己尝试打开bin图像文件。

调试驱动：

假设上面的测试对应的程序为C:\testBin.exe。
用VC6打开opencv的工程，设置highgui工程的属性：在调试可以执行栏中输入C:\testBin.exe。

现在就可以调试highgui了。可以单步调试，也可以在bin的相关位置设置断点。
需要注意的是，highgui工程和testBin工程默认的路径可能不同，因此在打开/保存图像的时候
最好使用绝对路径。

