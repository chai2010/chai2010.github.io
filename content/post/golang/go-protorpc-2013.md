---
title: "在Go语言中使用 Protobuf-RPC"
date: 2013-04-25
draft: false

tags: ["golang", "protobuf", "rpc"]
categories: [golang]
---

Go语言版本的Protobuf-RPC基本算完成了. 现在简单说下使用方法.

# 安装测试环境

先下载代码(不支持`go get`):

	hg clone https://bitbucket.org/chai2010/gopath

然后下载后的目录设置为`GOPATH`, 并添加`$GOPATH/bin`到`PATH`环境变量.

在`$GOPATH/bin`中已经包含了Windows下的`2.4.1`版本的`protoc.exe`. 如果是`Linux`等系统, 请自行下载并安装`protoc`程序.

安装`protoc.exe`的Go语言插件:

	go install encoding/protobuf/protoc-gen-go

该插件是基于`code.google.com/p/goprotobuf/protoc-gen-go`实现, 主要增加了`encoding/protobuf/protoc-gen-go/generator/service.go`文件, 用于`RPC`的代码生成. 生成的`RPC`代码依赖`net/rpc/protorpc`, 这个包是`Protobuf-RPC`的底层实现, 可以单独使用.

现在可以运行一下测试程序:

	C:\>go test net/rpc/protorpc/service.pb
	ok      net/rpc/protorpc/service.pb     2.123s

测试通过, 继续.

------

# 编译 proto 文件

创建一个名为`pbrpc`的工作目录, 再创建`pbrpc/arith.pb`的子目录.
将`net/rpc/protorpc/service.pb/service.proto`文件复制到`pbrpc/arith.pb`的子目录.

包名字改为`arith`, 文件`arith.proto`的内容如下:

	package arith;

	option cc_generic_services = true;
	option java_generic_services = true;
	option py_generic_services = true;

	message ArithRequest {
		optional int32 a = 1;
		optional int32 b = 2;
	}

	message ArithResponse {
		optional int32 c = 1;
	}

	service ArithService {
		rpc add (ArithRequest) returns (ArithResponse);
		rpc mul (ArithRequest) returns (ArithResponse);
		rpc div (ArithRequest) returns (ArithResponse);
		rpc error (ArithRequest) returns (ArithResponse);
	}

主要是定义了一个`ArithService`接口. 要注意的是`cc_generic_services`/`java_generic_services`, `py_generic_services`几个选项.
我前提提到的`protoc-gen-go`在生成代码的时候, 这3个选项至少要有一个为`true`, 才会生成`RPC`的代码.

当然, 如果不生成`RPC`代码的话, 也是可以单独使用`net/rpc/protorpc`包的. 不过`protoc-gen-go`生成的代码会简便很多.

进入`pbrpc/arith.pb`的子目录, 编译`arith.proto`文件:

	protoc --go_out=. arith.proto

生成 `arith.pb.go` 文件, 其中`RPC`的代码主要是下面这些:

	type ArithService interface {
		Add(in *ArithRequest, out *ArithResponse) error
		Mul(in *ArithRequest, out *ArithResponse) error
		Div(in *ArithRequest, out *ArithResponse) error
		Error(in *ArithRequest, out *ArithResponse) error
	}

	// RegisterArithService publish the given ArithService implementation on the server.
	func RegisterArithService(srv *rpc.Server, x ArithService) error {
		if err := srv.RegisterName("ArithService", x); err != nil {
			return err
		}
		return nil
	}

	// ServeArithService serves the given ArithService implementation on conn.
	func ServeArithService(conn io.ReadWriteCloser, x ArithService) error {
		srv := rpc.NewServer()
		if err := srv.RegisterName("ArithService", x); err != nil {
			return err
		}
		srv.ServeCodec(protorpc.NewServerCodec(conn))
		return nil
	}

	// ListenAndServeArithService listen announces on the local network address laddr
	// and serves the given ArithService implementation.
	func ListenAndServeArithService(network, addr string, x ArithService) error {
		clients, err := net.Listen(network, addr)
		if err != nil {
			return err
		}
		srv := rpc.NewServer()
		if err := srv.RegisterName("ArithService", x); err != nil {
			return err
		}
		for {
			conn, err := clients.Accept()
			if err != nil {
				return err
			}
			go srv.ServeCodec(protorpc.NewServerCodec(conn))
		}
		panic("unreachable")
	}

	type rpcArithServiceStub struct {
		*rpc.Client
	}

	func (c *rpcArithServiceStub) Add(in *ArithRequest, out *ArithResponse) error {
		return c.Call("ArithService.Add", in, out)
	}
	func (c *rpcArithServiceStub) Mul(in *ArithRequest, out *ArithResponse) error {
		return c.Call("ArithService.Mul", in, out)
	}
	func (c *rpcArithServiceStub) Div(in *ArithRequest, out *ArithResponse) error {
		return c.Call("ArithService.Div", in, out)
	}
	func (c *rpcArithServiceStub) Error(in *ArithRequest, out *ArithResponse) error {
		return c.Call("ArithService.Error", in, out)
	}

	// DialArithService connects to an ArithService at the specified network address.
	func DialArithService(network, addr string) (*rpc.Client, ArithService, error) {
		conn, err := net.Dial(network, addr)
		if err != nil {
			return nil, nil, err
		}
		c, srv := NewArithServiceClient(conn)
		return c, srv, nil
	}

	// NewArithServiceClient returns a ArithService rpc.Client and stub to handle
	// requests to the set of ArithService at the other end of the connection.
	func NewArithServiceClient(conn io.ReadWriteCloser) (*rpc.Client, ArithService) {
		c := rpc.NewClientWithCodec(protorpc.NewClientCodec(conn))
		return c, &rpcArithServiceStub{c}
	}

	// NewArithServiceStub returns a ArithService stub to handle rpc.Client.
	func NewArithServiceStub(c *rpc.Client) ArithService {
		return &rpcArithServiceStub{c}
	}

其中生成的服务器端的代码有: `ListenAndServeArithService`, `ServeArithService`, `RegisterArithService`.
生成的客户端的接口有: `DialArithService`, `NewArithServiceClient`, `NewArithServiceStub`.
其中`RPC`接口对应`ArithService`接口.

------

# 编写测试代码

在`pbrpc`目录创建`rpc_server.go`文件, 代码如下:

	package main

	import (
		"encoding/protobuf/proto"
		"errors"

		"./arith.pb"
	)

	type Arith int

	func (t *Arith) Add(args *arith.ArithRequest, reply *arith.ArithResponse) error {
		reply.C = proto.Int32(args.GetA() + args.GetB())
		return nil
	}

	func (t *Arith) Mul(args *arith.ArithRequest, reply *arith.ArithResponse) error {
		reply.C = proto.Int32(args.GetA() * args.GetB())
		return nil
	}

	func (t *Arith) Div(args *arith.ArithRequest, reply *arith.ArithResponse) error {
		if args.GetB() == 0 {
			return errors.New("divide by zero")
		}
		reply.C = proto.Int32(args.GetA() / args.GetB())
		return nil
	}

	func (t *Arith) Error(args *arith.ArithRequest, reply *arith.ArithResponse) error {
		return errors.New("ArithError")
	}

	func main() {
		arith.ListenAndServeArithService("tcp", ":1234", new(Arith))
	}

最关键的是`arith.ListenAndServeArithService("tcp", ":1234", new(Arith))`. 当然, 也可以使用`RegisterArithService`或`ServeArithService`等接口进行定制.

然后在`pbrpc`创建`rpc_client.go`对应客户端, 代码如下:

	package main

	import (
		"encoding/protobuf/proto"
		"log"

		"./arith.pb"
	)

	func main() {
		// client
		client, stub, err := arith.DialArithService("tcp", "127.0.0.1:1234")
		if err != nil {
			log.Fatalf(`arith.DialArithService("tcp", "127.0.0.1:1234"): %v`, err)
		}
		defer client.Close()

		var args arith.ArithRequest
		var reply arith.ArithResponse

		// Add
		args.A = proto.Int32(1)
		args.B = proto.Int32(2)
		if err = stub.Add(&args, &reply); err != nil {
			log.Fatalf(`arith.Add: %v`, err)
		}
		if reply.GetC() != 3 {
			log.Fatalf(`arith.Add: expected = %d, got = %d`, 3, reply.GetC())
		}

		// Mul
		args.A = proto.Int32(2)
		args.B = proto.Int32(3)
		if err = stub.Mul(&args, &reply); err != nil {
			log.Fatalf(`arith.Mul: %v`, err)
		}
		if reply.GetC() != 6 {
			log.Fatalf(`arith.Mul: expected = %d, got = %d`, 6, reply.GetC())
		}

		// Div
		args.A = proto.Int32(13)
		args.B = proto.Int32(5)
		if err = stub.Div(&args, &reply); err != nil {
			log.Fatalf(`arith.Div: %v`, err)
		}
		if reply.GetC() != 2 {
			log.Fatalf(`arith.Div: expected = %d, got = %d`, 2, reply.GetC())
		}

		// Div zero
		args.A = proto.Int32(1)
		args.B = proto.Int32(0)
		if err = stub.Div(&args, &reply); err.Error() != "divide by zero" {
			log.Fatalf(`arith.Error: expected = %s, got = %s`, "divide by zero", err.Error())
		}

		// Error
		args.A = proto.Int32(1)
		args.B = proto.Int32(2)
		if err = stub.Error(&args, &reply); err.Error() != "ArithError" {
			log.Fatalf(`arith.Error: expected = %s, got = %s`, "ArithError", err.Error())
		}

		log.Printf("Done")
	}

然后就可以启动服务, 并测试客户端了.


