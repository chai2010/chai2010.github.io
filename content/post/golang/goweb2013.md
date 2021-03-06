---
title: "用Go语言开发Web程序[翻译]"
date: 2013-04-06
draft: false

tags: ["golang", "web"]
categories: [golang]
---

<!-- 标题: Go语言编写Web程序 -->
<!-- 翻译: chaishushan{AT}gmail.com -->
<!-- 原文: http://golang.org/doc/articles/wiki/ -->

- 英文: [http://golang.org/doc/articles/wiki/](http://golang.org/doc/articles/wiki/)

## 简介

本教程将讨论：

- 创建一个支持加载和保存的数据结构
- 使用 net/http 包来构建web应用程序
- 使用 html/template 包来处理HTML模板
- 使用 regexp 包来验证用户输入
- 使用闭包

基本知识：

- 有一定的编程经验
- 了解基本的web技术(HTTP、HTML)
- 一些UNIX/DOS命令行知识

## 开始

目前、你需要一个运行FreeBSD、Linux、OS X 或 Windows的机器。 我们将使用 $ 来代表命令提示符。

安装Go语言环境（参考 安装说明）。

为本教程新建一个目录，将新建目录添加到GOPATH环境变量，然后命令行切换到新建目录:

	$ mkdir gowiki
	$ cd gowiki

创建一个名为wiki.go的源文件，使用你喜欢的编辑器打开，并添加以下代码：

	package main

	import (
		"fmt"
		"io/ioutil"
	)

我们从标准库导入了fmt和ioutil包。 后面我们将实现更多的功能，到时候我们会添加更多的包到import声明。


## 数据结构

我们现定义数据结构。一个wiki通常有一些列相互关联的页面组成，每个页面有一个标题和一个主体（页面的内容）。 在这里，我们定的Page结构体包含标题和主体两个成员。

	type Page struct {
		Title string
		Body  []byte
	}

类型 `[]byte` 表示“一个byte切片”。 （参见 Go切片：用法和本质） 我们将Body成员定义为 `[]byte` 而不是 `string` 类型， 因为我们希望类型和 `io` 库很好的配合，在后面会看到。

Page描述的页面内容只是保存在内存中。但是如何进行持久存储呢？ 我们可以为Page类型创建一个save方法：

	func (p *Page) save() error {
		filename := p.Title + ".txt"
		return ioutil.WriteFile(filename, p.Body, 0600)
	}

方法的签名这样读：“这是一个方法，名字叫save， 方法的接收者p是一个指向Page类型结构体的指针。 方法没有参数，但有一个error类型的返回值。”

该方法会将Page的Body成员的值保存到一个文本文件。 为了简化，我们使用Title成员的值作为文件的名字。

save方法返回的error值和WriteFile函数的返回类型 一致（将byte切片写入文件的标准库函数）。程序可以通过save方法返回的 error值判断写文件时是否遇到错误。如果写文件一切正常，Page.save() 将返回nil（对应指针、接口等类型的零值）。

传递给WriteFile函数的第三个参数0600是一个八进制整数面值， 表示新创建的文件只对当前用户是读写权限。（更多信息请参考Unix手册 open(2)）

除了保存页面，我们还需要加载页面：

	func loadPage(title string) *Page {
		filename := title + ".txt"
		body, _ := ioutil.ReadFile(filename)
		return &Page{Title: title, Body: body}
	}

函数loadPage从title参数构造文件名，然后读取文件的内容到 新的变量body，最后返回两个值：一个指向由title和body构造的 Page面值并且错误返回值为nil。

函数可以返回多个值。标准库函数io.ReadFile返回[]byte和error。 在loadPage函数中，错误信息被丢失了；“空白标识符”所代表的下划线（_） 符号用于扔掉错误返回值（本质上没哟分配任何值）。

但是如果ReadFile遇到错误怎么办？对于这个例子，文件可能还不存在。我们不能忽略 类似的错误。我们修改函数返回*Page和error。

	func loadPage(title string) (*Page, error) {
		filename := title + ".txt"
		body, err := ioutil.ReadFile(filename)
		if err != nil {
			return nil, err
		}
		return &Page{Title: title, Body: body}, nil
	}

这个函数的调用者可以检测第二个返回参数；如果是nil表示成功加载页面。否则， error可以被调用者截获（更多信息请参考语言规范）。

现在我们有了一个简单的数据结构，并且可以保存到文件和从文件加载页面。让我们写一个main 来测试一下：

	func main() {
		p1 := &Page{Title: "TestPage", Body: []byte("This is a sample Page.")}
		p1.save()
		p2, _ := loadPage("TestPage")
		fmt.Println(string(p2.Body))
	}

在编译并运行程序后，会创建一个名为TestPage.txt的文件，内容是p1 包含的页面主体。然后文件的内容被读取到p2，并且打印其Body成员到屏幕。

可以这样编译和运行程序：

	$ go build wiki.go
	$ ./wiki
	This is a sample page.

（如果是使用Windows系统则不需要“wiki”前面的“./”。）

点击这里浏览完整代码。

## 了解net/http包（插曲）

这里是一个简要Web服务器的完整代码：

	package main

	import (
		"fmt"
		"net/http"
	)

	func handler(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hi there, I love %s!", r.URL.Path[1:])
	}

	func main() {
		http.HandleFunc("/", handler)
		http.ListenAndServe(":8080", nil)
	}

main函数开始调用`http.HandleFunc`，告诉`http`包用`handler`函数处理所以针对跟目录的访问请求（"/"）。

然后调用`http.ListenAndServe`，指定监听端口为8080（":8080"）。 （目前先忽略第二个参数nil。）这个函数会阻塞直到程序终止。

函数handler的类型是http.HandlerFunc。它的参数是 一个`http.ResponseWriter`和一个`http.Request`。

参数`http.ResponseWriter`汇总HTTP服务器的响应；向它写入的数据会发送 到HTTP客服端。

参数http.Request是客户端请求数据对应的数据结构。 `r.URL.Path`表示客户端请求的URL地址。后面的`[1:]`含义是 “从Path的第一个字符到 末尾创建一个子切片。” 这样可以忽略URL路径中的开始的“/”字符。

如果你运行程序并访问一些URL地址：

	http://localhost:8080/monkeys

程序会返回一个包含以下内容的页面：

	Hi there, I love monkeys!

## 基于net/http包提供wiki页面

使用前需要导入net/http包：

	import (
		"fmt"
		"net/http"
		"io/ioutil"
	)

然后我们创建一个viewHandler函数，用于处理浏览wiki页面。它会处理所有以"/view/"为前缀的URL地址。

	const lenPath = len("/view/")
	func viewHandler(w http.ResponseWriter, r *http.Request) {
		title := r.URL.Path[lenPath:]
		p, _ := loadPage(title)
		fmt.Fprintf(w, "<h1>%s</h1><div>%s</div>", p.Title, p.Body)
	}

首先，该函数从r.URL.Path中取出要浏览页面的标题。 全局常量lenPath是URL前缀"/view/"的长度。 Path的切片`[lenPath:]`用于忽略前面的6个字符。 这是因为URL地址是以"/view/"为前缀，它们不是页面标题的组成部分。

接着加载页面数据，然后格式化为一个简单的HTML页面，写入到`http.ResponseWriter`类型的w参数。

这里又一次使用了`_`来忽略loadPage返回的错误`error`。 这里只是为了简化代码，它并不是好的编程实践。稍后我们会继续完善这个部分。

要使用这个函数，我们需要修改main函数中的http初始化代码， 使用`viewHandler`函数处理对应/view/地址的请求。

	func main() {
		http.HandleFunc("/view/", viewHandler)
		http.ListenAndServe(":8080", nil)
	}

点击这里浏览完整代码。

我们创建一些测试页面（例如test.txt），然后尝试提供一个wiki页面：

使用编辑器打开test.txt文件，输入“Hello world”内容并保存（忽略双引号）。

	$ go build wiki.go
	$ ./wiki

如果是使用Windows系统则不需要“wiki”前面的“./”。

启动web服务器后，浏览http://localhost:8080/view/test 将显示一个标题为“test”内容为“Hello world”的页面。

## 编辑页面

没有编辑能力的wiki就不是真正的wiki了。我们继续创建了两个函数： 一个editHandler用于显示编辑页面的界面，另一个saveHandler 用于保存编辑后的页面内容。

我们先将它们加入到`main()`函数：

	func main() {
		http.HandleFunc("/view/", viewHandler)
		http.HandleFunc("/edit/", editHandler)
		http.HandleFunc("/save/", saveHandler)
		http.ListenAndServe(":8080", nil)
	}

函数editHandler加载页面，然后显示一个HTML编辑页面。

	func editHandler(w http.ResponseWriter, r *http.Request) {
		title := r.URL.Path[lenPath:]
		p, err := loadPage(title)
		if err != nil {
			p = &Page{Title: title}
		}
		fmt.Fprintf(w, "<h1>Editing %s</h1>"+
			"<form action=\"/save/%s\" method=\"POST\">"+
			"<textarea name=\"body\">%s</textarea><br>"+
			"<input type=\"submit\" value=\"Save\">"+
			"</form>",
			p.Title, p.Title, p.Body)
	}

这个函数只是可工作，但是那些HTML相关的代码比较丑陋。 当然，还有更好的实现方式。

## 使用html/template包

html/template是标准库中的包。我们使用html/template 包可以将HTML代码分离到一个文件，然后我们可以在不改变底层代码前提下调整和完善编辑页面。

首先，我们导入html/template包。现在我们已经不再使用fmt包了， 因此需要删除它。

	import (
		"html/template"
		"http"
		"io/ioutil"
		"os"
	)

我们需要为编辑页面创建一个模板文件。新建edit.html文件， 并输入以下内容：

	<h1>Editing {{.Title}}</h1>

	<form action="/save/{{.Title}}" method="POST">
	<div><textarea name="body" rows="20" cols="80">{{printf "%s" .Body}}</textarea></div>
	<div><input type="submit" value="Save"></div>
	</form>

修改editHandler函数，使用模板代替硬编码HTML：

	func editHandler(w http.ResponseWriter, r *http.Request) {
		title := r.URL.Path[lenPath:]
		p, err := loadPage(title)
		if err != nil {
			p = &Page{Title: title}
		}
		t, _ := template.ParseFiles("edit.html")
		t.Execute(w, p)
	}

函数`template.ParseFiles`将读取edit.html目标文件， 返回值为`*template.Template`。

函数`t.Execute`处理模板，将生成的HTML写入到`http.ResponseWriter`。 其中以点开头的`.Title`和`.Body`标识符将被`p.Title`和`p.Body`替换。

模板的驱动语句是被双花括弧包括的部分. `printf "%s" .Body`表示将`.Body`输出位字符串
而不是字节串, 类似`fmt.Printf`函数的效果. `html/template`可以保证输出有效的HTML字符串,
对于`(>)`之类的特殊符号会自动替换为`&gt;`等对应编码, 保证不会破坏原先的HTML结构.

需要注意的是我们移除了`fmt.Fprintf`语句, 因此也移除了`"fmt"`包的导入语句.

现在我们已经是基于模板方式的, 可以针对`viewHandler`函数创建一个名为view.html的模板文件:

	<h1>{{.Title}}</h1>

	<p>[<a href="/edit/{{.Title}}">edit</a>]</p>

	<div>{{printf "%s" .Body}}</div>

也要调整`viewHandler`函数:

	func viewHandler(w http.ResponseWriter, r *http.Request) {
		title := r.URL.Path[lenPath:]
		p, _ := loadPage(title)
		t, _ := template.ParseFiles("view.html")
		t.Execute(w, p)
	}

观察可以发现前面是否模板的方式非常相似. 因此我们将模板独立大一个函数:

	func viewHandler(w http.ResponseWriter, r *http.Request) {
		title := r.URL.Path[lenPath:]
		p, _ := loadPage(title)
		renderTemplate(w, "view", p)
	}

	func editHandler(w http.ResponseWriter, r *http.Request) {
		title := r.URL.Path[lenPath:]
		p, err := loadPage(title)
		if err != nil {
			p = &Page{Title: title}
		}
		renderTemplate(w, "edit", p)
	}

	func renderTemplate(w http.ResponseWriter, tmpl string, p *Page) {
		t, _ := template.ParseFiles(tmpl + ".html")
		t.Execute(w, p)
	}

现在的处理函数更加清晰简短.

## 处理不存在的页面

如果访问`/view/APageThatDoesntExist`会发生什么情况? 程序会崩溃掉.
这是因为程序忽略了`loadPage`返回的错误信息. 为了处理页面不存在的情况,
程序会重定向到一个新页面的编辑页面:

	func viewHandler(w http.ResponseWriter, r *http.Request) {
		title, err := getTitle(w, r)
		if err != nil {
			return
		}
		p, err := loadPage(title)
		if err != nil {
			http.Redirect(w, r, "/edit/"+title, http.StatusFound)
			return
		}
		renderTemplate(w, "view", p)
	}

`http.Redirect`函数会添加`http.StatusFound (302)`状态, 并且重新定位.

## 保存页面

函数`saveHandler`用于处理提交的表单.

	func saveHandler(w http.ResponseWriter, r *http.Request) {
		title := r.URL.Path[lenPath:]
		body := r.FormValue("body")
		p := &Page{Title: title, Body: []byte(body)}
		p.save()
		http.Redirect(w, r, "/view/"+title, http.StatusFound)
	}

页面的标题(URL提供)和表单的内容将作为一个新页面保存.
调用`save()`方法将页面写到文件, 然后重定向到`/view/`页面.

`FormValue`方法返回的返回值是字符串类型. 我们需要先转换为`[]byte`, 然后填充到`Page`
结构体. 我们通过`[]byte(body)`语句做强制转换.

## 错误处理

前面的代码基本都是忽略了错误处理. 这不是好的处理方式, 因为发生错误的话会导致程序崩溃.
好的处理方式是截获错误, 并给用户显示错误相关的信息. 这样即使发生错误, 服务器也
可以正常运行, 用户也可以收到错误提示信息.

首先, 我先处理`renderTemplate`中的错误:

	func renderTemplate(w http.ResponseWriter, tmpl string, p *Page) {
		t, err := template.ParseFiles(tmpl + ".html")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = t.Execute(w, p)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}

`http.Error`函数返回一个具体的错误码(这里是属于"服务器错误"类型)和错误信息.
看来刚才决定将模板处理独立到一个函数是一个正确的决定.

下面是修复后的`saveHandler`:

	func saveHandler(w http.ResponseWriter, r *http.Request) {
		title, err := getTitle(w, r)
		if err != nil {
			return
		}
		body := r.FormValue("body")
		p := &Page{Title: title, Body: []byte(body)}
		err = p.save()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		http.Redirect(w, r, "/view/"+title, http.StatusFound)
	}

`p.save()`时发生的错误信息也将报告给用户.

## 缓存模板

前面的实现有一个性能缺陷: `renderTemplate`每次都会调用`ParseFiles`函数.
更好的优化思路是只在初始化的使用调用一次`ParseFiles`, 将全部要处理的模板
放到一个`*Template`中. 然后可以使用`ExecuteTemplate`渲染指定的模板.

首先创建一个名位`templates`全局变量, 然后用`ParseFiles`进行初始化.

	var templates = template.Must(template.ParseFiles("edit.html", "view.html"))

`template.Must`只是一个简便的包装, 当传递非`nil`的错误是抛出`panic`异常.
在这里抛出异常是合适的: 如果模板不能正常加载, 简单的处理方式就是退出程序.

`ParseFiles`接收任意数量的字符串参数为名字的模板文件, 并将这些文件解析到以基本文件名
的模板. 如果我们需要更多的模板, 可以直接将模板文件名添加到`ParseFiles`参数中.

然后是修改`renderTemplate`函数, 调用`templates.ExecuteTemplate`渲染指定的模板:

	func renderTemplate(w http.ResponseWriter, tmpl string, p *Page) {
		err := templates.ExecuteTemplate(w, tmpl+".html", p)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}

需要注意的是模板名字对于模板文件的名字, 因此这里添加了".html"后缀名.

## 验证

你可能以及发现, 这个程序有严重的安全缺陷: 用户可以在服务器上读写任意独立路径.
为了降低这种风险, 我们编写一个函数以正则表达式的方式在验证标题的合法性.

首先, 要导入`"regexp"`包. 然后创建一个全局变量保存用于验证的正则表达式:

	var titleValidator = regexp.MustCompile("^[a-zA-Z0-9]+$")

函数`regexp.MustCompile`将分析和编译正则表达式, 返回`regexp.Regexp`.
`MustCompile`和`Compile`有些不同, `MustCompile`遇到错误时会抛出`panic`异常,
而`Compile`在遇到错误时通过第二个返回值返回错误.

现在, 让我们写一个函数`getTitle`, 从请求的URL提取标题, 并且测试是否是有效的表达式:

	func getTitle(w http.ResponseWriter, r *http.Request) (title string, err error) {
		title = r.URL.Path[lenPath:]
		if !titleValidator.MatchString(title) {
			http.NotFound(w, r)
			err = errors.New("Invalid Page Title")
		}
		return
	}

如果标题是有效的, 将返回`nil`错误值. 如果标题无效, 函数会输出"404 Not Found"错误.

让我们将`getTitle`应用到每个处理程序：

	func viewHandler(w http.ResponseWriter, r *http.Request) {
		title, err := getTitle(w, r)
		if err != nil {
			return
		}
		p, err := loadPage(title)
		if err != nil {
			http.Redirect(w, r, "/edit/"+title, http.StatusFound)
			return
		}
		renderTemplate(w, "view", p)
	}

	func editHandler(w http.ResponseWriter, r *http.Request) {
		title, err := getTitle(w, r)
		if err != nil {
			return
		}
		p, err := loadPage(title)
		if err != nil {
			p = &Page{Title: title}
		}
		renderTemplate(w, "edit", p)
	}

	func saveHandler(w http.ResponseWriter, r *http.Request) {
		title, err := getTitle(w, r)
		if err != nil {
			return
		}
		body := r.FormValue("body")
		p := &Page{Title: title, Body: []byte(body)}
		err = p.save()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		http.Redirect(w, r, "/view/"+title, http.StatusFound)
	}

## 函数字面值和闭包

每个处理函数为了增加错误错误引入了很多重复的代码. 如果是否可以将每个处理函数的
错误处理包装到一个函数? Go语言的闭包函数提供的强有力的手段, 刚好可以用在这里.

第一步, 我们重写每个处理函数, 增加一个标题字符串参数:

	func viewHandler(w http.ResponseWriter, r *http.Request, title string)
	func editHandler(w http.ResponseWriter, r *http.Request, title string)
	func saveHandler(w http.ResponseWriter, r *http.Request, title string)

然后, 我们顶一个包装函数, 参数类型和前面定义的处理函数类型一致, 最后返回
`http.HandlerFunc`(用于适配`http.HandleFunc`的参数类型):

	func makeHandler(fn func (http.ResponseWriter, *http.Request, string)) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// Here we will extract the page title from the Request,
			// and call the provided handler 'fn'
		}
	}

这里返回的函数就是一个闭包, 因为它引用了在它外部定义的局部变量的值.
在这里情况下, 变量`fn`(`makeHandler`函数的唯一参数)被闭包函数持有.
`fn`变量将对应我们的保存, 编辑 和 查看 的处理函数.

现在我们可以将`getTitle`的代码移到这里(还有一些细节的改动):

	func makeHandler(fn func(http.ResponseWriter, *http.Request, string)) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			title := r.URL.Path[lenPath:]
			if !titleValidator.MatchString(title) {
				http.NotFound(w, r)
				return
			}
			fn(w, r, title)
		}
	}

`makeHandler`返回的是一个持有`http.ResponseWriter`和`http.Request`参数的闭包函数
(其实就是`http.HandlerFunc`类型). 闭包函数提取页面的标题, 并通过`TitleValidator`验证
标题是否符合正则表达式. 如果是无效的标题, 那么将使用`http.NotFound`输出错误的响应.
如果是有效的标题, 那么`fn`处理函数将会被调用.

现在我们可以在`main`函数注册的时候使用`makeHandler`包装具体的处理函数:

	func main() {
		http.HandleFunc("/view/", makeHandler(viewHandler))
		http.HandleFunc("/edit/", makeHandler(editHandler))
		http.HandleFunc("/save/", makeHandler(saveHandler))
		http.ListenAndServe(":8080", nil)
	}

Finally we remove the calls to getTitle from the handler functions, making them much simpler:

最后我们删除处理函数对`getTitle`的调用, 处理代码变得更加简单:

	func viewHandler(w http.ResponseWriter, r *http.Request, title string) {
		p, err := loadPage(title)
		if err != nil {
			http.Redirect(w, r, "/edit/"+title, http.StatusFound)
			return
		}
		renderTemplate(w, "view", p)
	}

	func editHandler(w http.ResponseWriter, r *http.Request, title string) {
		p, err := loadPage(title)
		if err != nil {
			p = &Page{Title: title}
		}
		renderTemplate(w, "edit", p)
	}

	func saveHandler(w http.ResponseWriter, r *http.Request, title string) {
		body := r.FormValue("body")
		p := &Page{Title: title, Body: []byte(body)}
		err := p.save()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		http.Redirect(w, r, "/view/"+title, http.StatusFound)
	}

## 看看页面效果!

[点击这里查看最终版本的代码](http://golang.org/doc/articles/wiki/final.go).

重新编译代码, 并且运行:

	$ go build wiki.go
	$ ./wiki

浏览 `http://localhost:8080/view/ANewPage` 将会看到编辑页面.
你可以输入一些文字, 点击 'save' 保存, 然后重新定向到新创建的页面.

## 其他任务

还可以根据自己的兴趣选择一些简单的扩展任务:

- 保存模板到`tmpl/`目录, 保存数据到`data/`目录.
- 增加一个根目录的处理函数, 重定向到`/view/FrontPage`.
- Spruce up the page templates by making them valid HTML and adding some CSS rules.
- 完善页面模板, 让它们输出有效的HTML, 并且添加一些CSS规则。
- 通过将`[PageName]`转换位`<a href="/view/PageName">PageName</a>`实现页面之间的链接.
(提示: 可以使用`regexp.ReplaceAllFunc`实现该功能)
