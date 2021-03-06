---
title: "lua中也能用上Go语言的strings包"
date: 2017-12-22
draft: false

tags: ["lua"]
categories: [lua]
---

lua内置的库非常小，我们可以将Go语言的strings包引入到Lua环境。

<!--more-->

下面是具体的例子。

hello.go:

```go
package main

import (
	"github.com/yuin/gopher-lua"

	strings "github.com/chai2010/glua-strings"
)

func main() {
	L := lua.NewState()
	defer L.Close()

	strings.Preload(L)

	if err := L.DoFile("hello.lua"); err != nil {
		panic(err)
	}
}
```

hello.lua:

```lua
local strings = require("strings")

print(strings.ToUpper("abc"))

for i, s in ipairs(strings.Split("aa,b,,c", ",")) do
	print(i, s)
end
```

运行例子:

    $ go run hello.go

项目地址:

https://github.com/chai2010/glua-strings
