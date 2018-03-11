---
title: "一个极简的JavaScript模板引擎"
date: 2017-07-05
draft: false

tags: ["js"]
categories: [js]
---

基于ES6的新特性, 构造一个极简的JavaScript模板引擎.

<!--more-->

ES6提供了可以跨越多行的模板字符串, 为内联的模板提供了很多方便.

使用起来很简单:

```js
let world = '世界'
console.log(`hello, ${world}`)
```

在执行时, JS引擎会对模板字符串中`${...}`部分的表达式进行求值, 最后转换为字符串显示.

模板字符串可以跨越多行, 中间如果需要包含 ` $ 等字符串时需要用 \ 进行转义.

我们可以将ES6的模板字符串看作是一种编译时的模板引擎.

很多时候我们也需要运行时的模板引擎. 用户根据需要选择传入模板变量.

我们可以基于ES6的模板引擎打造一个运行时的模板引擎, 代码如下(TypeScript实现):

```typescript
export function RenderTemplate(tmpl: string, params: object): string {
	let keys = Object.keys(params)
	let vals = keys.map(key => params[key])
	return new Function(...keys, `return \`${tmpl}\`;`)(...vals)
}
```

使用方式如下:

```js
let s = RenderTemplate('${msg}', {msg:'abc'})
let s = RenderTemplate('${fn(msg)}', {fn: s => s.toUpperCase(), msg:'abc'})
let s = RenderTemplate('${Math.sqrt(pt.x*pt.x+pt.y*pt.y)}', {Math:Math, pt:{x:1, y:2}})
```

需要注意的是传入的模板字符串不能用反斜杠`包含以避免被JS引擎展开.

工作原理是构造一个函数, 函数体是将传入的运行时模板转为ES6的模板字符串,
同时传入的对象成员转为新构造函数的参数变量, 这样JS引擎会根据传入的参数变量值展开模板字符串了.

实现虽然简单, 但是得意于ES6模板字符串的强大特性, 我们也可以传入函数等复杂对象.

如果哪位同学有更简单的实现, 请告知作者, 感谢.
