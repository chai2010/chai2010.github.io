---
title: "Go语言和Windows服务"
date: 2018-10-21
draft: true

tags: ["golang", "windows"]
categories: ["golang", "windows"]
---

Windows服务使您能够创建在后台Windows会话中可长时间运行的可执行应用程序。Windows服务可以在计算机启动时自动启动，管理员也可以临时暂停和重新启动服务。Windows服务非常适合运行一些需要长时间在后台运行的服务器程序，例如Web服务器等应用。

<!--more-->

Go语言的官方扩展包`"golang.org/x/sys/windows"`以及其子包对Windows服务提供了必要的支持。不过这个扩展包比较偏向底层使用比较繁琐，为了简化Windows服务的开发作者在此基础上封装了一个简化的`"github.com/chai2010/winsvc"`包。通过封装的`winsvc`包我们可以很容易构造一个windows服务。

## 简单的web服务

因为Windows服务一般是在后台长时间运行的程序，为了便于演示我们先构造一个简单的现实当前服务器时间的http服务程序。

```go
package main

import (
	"context"
	"net"
	"net/http"
	"time"
)

var (
	server *http.Server
)

func main() {
	StartServer()
}

func StartServer() {
	log.Println("StartServer, port = 8080")
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "winsrv server", time.Now())
	})

	server = &http.Server{Addr: ":8080"}
	server.ListenAndServe()
}

func StopServer() {
	if server != nil {
		server.Shutdown(context.Background()) // Go 1.8+
	}
	log.Println("StopServer")
}
```

其中，`StartServer`和`StopServer`函数分别对应服务的启动和停止操作。在这个程序中，`StopServer`函数并没有用到，我们只需要通过`CTRL+C`强制停止服务就可以了。但是对于Windows服务程序，我们不能用暴力的方式强制终止程序，因此需要封装一个程序可以主动停止的函数。

## Windows服务的运行环境

因为普通的程序无法处理Windows服务特有的消息，普通的Go程序也无法在服务模式运行。我们通过`"github.com/chai2010/winsvc"`包启动的服务可以吹Windows服务特有的消息，因此也就可以支持服务模式运行。同时Windows服务程序需要在后台长时间运行不能随意退出，普通的小程序是不能作为Windows服务来运行的。

如果要提供Windows服务模式的支持, main需要做适当调整:

```go
import (
	"github.com/chai2010/winsvc"
)

func main() {
	// run as service
	if !winsvc.IsAnInteractiveSession() {
		log.Println("main:", "runService")
		if err := winsvc.RunAsService("myserver", StartServer, StopServer, false); err != nil {
			log.Fatalf("svc.Run: %v\n", err)
		}
		return
	}

	// run as normal
	StartServer()
}
```

程序中通过`winsvc.IsAnInteractiveSession`来判断是否运行在交互模式，普通程序运行一般都是交互模式，windows服务则是运行在非交互模式。当程序处在非交互模式时，我们通过`winsvc.RunAsService`来运行服务，也就是以Windows服务的模式运行。同时该程序依然可以在普通模式下运行。

当程序运行在名为`myserver`服务模式时，提供对Windows服务相关消息的处理支持。可以通过管理员手工注册Windows服务，这时需要指定服务名称和服务程序的绝对路径。下面四个命令分别是注册服务、启动服务、停止服务、删除服务：

```
sc  create myserver binPath= "C:\path\to\myserver.exe -data-dir=C:\path\myserver.data"
net start  myserver
net stop   myserver
sc  delete myserver
```

因为Windows服务启动时并不需要登录用户帐号，因此程序不能引用普通帐号的环境变量，同时要尽量避免通过相对路径依赖当前目录。

## 自动注册服务

手工注释Windows服务比较繁琐，我们可以在程序的命令行参赛中增加自动注册服务的支持。

要在程序中将程序本身注册为服务，首先需要获取当前程序的绝对路径。我们可以通过`winsvc.GetAppPath()`来获取当前程序的绝对路径。同时，为了让服务程序在运行时有一个固定的当前目录，我们一般可以在启动的时候将当前目录切换到进程所在目录，这些工作可以在`init`函数中完成：

```go
var (
	appPath string // 程序的绝对路径
)

func init() {
	var err error
	if appPath, err = winsvc.GetAppPath(); err != nil {
		log.Fatal(err)
	}
	if err := os.Chdir(filepath.Dir(appPath)); err != nil {
		log.Fatal(err)
	}
}
```

注册服务可以通过`winsvc.InstallService`实现，注册服务是需要指定服务程序的路径和唯一服务的名称：

```go
func main() {
	if err := winsvc.InstallService(appPath, "myserver", "myserver service"); err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Done\n")
}
```

和注册服务相对应的是取消注册服务，取消注册服务可以通过`winsvc.RemoveService`实现，直接通过服务的名称就可以删除服务：

```go
func main() {
	if err := winsvc.RemoveService("myserver"); err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Done\n")
}
```

Windows服务在成功注册之后就可以以服务模式运行了，可以通过`winsvc.StartService`向服务发送启动消息：

```go
func main() {
	if err := winsvc.StartService("myserver"); err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Done\n")
}
```

对于已经在运行的Windows服务，可以通过`winsvc.StopService`向服务发送停止运行的命令。Windows服务在收到停止运行的命令后，会在程序退出之前调用`StopServer`函数，`StopServer`函数是在启动Windows服务时由`winsvc.RunAsService`函数参数指定。

```go
func main() {
	if err := winsvc.StopService("myserver"); err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Done\n")
}
```

现在我们可以将这些功能整合在一起，然后通过命令行参数来选择具体的命令。下面是完整的例子：


```go
var (
	appPath string

	flagServiceName = flag.String("service-name", "myserver", "Set service name")
	flagServiceDesc = flag.String("service-desc", "myserver service", "Set service description")

	flagServiceInstall   = flag.Bool("service-install", false, "Install service")
	flagServiceUninstall = flag.Bool("service-remove", false, "Remove service")
	flagServiceStart     = flag.Bool("service-start", false, "Start service")
	flagServiceStop      = flag.Bool("service-stop", false, "Stop service")
)

func init() {
	// change to current dir
	var err error
	if appPath, err = winsvc.GetAppPath(); err != nil {
		log.Fatal(err)
	}
	if err := os.Chdir(filepath.Dir(appPath)); err != nil {
		log.Fatal(err)
	}
}

func main() {
	flag.Parse()

	// install service
	if *flagServiceInstall {
		if err := winsvc.InstallService(appPath, *flagServiceName, *flagServiceDesc); err != nil {
			log.Fatalf("installService(%s, %s): %v\n", *flagServiceName, *flagServiceDesc, err)
		}
		fmt.Printf("Done\n")
		return
	}

	// remove service
	if *flagServiceUninstall {
		if err := winsvc.RemoveService(*flagServiceName); err != nil {
			log.Fatalln("removeService:", err)
		}
		fmt.Printf("Done\n")
		return
	}

	// start service
	if *flagServiceStart {
		if err := winsvc.StartService(*flagServiceName); err != nil {
			log.Fatalln("startService:", err)
		}
		fmt.Printf("Done\n")
		return
	}

	// stop service
	if *flagServiceStop {
		if err := winsvc.StopService(*flagServiceName); err != nil {
			log.Fatalln("stopService:", err)
		}
		fmt.Printf("Done\n")
		return
	}

	// run as service
	if !winsvc.InServiceMode() {
		log.Println("main:", "runService")
		if err := winsvc.RunAsService(*flagServiceName, StartServer, StopServer, false); err != nil {
			log.Fatalf("svc.Run: %v\n", err)
		}
		return
	}

	// run as normal
	StartServer()
}
```

假设程序构成的目标文件为`myserver.exe`，那么我们现在可以通过以下命令来分别注册服务、启动和停止服务、删除服务：

```
# 普通模式运行
$ go build -o myserver.exe myserver.go
$ myserver.exe

# 注册为Windows服务
$ myserver.exe -service-install

# 启动和停止Windows服务
$ myserver.exe -service-start
$ myserver.exe -service-stop

# 删除服务
# 删除之前需要先停止服务
$ myserver.exe -service-remove
```

在前面的章节中，我们演示过一个WebDAV的服务。读者可以尝试实现一个支持Windows后台服务模式运行的WebDAV的服务器。

