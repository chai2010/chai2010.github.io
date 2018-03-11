---
layout: post
title: "Go语言如何安全退出"
date: 2013-05-05 17:52:04 +0800
comments: true
categories: [go]
---

这是一个英文博客提到的方法, 有人已经翻译为中文:

- 英文: http://rcrowley.org/articles/golang-graceful-stop.html
- 中文: http://www.oschina.net/translate/golang-graceful-stop

原代码有几个地方有点问题:

- `s.waitGroup.Add(1)`需要在`goroutine`启动之前调用(否则可能丢失信息)
- `signal.Notify`的`ch`信道是阻塞的(`signal.Notify`不会阻塞发送信号), 需要设置缓冲
- `defer conn.Close()`可能不会被执行到

调整后的代码:

	package main
	
	import (
		"log"
		"net"
		"os"
		"os/signal"
		"sync"
		"syscall"
		"time"
	)
	
	// An uninteresting service.
	type Service struct {
		ch        chan bool
		waitGroup *sync.WaitGroup
	}
	
	// Make a new Service.
	func NewService() *Service {
		return &Service{
			ch:        make(chan bool),
			waitGroup: &sync.WaitGroup{},
		}
	}
	
	// Accept connections and spawn a goroutine to serve each one.  Stop listening
	// if anything is received on the service's channel.
	func (s *Service) Serve(listener *net.TCPListener) {
		s.waitGroup.Add(1)
		go func() {
			defer s.waitGroup.Done()
			for {
				select {
				case <-s.ch:
					log.Println("stopping listening on", listener.Addr())
					listener.Close()
					return
				default:
				}
				listener.SetDeadline(time.Now().Add(1e9))
				conn, err := listener.AcceptTCP()
				if nil != err {
					if opErr, ok := err.(*net.OpError); ok && opErr.Timeout() {
						continue
					}
					log.Println(err)
				}
				log.Println(conn.RemoteAddr(), "connected")
				s.serve(conn)
			}
		}()
	}
	
	// Stop the service by closing the service's channel.  Block until the service
	// is really stopped.
	func (s *Service) Stop() {
		close(s.ch)
		s.waitGroup.Wait()
	}
	
	// Serve a connection by reading and writing what was read.  That's right, this
	// is an echo service.  Stop reading and writing if anything is received on the
	// service's channel but only after writing what was read.
	func (s *Service) serve(conn *net.TCPConn) {
		s.waitGroup.Add(1)
		go func() {
			defer s.waitGroup.Done()
			defer conn.Close()
	
			for {
				select {
				case <-s.ch:
					log.Println("disconnecting", conn.RemoteAddr())
					return
				default:
				}
				conn.SetDeadline(time.Now().Add(1e9))
				buf := make([]byte, 4096)
				if _, err := conn.Read(buf); nil != err {
					if opErr, ok := err.(*net.OpError); ok && opErr.Timeout() {
						continue
					}
					log.Println(err)
					return
				}
				if _, err := conn.Write(buf); nil != err {
					log.Println(err)
					return
				}
			}
		}()
	}
	
	func main() {
		// Listen on 127.0.0.1:48879.  That's my favorite port number because in
		// hex 48879 is 0xBEEF.
		laddr, err := net.ResolveTCPAddr("tcp", "127.0.0.1:48879")
		if nil != err {
			log.Fatalln(err)
		}
		listener, err := net.ListenTCP("tcp", laddr)
		if nil != err {
			log.Fatalln(err)
		}
		log.Println("listening on", listener.Addr())
	
		// Make a new service and send it into the background.
		service := NewService()
		service.Serve(listener)
	
		// Handle SIGINT and SIGTERM.
		ch := make(chan os.Signal, 1)
		signal.Notify(ch, syscall.SIGINT, syscall.SIGTERM)
		log.Println(<-ch)
	
		// Stop the service gracefully.
		service.Stop()
	}

只要输入`CTRL+C`就可以安全停止程序了.

