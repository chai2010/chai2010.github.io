---
layout: post
title: "fopen打开的最大文件数目"
date: 2011-07-28 10:13:25 +0800
comments: true
categories: [fopen]
---

### Windows环境

可以用_getmaxstdio/_setmaxstdio 查询/设置.

	// crt_setmaxstdio.c #include <stdio.h>
	int main() {
		printf("%d\n",_getmaxstdio());
		_setmaxstdio(2048);
		printf("%d\n",_getmaxstdio());
	}

XP默认好像是512, 其中包含stdin/stdout/stderr.

### Linux 环境

和以下参数有关(/etc/system):

	* set hard limit on file descriptors
	set rlim_fd_max = 4096
	* set soft limit on file descriptors
	set rlim_fd_cur = 1024
