# Copyright 2018 <chaishushan{AT}gmail.com>. All rights reserved.
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file.

default: clean
	hugo && cd public && go run ../server.go

debug:
	hugo server --buildDrafts --watch

caddy:
	docker run --name chai2010.me -d -p 80:80 -p 443:443 --restart=always -v /root/.caddy:/root/.caddy -v /root/.ssh:/root/.ssh chai2010/chai2010.me

pub:
	# copy ./Caddyfile to ssh@/root/Caddyfile
	# copy ./Makefile to ssh@/root/Makefile
	docker run -d --restart=always --name chai2010.caddyserver \
		-v /root/Caddyfile:/etc/Caddyfile \
		-v /root/.caddy:/root/.caddy \
		-v /root/.ssh:/root/.ssh \
		-p 80:80 -p 443:443 \
		abiosoft/caddy

dev: clean
	# run `hugo` command to generate ./public at first
	docker run --rm --name chai2010.caddyserver.dev \
		-v `pwd`/Caddyfile.local:/etc/Caddyfile \
		-v `pwd`/.caddy:/root/.caddy \
		-v `pwd`:/srv/chai2010.me \
		-p 2015:2015 \
		abiosoft/caddy

clean:
	-rm -rf public
