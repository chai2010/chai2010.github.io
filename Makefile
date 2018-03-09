# Copyright 2018 <chaishushan{AT}gmail.com>. All rights reserved.
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file.

default:
	hugo && cd public && go run ../server.go

debug:
	hugo server --buildDrafts --watch

caddy:
	docker run --name chai2010.me -d -p 80:80 -p 443:443 --restart=always -v /root/.caddy:/root/.caddy -v /root/.ssh:/root/.ssh chai2010/chai2010.me

local:
	docker build -f Dockerfile.local -t chai2010/chai2010.me.local --no-cache .
	docker run --rm -p 2015:2015 chai2010/chai2010.me.local

clean:
	-rm -rf public
