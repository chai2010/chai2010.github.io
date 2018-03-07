# Copyright 2018 <chaishushan{AT}gmail.com>. All rights reserved.
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file.

default:

caddy:
	docker run -d -p 80:80 -p 443:443 --restart=always -v /root/.caddy:/root/.caddy chai2010/chai2010.github.io

local:
	docker run -p 8080:80 -p 8443:443 chai2010/chai2010.github.io

dev:
	hugo && cd public && go run ../server.go

clean:
