---
title: "非主流C/C++编程"
date: 2017-01-27

tags: [
	"c++", "emscripten", "gist",
]
categories: [
	"c++",
]
---

```c
enum class NewStyle {
	ONE = 200,
	TWO,
};
static auto init_enum_NewStyle = my_run_script_int(R"==(
	const varargs = [
		Module.getValue(arguments[1]+4*0, 'i32'),
		Module.getValue(arguments[1]+4*1, 'i32'),
	];
	Module.NewStyle = class {
		static get ONE(){ return varargs[0] }
		static get TWO(){ return varargs[1] }
	};
)==",
	NewStyle::ONE,
	NewStyle::TWO
);
```

<!--more-->
