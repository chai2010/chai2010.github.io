:: Copyright 2015 <chaishushan{AT}gmail.com>. All rights reserved.
:: Use of this source code is governed by a BSD-style
:: license that can be found in the LICENSE file.

setlocal

cd %~dp0

:: NodeJS
:: npm install http-server -g
:: http-server

:: Python2
:: python -m SimpleHTTPServer

:: Python3
:: python -m http.server

:: Golang
go run server.go
