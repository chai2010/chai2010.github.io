---
title: "如何用 Lua 查询青云的主机"
date: 2020-01-01
draft: true

tags: [
	"draft",
]
categories: [
	"draft",
]
---

首先安装内置青云SDK的 qlua 命令: `go get github.com/chai2010/qingcloud-go/cmd/qlua`

注：这个解释器不是官方的C语言版本Lua解释器，而且纯Go语言实现的 [GopherLua](https://github.com/yuin/gopher-lua) 解释器订制而来。

创建一个JSON格式的配置文件，里面含有基本是口令信息 `~/.qingcloud/qcli.json`:

```json
{
	"api_server": "https://api.qingcloud.com/iaas/",
	"access_key_id": "公钥",
	"secret_access_key": "私钥",
	"zone": "pek3a"
}
```

然后创建 `hello.lua` 脚本:

```lua
local qc = require("qingcloud.iaas")

if #arg == 1 and arg[1] == '-v' then
	print(qc.version)
	print(qc.version_info.git_sha1_version)
	print(qc.version_info.build_date)
	do return end
end

if #arg == 1 and arg[1] == '-h' then
	print(qc.copyright)
	print("hello, 青云!")
	do return end
end

local config = qc.LoadJSON("~/.qingcloud/qcli.json")
local client = qc.Client:new(config)

local reply, err = client:DescribeInstances {
	--owner = "usr-xxxxxxxx",
	zone = "pek3a",
	limit = 100
}
if err ~= nil then
	print("error:", err)
	do return end
end

if reply.ret_code ~= 0 then
	print(reply.ret_code)
	print(reply.message)
	do return end
end

for i = 1, #reply.instance_set do
	local item = reply.instance_set[i]
	print(i,
		item.instance_id,
		item.instance_type,
		item.memory_current..'MB',
		item.status,
		item.create_time,
		item.instance_name
	)
end

print('total: ' .. reply.total_count)
```

可以输入一下命令执行:

```
$ qlua hello.lua -h
$ qlua hello.lua -v
$ qlua hello.lua
```

如果虚机数量巨大，则需要多次调用 `client:DescribeInstances` 获取。

参考:

https://github.com/chai2010/qingcloud-go#qucik-guide-gopherlua-version
