# Copyright 2018 <chaishushan{AT}gmail.com>. All rights reserved.
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file.

.PHONY: default
default: clean
	hugo && mv public public-new && cd public-new && go run ../server.go

.PHONY: get-hugo
get-hugo:
	mkdir -p _hugo && cd _hugo
	wget https://github.com/gohugoio/hugo/releases/download/v0.30.2/hugo_0.30.2_Linux-64bit.tar.gz
	tar zxvf hugo_0.30.2_Linux-64bit.tar.gz
	cp ./hugo /usr/local/bin/hugo
	cd ..

.PHONY: hugo
hugo:
	hugo

.PHONY: debug
debug:
	hugo server --buildDrafts --watch

.PHONY: pub
pub:
	# copy ./Caddyfile to ssh@/root/Caddyfile
	# copy ./Makefile to ssh@/root/Makefile
	-@docker kill chai2010.cn
	docker run -d --restart=always --name chai2010.cn \
		-v /root/Caddyfile:/etc/Caddyfile \
		-v /root/.caddy:/root/.caddy \
		-v /root/.ssh:/root/.ssh \
		-p 80:80 -p 443:443 \
		abiosoft/caddy

.PHONY: dev
dev: clean
	# run `hugo` command to generate ./public at first
	-@docker kill chai2010.cn
	hugo && docker run --rm --name chai2010.cn.dev \
		-v `pwd`/Caddyfile.local:/etc/Caddyfile \
		-v `pwd`/.caddy:/root/.caddy \
		-v `pwd`:/srv/chai2010.cn \
		-p 2015:2015 \
		abiosoft/caddy

.PHONY: clean
clean:
	-rm -rf public
	-rm -rf public-new

