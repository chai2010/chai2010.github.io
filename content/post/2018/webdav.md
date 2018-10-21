---
title: "Go语言实现WebDAV文件系统"
date: 2018-10-21
draft: true

tags: ["golang", "webdav"]
categories: ["golang", "webdav"]
---

WebDAV （Web-based Distributed Authoring and Versioning） 是一种基于 HTTP 1.1协议的通信协议。它扩展了HTTP 1.1，在GET、POST、HEAD等几个HTTP标准方法以外添加了一些新的方法，使应用程序可对Web Server直接读写，并支持写文件锁定(Locking)及解锁(Unlock)，还可以支持文件的版本控制。

<!--more-->

使用WebDAV可以完成的工作包括：

- 特性（元数据）处理。可以使用WebDAV中的PROPFIND和PROPPATCH方法可创建、删除和查询有关文件的信息，例如作者和创建日期。
- 集合和资源的管理。可以使用GET、PUT、DELETE和MKCOL方法创建文档集合并检索分层结构成员列表（类似于文件系统中的目录）。
- 锁定。可以禁止多人同时对一个文档进行操作。这将有助于防止出现“丢失更新”（更改被覆盖）的问题。
- 名称空间操作。您可以使用COPY和MOVE方法让服务器复制和删除相关资源。

目前常见的NAS都提供WebDAV服务功能，很多手机应用也是通过WebDAV协议来实现应用间的文件共享。要提供自己的WebDAV服务首先要安装相应的软件。macOS下可以从App Store中安装免费的WebDAVNav Server软件。WebDAVNav Server服务启动界面如下：

![](/images/webdav/webdavnav-server.png)

本节我们尝试用Go语言实现自己的WebDAV服务。

## WebDAV对HTTP的扩展

WebDAV扩展了HTTP/1.1协议。它定义了新的HTTP标头，客户机可以通过这些新标头传递WebDAV特有的资源请求。这些标头为：

- Destination:
- Lock-Token:
- Timeout:
- DAV:
- If:
- Depth:
- Overwrite:

同时，WebDAV标准还引入了若干新HTTP方法，用于告知启用了WebDAV的服务器如何处理请求。这些方法是对现有方法（例如 GET、PUT和DELETE）的补充，可用来执行WebDAV事务。下面是这些新HTTP方法的介绍：

- LOCK。锁定资源，使用 Lock-Token: 标头。
- UNLOCK。解除锁定，使用 Lock-Token: 标头。
- PROPPATCH。设置、更改或删除单个资源的特性。
- PROPFIND。用于获取一个或多个资源的一个或多个特性信息。该请求可能会包含一个值为 0、1或infinity的Depth: 标头。其中，0表示指定将获取指定URI处的集合的特性（也就是该文件或目录）；1表示指定将获取该集合以及位于该指定URI之下与其紧邻的资源的特性（非嵌套的子目录或子文件）；infinity表示指定将获取全部子目录或子文件（深度过大会加重对服务器的负担）。
- COPY。复制资源，可以使用 Depth: 标头移动资源，使用 Destination: 标头指定目标。如果需要，COPY 方法也使用 Overwrite: 标头。
- MOVE。移动资源，可以使用 Depth: 标头移动资源，使用 Destination: 标头指定目标。如果需要，MOVE 方法也使用 Overwrite: 标头。
- MKCOL。用于创建新集合（对应目录）。


## 最简的WebDAV服务

Go语言扩展包 `golang.org/x/net/webdav` 提供了WebDAV服务的支持。其中webdav.Handler实现了http.Handle接口，用处理WebDAV特有的http请求。要构造webdav.Handler对象的话，我们至少需要指定一个文件系统和锁服务。其中webdav.Dir将本地的文件系统映射为WebDAV的文件系统，webdav.NewMemLS则是基于本机内存构造一个锁服务。

下面是最简单的WebDAV服务实现：

```go
package main

import (
	"net/http"

	"golang.org/x/net/webdav"
)

func main() {
	http.ListenAndServe(":8080", &webdav.Handler{
		FileSystem: webdav.Dir("."),
		LockSystem: webdav.NewMemLS(),
	})
}
```

运行之后，当前目录就可以通过WebDAV方式访问了。

## 只读的WebDAV服务

前面实现的WebDAV服务默认不需要任何密码就可以访问文件系统，任何匿名的用户可以添加、修改、删除文件，这对于网络服务来说太不安全了。

为了防止被用户无意或恶意修改，我们可以关闭WebDAV的修改功能。参考WebDAV协议规范可知，修改相关的操作主要涉及PUT/DELETE/PROPPATCH/MKCOL/COPY/MOVE等几个方法。我们只要将这几个方法屏蔽了就可以实现一个只读的WebDAV服务。


```go
func main() {
	fs := &webdav.Handler{
		FileSystem: webdav.Dir("."),
		LockSystem: webdav.NewMemLS(),
	}

	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		switch req.Method {
		case "PUT", "DELETE", "PROPPATCH", "MKCOL", "COPY", "MOVE":
			http.Error(w, "WebDAV: Read Only!!!", http.StatusForbidden)
			return
		}

		fs.ServeHTTP(w, req)
	})

	http.ListenAndServe(":8080", nil)
}
```

我们通过http.HandleFunc重新包装了fs.ServeHTTP方法，然后将和更新相关的操作屏蔽掉。这样我们就实现了一个只读的WebDAV服务。

## 密码认证WebDAV服务

WebDAV是基于HTTP协议扩展的标准，我们可以通过HTTP的基本认证机制设置用户名和密码。

```go
func main() {
	fs := &webdav.Handler{
		FileSystem: webdav.Dir("."),
		LockSystem: webdav.NewMemLS(),
	}

	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		// 获取用户名/密码
		username, password, ok := req.BasicAuth()
		if !ok {
			w.Header().Set("WWW-Authenticate", `Basic realm="Restricted"`)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		// 验证用户名/密码
		if username != "user" || password != "123456" {
			http.Error(w, "WebDAV: need authorized!", http.StatusUnauthorized)
			return
		}

		fs.ServeHTTP(w, req)
	})

	http.ListenAndServe(":8080", nil)
}
```

我们通过req.BasicAuth来获取用户名和密码，然后进行验证。如果没有设置用户名和密码，则返回一个http.StatusUnauthorized状态，HTTP客户端会弹出让用户输入密码的窗口。

由于HTTP协议并没有加密，因此用户名和密码也是明文传输。为了更安全，我们可以选择用HTTPS协议提供WebDAV服务。为此，我们需要准备一个证书文件（crypto/tls包中的generate_cert.go程序可以生成证书），然后用http.ListenAndServeTLS来启动https服务。


同时需要注意的是，从Windows Vista起，微软就禁用了http形式的基本WebDAV验证形式(KB841215)，默认必须使用https连接。可以在Windows Vista/7/8中，改注册表:

	HKEY_LOCAL_MACHINE>>SYSTEM>>CurrentControlSet>>Services>>WebClient>>Parameters>>BasicAuthLevel

把这个值从1改为2，然后进控制面板/服务，把WebClient服务重启。

## 浏览器视图

WebDAV是基于HTTP协议，理论上从浏览器访问WebDAV服务器会更简单。但是，当我们在浏览器中访问WebDAV服务的根目录之后，收到了“Method Not Allowed”错误信息。

这是因为，根据WebDAV协议规范，http的GET方法只能用于获取文件。在Go语言实现的webdav库中，如果用GET访问一个目录，会返回一个http.StatusMethodNotAllowed状态码，对应“Method Not Allowed”错误信息。

为了支持浏览器删除目录列表，我们对针对目录的GET操作单独生成html页面：

```go
func main() {
	fs := &webdav.Handler{
		FileSystem: webdav.Dir("."),
		LockSystem: webdav.NewMemLS(),
	}

	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		if req.Method == "GET" && handleDirList(fs.FileSystem, w, req) {
			return
		}

		fs.ServeHTTP(w, req)
	})

	http.ListenAndServe(":8080", nil)
}
```

其中，handleDirList函数用于处理目录列表，然后返回ture。handleDirList的实现如下：

```go
func handleDirList(fs webdav.FileSystem, w http.ResponseWriter, req *http.Request) bool {
	ctx := context.Background()

	f, err := fs.OpenFile(ctx, req.URL.Path, os.O_RDONLY, 0)
	if err != nil {
		return false
	}
	defer f.Close()

	if fi, _ := f.Stat(); fi != nil && !fi.IsDir() {
		return false
	}

	dirs, err := f.Readdir(-1)
	if err != nil {
		log.Print(w, "Error reading directory", http.StatusInternalServerError)
		return false
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprintf(w, "<pre>\n")
	for _, d := range dirs {
		name := d.Name()
		if d.IsDir() {
			name += "/"
		}
		fmt.Fprintf(w, "<a href=\"%s\">%s</a>\n", name, name)
	}
	fmt.Fprintf(w, "</pre>\n")
	return true
}
```

现在可以通过浏览器来访问WebDAV目录列表了。


## 实用的WebDAV服务

为了构造实用的WebDAV服务，我们通过命令行参数设置相关信息，同时将前面的功能整合起来。

```go
package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"golang.org/x/net/context"
	"golang.org/x/net/webdav"
)

var (
	flagRootDir   = flag.String("dir", "", "webdav root dir")
	flagHttpAddr  = flag.String("http", ":80", "http or https address")
	flagHttpsMode = flag.Bool("https-mode", false, "use https mode")
	flagCertFile  = flag.String("https-cert-file", "cert.pem", "https cert file")
	flagKeyFile   = flag.String("https-key-file", "key.pem", "https key file")
	flagUserName  = flag.String("user", "", "user name")
	flagPassword  = flag.String("password", "", "user password")
	flagReadonly  = flag.Bool("read-only", false, "read only")
)

func init() {
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage of WebDAV Server\n")
		flag.PrintDefaults()
		fmt.Fprintf(os.Stderr, "\nReport bugs to <chaishushan{AT}gmail.com>.\n")
	}
}

func main() {
	flag.Parse()

	fs := &webdav.Handler{
		FileSystem: webdav.Dir(*flagRootDir),
		LockSystem: webdav.NewMemLS(),
	}

	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		if *flagUserName != "" && *flagPassword != "" {
			username, password, ok := req.BasicAuth()
			if !ok {
				w.Header().Set("WWW-Authenticate", `Basic realm="Restricted"`)
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			if username != *flagUserName || password != *flagPassword {
				http.Error(w, "WebDAV: need authorized!", http.StatusUnauthorized)
				return
			}
		}

		if req.Method == "GET" && handleDirList(fs.FileSystem, w, req) {
			return
		}

		if *flagReadonly {
			switch req.Method {
			case "PUT", "DELETE", "PROPPATCH", "MKCOL", "COPY", "MOVE":
				http.Error(w, "WebDAV: Read Only!!!", http.StatusForbidden)
				return
			}
		}

		fs.ServeHTTP(w, req)
	})

	if *flagHttpsMode {
		http.ListenAndServeTLS(*flagHttpAddr, *flagCertFile, *flagKeyFile, nil)
	} else {
		http.ListenAndServe(*flagHttpAddr, nil)
	}
}

func handleDirList(fs webdav.FileSystem, w http.ResponseWriter, req *http.Request) bool {
	// 参考前面的代码
}
```

显示帮助信息：

```
go run main.go -h
Usage of WebDAV Server
  -dir string
    	webdav root dir
  -http string
    	http or https address (default ":80")
  -https-cert-file string
    	https cert file (default "cert.pem")
  -https-key-file string
    	https key file (default "key.pem")
  -https-mode
    	use https mode
  -password string
    	user password
  -read-only
    	read only
  -user string
    	user name

Report bugs to <chaishushan{AT}gmail.com>.
```

以下命令以Https启动一个WebDAV服务，对应本机的Go语言安装目录，同时设置用户名和密码：

```
go run main.go -https-mode -user=user -password=123456 -dir=/usr/local/go
```

下面是在iPod上通过WebDANNav+应用通过WebDAV协议访问/usr/local/go的预览图：

![](/images/webdav/ios-webdav-01.png)
