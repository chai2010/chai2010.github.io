---
layout: post
title: "Go语言的RPC介绍(含Protobuf-RPC)"
date: 2014-01-08 22:14:19 +0800
comments: true
categories: [go, rpc, protorpc, protobuf]
---

本文在 [Golang中国博客](http://blog.go-china.org/) 的地址: [http://blog.go-china.org/09-protorpc](http://blog.go-china.org/09-protorpc)

## 标准库的RPC

RPC是远程调用的简称, 简单的说就是要像调用本地函数一样调用服务器的函数.

Go语言的标准库已经提供了RPC框架和不同的RPC实现.

下面是一个服务器的例子:

	type Echo int
	
	func (t *Echo) Hi(args string, reply *string) error {
		*reply = "echo:" + args
		return nil
	}
	
	func main() {
		rpc.Register(new(Echo))
		rpc.HandleHTTP()
		l, e := net.Listen("tcp", ":1234")
		if e != nil {
			log.Fatal("listen error:", e)
		}
		http.Serve(l, nil)
	}

其中 `rpc.Register` 用于注册RPC服务, 默认的名字是对象的类型名字(这里是`Echo`). 如果需要指定特殊的名字, 可以用 `rpc.RegisterName` 进行注册.

被注册对象的类型所有满足以下规则的方法会被导出到RPC服务接口:

	func (t *T) MethodName(argType T1, replyType *T2) error

被注册对应至少要有一个方法满足这个特征, 否则可能会注册失败.

然后 `rpc.HandleHTTP` 用于指定 RPC 的传输协议, 这里是采用 http 协议作为RPC调用的载体. 用户也可以用`rpc.ServeConn`接口, 定制自己的传输协议. 

客户端可以这样调用`Echo.Hi`接口:

	func main() {
		client, err := rpc.DialHTTP("tcp", "127.0.0.1:1234")
		if err != nil {
			log.Fatal("dialing:", err)
		}
	
		var args = "hello rpc"
		var reply string
		err = client.Call("Echo.Hi", args, &reply)
		if err != nil {
			log.Fatal("arith error:", err)
		}
		fmt.Printf("Arith: %d*%d=%d\n", args.A, args.B, reply)
	}

客户端先用`rpc.DialHTTP`和RPC服务器进行一个链接(协议必须匹配).

然后通过返回的`client`对象进行远程函数调用. 函数的名字是由`client.Call` 第一个参数指定(是一个字符串).

基于HTTP的RPC调用一般是在调试时使用, 默认可以通过浏览`"127.0.0.1:1234/debug/rpc"`页面查看RPC的统计信息.

## 基于 JSON 的 RPC 调用

在上面的RPC例子中, 我们采用了默认的HTTP协议作为RPC调用的传输载体.

因为内置`net/rpc`包接口设计的缺陷, 我们无法使用`jsonrpc`等定制的编码作为`rpc.DialHTTP`的底层协议. 如果需要让`jsonrpc`支持`rpc.DialHTTP`函数, 需要调整rpc的接口.

以前有个[Issue2738](https://code.google.com/p/go/issues/detail?id=2738)是针对这个问题. 我曾提交的 [CL10704046](https://codereview.appspot.com/10704046/) 补丁用于修复这个问题. 不过因为涉及到增加rpc的接口, 官方没有接受(因为自己重写一个`DialHTTP`会更简单).

除了传输协议, 还有可以指定一个RPC编码协议, 用于编码/节目RPC调用的函数参数和返回值. RPC调用不指定编码协议时, 默认采用Go语言特有的`gob`编码协议.

因为, 其他语言一般都不支持Go语言的`gob`协议, 因此如果需要跨语言RPC调用就需要
采用通用的编码协议.

Go的标准库还提供了一个`"net/rpc/jsonrpc"`包, 用于提供基于JSON编码的RPC支持.

服务器部分只需要用`rpc.ServeCodec`指定json编码协议就可以了:


	func main() {
		lis, err := net.Listen("tcp", ":1234")
		if err != nil {
			return err
		}
		defer lis.Close()
	
		srv := rpc.NewServer()
		if err := srv.RegisterName("Echo", new(Echo)); err != nil {
			return err
		}
	
		for {
			conn, err := lis.Accept()
			if err != nil {
				log.Fatalf("lis.Accept(): %v\n", err)
			}
			go srv.ServeCodec(jsonrpc.NewServerCodec(conn))
		}
	}

客户端部分值需要用 `jsonrpc.Dial` 代替 `rpc.Dial` 就可以了:

	func main() {
		client, err := jsonrpc.DialHTTP("tcp", "127.0.0.1:1234")
		if err != nil {
			log.Fatal("dialing:", err)
		}
		...
	}


如果需要在其他语言中使用`jsonrpc`和Go语言进行通讯, 需要封装一个和`jsonrpc`
匹配的库.

关于`jsonrpc`的实现细节这里就不展开讲了, 感兴趣的话可以参考这篇文章: [JSON-RPC: a tale of interfaces](http://blog.golang.org/json-rpc-tale-of-interfaces).

## 基于 Protobuf 的 RPC 调用

[Protobuf](http://code.google.com/p/protobuf/;) 是 Google 公司开发的编码协议. 它的优势是编码后的数据体积比较小(并不是压缩算法), 比较适合用于命令的传输编码. 

Protobuf 官方团队提供 Java/C++/Python 几个语言的支持, Go语言的版本由Go团队提供支持, 其他语言由第三方支持.

Protobuf 的语言规范中可以定义RPC接口. 但是在Go语言和C++版本的Protobuf中都没有生成RPC的实现.

不过作者在 Go语言版本的Protobuf基础上开发了 RPC 的实现 [protorpc](https://code.google.com/p/protorpc/), 同时提供的 `protoc-gen-go`命令可以生成相应的RPC代码. 项目地址: [https://code.google.com/p/protorpc/](https://code.google.com/p/protorpc/)

该实现支持Go语言和C++语言, 在Protobuf官方wiki的第三方RPC实现列表中有介绍: [https://code.google.com/p/protobuf/wiki/ThirdPartyAddOns#RPC_Implementations](https://code.google.com/p/protobuf/wiki/ThirdPartyAddOns#RPC_Implementations)

要使用 [protorpc](https://code.google.com/p/protorpc/), 需要先在proto文件定义接口(`arith.pb/arith.proto`):

	package arith;

	// go use cc_generic_services option
	option cc_generic_services = true;

	message ArithRequest {
		optional int32 a = 1;
		optional int32 b = 2;
	}

	message ArithResponse {
		optional int32 val = 1;
		optional int32 quo = 2;
		optional int32 rem = 3;
	}

	service ArithService {
		rpc multiply (ArithRequest) returns (ArithResponse);
		rpc divide (ArithRequest) returns (ArithResponse);
	}

[protorpc](https://code.google.com/p/protorpc/)使用`cc_generic_services`选择控制是否输出RPC代码. 因此, 需要设置`cc_generic_services`为`true`.

然后下载 [protoc-2.5.0-win32.zip](https://code.google.com/p/protobuf/downloads/list), 解压后可以得到一个 `protoc.exe` 的编译命令.

然后使用下面的命令获取 [protorpc](https://code.google.com/p/protorpc/) 和对应的 `protoc-gen-go` 插件.

	go get code.google.com/p/protorpc
	go get code.google.com/p/protorpc/protoc-gen-go

需要确保 `protoc.exe` 和 `protoc-gen-go.exe` 都在 `$PATH` 中. 然后运行以下命令将前面的接口文件转换为Go代码:

	cd arith.pb && protoc --go_out=. arith.proto

新生成的文件为`arith.pb/arith.pb.go`.

下面是基于 Protobuf-RPC 的服务器:

	package main

	import (
		"errors"

		"code.google.com/p/goprotobuf/proto"

		"./arith.pb"
	)

	type Arith int

	func (t *Arith) Multiply(args *arith.ArithRequest, reply *arith.ArithResponse) error {
		reply.Val = proto.Int32(args.GetA() * args.GetB())
		return nil
	}

	func (t *Arith) Divide(args *arith.ArithRequest, reply *arith.ArithResponse) error {
		if args.GetB() == 0 {
			return errors.New("divide by zero")
		}
		reply.Quo = proto.Int32(args.GetA() / args.GetB())
		reply.Rem = proto.Int32(args.GetA() % args.GetB())
		return nil
	}

	func main() {
		arith.ListenAndServeArithService("tcp", ":1984", new(Arith))
	}

其中导入的 `"./arith.pb"` 的名字为 `arith`, 在 `arith.pb/arith.proto` 文件中定义(这2个可能不同名, 导入时要小心).

`arith.ArithRequest`和`arith.ArithResponse`是RPC接口的输入和输出参数, 也是在在 `arith.pb/arith.proto` 文件中定义的.

同时生成的还有一个`arith.ListenAndServeArithService`函数, 用于启动RPC服务. 该函数的第三个参数是RPC的服务对象, 必须要满足 `arith.EchoService` 接口的定义.

客户端的使用也很简单, 只要一个 `arith.DialArithService` 就可以链接了:

	stub, client, err := arith.DialArithService("tcp", "127.0.0.1:1984")
	if err != nil {
		log.Fatal(`arith.DialArithService("tcp", "127.0.0.1:1984"):`, err)
	}
	defer client.Close()

`arith.DialArithService` 返回了一个 `stub` 对象, 该对象已经绑定了RPC的各种方法, 可以直接调用(不需要用字符串指定方法名字):

	var args ArithRequest
	var reply ArithResponse

	args.A = proto.Int32(7)
	args.B = proto.Int32(8)
	if err = stub.Multiply(&args, &reply); err != nil {
		log.Fatal("arith error:", err)
	}
	fmt.Printf("Arith: %d*%d=%d", args.GetA(), args.GetB(), reply.GetVal())

相比标准的RPC的库, [protorpc](https://code.google.com/p/protorpc/) 由以下几个优点:

1. 采用标准的Protobuf协议, 便于和其他语言交互
2. 自带的 `protoc-gen-go` 插件可以生成RPC的代码, 简化使用
3. 服务器注册和调用客户端都是具体类型而不是字符串和`interface{}`, 这样可以由编译器保证安全
4. 底层采用了`snappy`压缩传输的数据, 提高效率

不足之处是使用流程比标准RPC要繁复(需要将proto转换为Go代码).

## C++ 调用 Go 提供的 Protobuf-RPC 服务

[protorpc](https://code.google.com/p/protorpc/) 同时也提供了 C++ 语言的实现.

C++版本的安装如下:

1. `hg clone https://code.google.com/p/protorpc.cxx/`
2. `cd protorpc.cxx`
3. build with cmake

C++ 版本 的 [protorpc](https://code.google.com/p/protorpc/) 对 `protoc.exe` 扩展了一个
`--cxx_out` 选项, 用于生成RPC的代码:

	${protorpc_root}/protobuf/bin/protoc --cxx_out=. arith.proto

*注:`--cxx_out` 选项生成的代码除了RPC支持外, 还有xml的序列化和反序列化支持.*

下面是 C++ 的客户端链接 Go 语言版本的 服务器:

	#include "arith.pb.h"
	
	#include <google/protobuf/rpc/rpc_server.h>
	#include <google/protobuf/rpc/rpc_client.h>
	
	int main() {
	  ::google::protobuf::rpc::Client client("127.0.0.1", 1234);
	
	  service::ArithService::Stub arithStub(&client);
	
	  ::service::ArithRequest arithArgs;
	  ::service::ArithResponse arithReply;
	  ::google::protobuf::rpc::Error err;
	
	  // EchoService.mul
	  arithArgs.set_a(3);
	  arithArgs.set_b(4);
	  err = arithStub.multiply(&arithArgs, &arithReply);
	  if(!err.IsNil()) {
	    fprintf(stderr, "arithStub.multiply: %s\n", err.String().c_str());
	    return -1;
	  }
	  if(arithReply.c() != 12) {
	    fprintf(stderr, "arithStub.multiply: expected = %d, got = %d\n", 12, arithReply.c());
	    return -1;
	  }
	
	  printf("Done.\n");
	  return 0;
	}

详细的使用说明请参考: [README.md](https://code.google.com/p/protorpc/source/browse/README.md?repo=cxx) .
更多的例子请参考: [rpcserver.cc](http://code.google.com/p/protorpc/source/browse/tests/rpctest/rpcserver.cc?repo=cxx)
和 [rpcclient.cc](http://code.google.com/p/protorpc/source/browse/tests/rpctest/rpcclient.cc?repo=cxx)

## 总结

Go语言的RPC客户端是一个使用简单, 而且功能强大的RPC库. 基于标准的RPC库我们可以方便的定制自己的RPC实现(传输协议和串行化协议都可以定制).

不过在开发 [protorpc](https://code.google.com/p/protorpc/) 的过程中也发现了`net/rpc`包的一些不足之处:

- 内置的`HTTP`协议的RPC的串行化协议和传输协议耦合过于紧密, 用户扩展的协议无法支持内置的`HTTP`传输协议(因为`rpc.Server`和`rpc.Client`接口缺陷导致的问题)
- `rpc.Server` 只能注册 `rpc.ServerCodec`, 而不能注册工厂函数. 而`jsonrpc.NewServerCodec`需要依赖先建立链接(`conn`参数), 这样导致了`HTTP`协议只能支持内置的`gob`协议
- `rpc.Client` 的问题和 `rpc.Server` 类似

因为Go1需要保证API的兼容性, 因此上述的问题只能希望在未来的Go2能得到改善.

