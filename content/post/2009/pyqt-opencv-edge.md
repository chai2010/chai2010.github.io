---
title: "PyQt&OpenCV实现边缘检测"
date: 2009-12-06

tags: [opencv, pyqt, python, qt]
categories: [opencv]
---

首先设计UI界面, 调整自己满意的布局.
其中黑色为 QLabel, 对象名为labelImage, 用于显示图像. 左下角为拖动条, 对称为sliderThreshold, 用于修改参数.
Open按钮用于打开文件, 对象名为openButton.
在界面编辑器中, 将Close按钮的clicked信号连接到窗口的close槽.


![](/images/pyqt-opencv-edge/pyqt-opencv-edge-01.jpg)


窗口设计完成后保存到edge.ui, 然后基于edge.ui文件构造程序:

	# -*- coding:utf-8 -*-
	###########################################################
	# PyQt+OpenCV example
	#
	# 查找图像中的边界.
	# 参考 OpenCV\samples\python\edge.py 改写
	#
	# By chaishushan{AT}gmail.com 2008
	###########################################################

	import sys

	# 导入PyQt模块
	from PyQt4.Qt import *
	from PyQt4 import uic

	# 导入OpenCV模块
	from opencv.cv import *
	from opencv.highgui import *

	# 边界检测类
	class WinEdge(QWidget):
		def __init__(self, parent=None):
			QWidget.__init__(self, parent)
			uic.loadUi("edge.ui", self)

			# OpenCV相关参数
			self.cv_img = None
			self.cv_col_edge = None
			self.cv_gray = None
			self.cv_edge = None

			# 标题
			self.defaultTitle = self.windowTitle()


		@pyqtSignature("")
		def on_openButton_clicked(self):
			filename = QFileDialog.getOpenFileName(self,
								self.tr("Choose a Image"), ".",
								self.tr("Image Files (*.jpg;*.bmp);;All Files (*)"))

			if not filename.isEmpty():
				self.sliderThreshold.setEnabled(False)

				self.openImage(filename)
				self.dectorEdge(self.sliderThreshold.value())

				# 更新UI
				if self.cv_col_edge:
					self.setWindowTitle(filename)
					self.sliderThreshold.setEnabled(True)
				else:
					self.setWindowTitle(self.defaultTitle)
					self.sliderThreshold.setEnabled(False)

		@pyqtSignature("int")
		def on_sliderThreshold_valueChanged(self, val):

			# 重新计算边界
			self.dectorEdge(val)

		def resizeEvent(self, event):
			self.showImage()

		# 打开图像
		def openImage(self, qstringName):
			# 将QString转换为char *
			filename = qstringName.toLocal8Bit().data()

			# 释放以前的图像
			if self.cv_img :
				cvReleaseImage( self.cv_img ); self.cv_img = None
				cvReleaseImage( self.cv_col_edge ); self.cv_col_edge = None
				cvReleaseImage( self.cv_gray ); self.cv_gray = None
				cvReleaseImage( self.cv_edge ); self.cv_edge = None

			# 打开新的图像
			self.cv_img = cvLoadImage(filename)
			if not self.cv_img:
				msg = self.tr("Can't open %1 file!").arg(filename)
				QMessageBox.warning (self, "Warning", msg)
				return False

			# 创建辅助空间
			size = cvSize(self.cv_img.width, self.cv_img.height)

			self.cv_col_edge = cvCreateImage (size, 8, 3)
			self.cv_gray = cvCreateImage (size, 8, 1)
			self.cv_edge = cvCreateImage (size, 8, 1)

			return True

		# 生成边界

		def dectorEdge(self, position):

			if not self.cv_img: return

			# 转换为灰度
			cvCvtColor (self.cv_img, self.cv_gray, CV_BGR2GRAY)

			cvSmooth (self.cv_gray, self.cv_edge, CV_BLUR, 3, 3, 0)
			cvNot (self.cv_gray, self.cv_edge)

			# run the edge dector on gray scale
			cvCanny (self.cv_gray, self.cv_edge, position, position * 3, 3)

			# 结构保存到cv_col_edge中
			cvSetZero (self.cv_col_edge)
			cvCopy (self.cv_img, self.cv_col_edge, self.cv_edge)

			# 显示
			self.showImage()

		# 显示图像
		def showImage(self):
			if not self.cv_col_edge: return

			# 转化IplImage为QImage
			w = self.cv_col_edge.width
			h = self.cv_col_edge.height

			step = self.cv_col_edge.widthStep
			data = self.cv_col_edge.imageData

			img = QImage(data, w, h, step, QImage.Format_RGB888).rgbSwapped()

			# 显示图像[缩放到窗口大小]
			size = self.labelImage.size()
			self.labelImage.setPixmap(QPixmap.fromImage(img.scaled(size)))

	if __name__ == '__main__':
		app = QApplication(sys.argv)
		widget = WinEdge()
		widget.show()
		app.exec_()


运行结果如图:

![](/images/pyqt-opencv-edge/pyqt-opencv-edge-02.jpg)

完整的代码以后补充。

