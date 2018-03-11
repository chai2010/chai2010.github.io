---
title: "Go如何处理zip中的中文文件名"
date: 2013-12-20
draft: false

tags: ["golang"]
categories: ["golang"]
---

Go的标准库已经自带了zip的库.

不过zip包在处理内部文件名时, 默认是utf8编码的.
对于Windows中文用户, 生成和读取zip内部文件名默认是GBK编码的.
因此, 在处理涉及GBK的文件名时需要做一个转换.

Go语言官方的 `go.text` 子标准库已经支持各种编码, 下面是utf8转GBK的函数:

	import "golang.org/x/text/encoding/simplifiedchinese"

	func utf8ToGBK(text string) (string, error) {
		dst := make([]byte, len(text)*2)
		tr := simplifiedchinese.GB18030.NewEncoder()
		nDst, _, err := tr.Transform(dst, []byte(text), true)
		if err != nil {
			return text, err
		}
		return string(dst[:nDst]), nil
	}

在生成zip文件时, 用 `utf8ToGBK` 处理文件名:

	func main() {
		file, err := os.Create("中文-测试.zip")
		if err != nil {
			log.Fatal(err)
		}
		defer file.Close()

		wzip := zip.NewWriter(file)
		defer func() {
			if err := wzip.Close(); err != nil {
				log.Fatal(err)
			}
		}()

		// 压缩文件
		var files = []struct{ Name, Body string }{
			{"11/1/readme.txt", "UTF8 字符串."},
			{"11/1/readme2.txt", "This archive contains some text files."},
			{"汉字/2/gopher.txt", "Gopher names:\nGeorge\nGeoffrey\nGonzo"},
			{"11/中文.txt", "中文Get animal handling licence.\nWrite more examples."},
			{"空目录/", ""},
		}
		for _, file := range files {
			name, _ := utf8ToGBK(file.Name) // 文件名转换为 GBK编码
			f, err := wzip.Create(name)
			if err != nil {
				log.Fatal(err)
			}
			_, err = f.Write([]byte(file.Body))
			if err != nil {
				log.Fatal(err)
			}
		}
	}

这样就可以生成Windows下带简体中文的文件名压缩文件了.

*2014年补充:*

其实在新的 [zip规范](http://www.pkware.com/documents/casestudies/APPNOTE.TXT) 中,
已经对UTF8编码的文件名提供了支持.

	File:    APPNOTE.TXT - .ZIP File Format Specification
	Version: 6.3.3

	4.4.4 general purpose bit flag: (2 bytes)

	Bit 11: Language encoding flag (EFS).  If this bit is set,
		the filename and comment fields for this file
		MUST be encoded using UTF-8. (see APPENDIX D)

具体来说, 在每个文件的头信息的`Flags`字段的11bit位.
如果该bit位为0则表用本地编码(本地编码是GBK吗?), 如果是1则表示用UTF8编码.

头信息对应zip库的 [archive/zip.FileHeader](http://godoc.org/archive/zip#FileHeader) 结构的 `Flags` 成员:

	type FileHeader struct {
		// Name is the name of the file.
		// It must be a relative path: it must not start with a drive
		// letter (e.g. C:) or leading slash, and only forward slashes
		// are allowed.
		Name string

		CreatorVersion     uint16
		ReaderVersion      uint16
		Flags              uint16
		Method             uint16
		ModifiedTime       uint16 // MS-DOS time
		ModifiedDate       uint16 // MS-DOS date
		CRC32              uint32
		CompressedSize     uint32 // deprecated; use CompressedSize64
		UncompressedSize   uint32 // deprecated; use UncompressedSize64
		CompressedSize64   uint64
		UncompressedSize64 uint64
		Extra              []byte
		ExternalAttrs      uint32 // Meaning depends on CreatorVersion
		Comment            string
	}

如果想生成UTF8编码的文件名, 可以手工指定该字段:

func main() {
	file, err := os.Create("中文-测试.zip")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	wzip := zip.NewWriter(file)
	defer func() {
		if err := wzip.Close(); err != nil {
			log.Fatal(err)
		}
	}()

	// 压缩文件
	var files = []struct{ Name, Body string }{
		{"11/1/readme.txt", "UTF8 字符串."},
		{"11/1/readme2.txt", "This archive contains some text files."},
		{"汉字/2/gopher.txt", "Gopher names:\nGeorge\nGeoffrey\nGonzo"},
		{"11/中文.txt", "中文Get animal handling licence.\nWrite more examples."},
		{"空目录/", ""},
	}
	for _, file := range files {
		header := &zip.FileHeader{
			Name:   file.Name,
			Flags:  1 << 11, // 使用utf8编码
			Method: zip.Deflate,
		}
		f, err := wzip.CreateHeader(header)
		if err != nil {
			log.Fatal(err)
		}
		_, err = f.Write([]byte(file.Body))
		if err != nil {
			log.Fatal(err)
		}
	}
}

其实, `zip.Create` 默认应该是假设文件名采用UTF8编码, 这样可以避免不同机器间本地编码不同导致的解码的问题.
针对该修改已经提交了 [CL54360043](https://codereview.appspot.com/54360043/), 目前还不清楚是否能够被接受.

不过比较遗憾的是Win7自带的zip浏览器始终是忽略该字段的(始终用本地编码处理).
