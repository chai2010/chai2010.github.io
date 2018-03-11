---
title: "Bazel入门[翻译]"
date: 2016-05-12

tags: [
	"bazel",
]
categories: [
	"bazel",
]
---

# Bazel入门［翻译］

- 原文：http://bazel.io/docs/getting-started.html
- 译者：[chai2010](http://github.com/chai2010)

<!--more-->

## 安装

安装过程请参考: http://bazel.io/docs/install.html

## 使用工作区（workspace）

所有的Bazel构建都是基于一个 [_工作区（workspace）_](http://bazel.io/docs/build-ref.html#workspaces) 概念，
它是文件系统中一个保存了全部源代码的目录，同时还将包含一些构建后的输出目录的符号链接（例如：`bazel-bin` 和 `bazel-out` 等输出目录）。
工作区目录可以随意放在哪里，但是工作区的根目录必须包含一个名为 `WORKSPACE` 的工作区配置文件。
工作区配置文件可以是一个空文件，也可以包含引用外部构建输出所需的 [依赖关系](http://bazel.io/docs/external.html)。

在一个工作区内，可以根据需要共享多个项目。为了简单，我们先从只有一个项目的工作区开始介绍。

先假设你已经有了一个项目，对应 `~/gitroot/my-project/` 目录。我们先创建一个
空的 `~/gitroot/my-project/WORKSPACE` 工作区配置文件，用于表示这是Bazel项目对应的根目录。

## 创建自己的Build构建文件

使用下面的命令创建一个简单的Java项目：

```
$ # If you're not already there, move to your workspace directory.
$ cd ~/gitroot/my-project
$ mkdir -p src/main/java/com/example
$ cat > src/main/java/com/example/ProjectRunner.java <<EOF
package com.example;

public class ProjectRunner {
    public static void main(String args[]) {
        Greeting.sayHi();
    }
}
EOF
$ cat > src/main/java/com/example/Greeting.java <<EOF
package com.example;

public class Greeting {
    public static void sayHi() {
        System.out.println("Hi!");
    }
}
EOF
```

Bazel通过工作区中所有名为 `BUILD` 的文件来解析需要构建的项目信息，因此，
我们需要先在 `~/gitroot/my-project` 目录创建一个 `BUILD` 构建文件。
下面是BUILD构建文件的内容：

```python
# ~/gitroot/my-project/BUILD
java_binary(
    name = "my-runner",
    srcs = glob(["**/*.java"]),
    main_class = "com.example.ProjectRunner",
)
```

BUILD文件采用类似Python的语法。虽然不能包含任意的Python语法，
但是BUILD文件中的每个构建规则看起来都象是一个Python函数调用，
而且你也可以用 `"#"` 开头来添加单行注释。

`java_binary` 是一个构建规则。
其中 `name` 对应一个构建目标的标识符，可用用它来向Bazel指定构建哪个项目。
`srcs` 对应一个源文件列表，Bazel需要将这些源文件编译为二进制文件。
其中 `glob(["**/*.java"])` 表示递归包含每个子目录中以每个 `.java` 为后缀名的文件。
`com.example.ProjectRunner` 指定包含main方法的类。

现在可以用下面的命令构建这个Java程序了：

```
$ cd ~/gitroot/my-project
$ bazel build //:my-runner
INFO: Found 1 target...
Target //:my-runner up-to-date:
  bazel-bin/my-runner.jar
  bazel-bin/my-runner
INFO: Elapsed time: 1.021s, Critical Path: 0.83s
$ bazel-bin/my-runner
Hi!
```

恭喜，你已经成功构建了第一个Bazel项目了！

## 添加依赖关系

对于小项目创建一个规则是可以的，但是随着项目的变大，则需要分别构建项目的不同的部件，
最终再组装成产品。这种构建方式可以避免因为局部细小的修改儿导致重现构建整个应用，
同时不同的构建步骤可以很好地并发执行以提高构建效率。

我们现在将一个项目拆分为两个部分独立构建，同时设置它们之间的依赖关系。
基于上面的例子，我们重写了BUILD构建文件：

```python
java_binary(
    name = "my-other-runner",
    srcs = ["src/main/java/com/example/ProjectRunner.java"],
    main_class = "com.example.ProjectRunner",
    deps = [":greeter"],
)

java_library(
    name = "greeter",
    srcs = ["src/main/java/com/example/Greeting.java"],
)
```

虽然源文件是一样的，但是现在Bazel将采用不同的方式来构建：首先是构建 `greeter` 库，
然后是构建 `my-other-runner`。可以在构建成功后立刻运行 `//:my-other-runner`：

```
$ bazel run //:my-other-runner
INFO: Found 1 target...
Target //:my-other-runner up-to-date:
  bazel-bin/my-other-runner.jar
  bazel-bin/my-other-runner
INFO: Elapsed time: 2.454s, Critical Path: 1.58s

INFO: Running command line: bazel-bin/my-other-runner
Hi!
```

现在如果你改动`ProjectRunner.java`代码并重新构建`my-other-runner`目标，
`Greeting.java`文件因为没有变化而不会重现编译。

## 使用多个包（Packages）

对于更大的项目，我们通常需要将它们拆分到多个目录中。
你可以用类似`//path/to/directory:target-name`的名字引用在其他BUILD文件定义的目标。
假设`src/main/java/com/example/`有一个`cmdline/`子目录，包含下面的文件：

```
$ mkdir -p src/main/java/com/example/cmdline
$ cat > src/main/java/com/example/cmdline/Runner.java <<EOF
package com.example.cmdline;

import com.example.Greeting;

public class Runner {
    public static void main(String args[]) {
        Greeting.sayHi();
    }
}
EOF
```

`Runner.java`依赖`com.example.Greeting`，因此我们需要在`src/main/java/com/example/cmdline/BUILD`
构建文件中添加相应的依赖规则：

```python
# ~/gitroot/my-project/src/main/java/com/example/cmdline/BUILD
java_binary(
    name = "runner",
    srcs = ["Runner.java"],
    main_class = "com.example.cmdline.Runner",
    deps = ["//:greeter"]
)
```

然而，默认情况下构建目标都是 _私有_ 的。也就是说，我们只能在同一个BUILD文件中被引用。
这可以避免将很多实现的细节暴漏给公共的接口，但是也意味着我们需要手工允许`runner`所依赖的`//:greeter`目标。
就是类似下面这个在构建`runner`目标时遇到的错误：

```
$ bazel build //src/main/java/com/example/cmdline:runner
ERROR: /home/user/gitroot/my-project/src/main/java/com/example/cmdline/BUILD:2:1:
  Target '//:greeter' is not visible from target '//src/main/java/com/example/cmdline:runner'.
  Check the visibility declaration of the former target if you think the dependency is legitimate.
ERROR: Analysis of target '//src/main/java/com/example/cmdline:runner' failed; build aborted.
INFO: Elapsed time: 0.091s
```

可用通过在BUILD文件增加`visibility = level`属性来改变目标的可间范围。
下面是通过在`~/gitroot/my-project/BUILD`文件增加可见规则，来改变`greeter`目标的可见范围：

```python
java_library(
    name = "greeter",
    srcs = ["src/main/java/com/example/Greeting.java"],
    visibility = ["//src/main/java/com/example/cmdline:__pkg__"],
)
```

这个规则表示`//:greeter`目标对于`//src/main/java/com/example/cmdline`包是可见的。
现在我们可以重新构建`runner`目标程序：

```
$ bazel run //src/main/java/com/example/cmdline:runner
INFO: Found 1 target...
Target //src/main/java/com/example/cmdline:runner up-to-date:
  bazel-bin/src/main/java/com/example/cmdline/runner.jar
  bazel-bin/src/main/java/com/example/cmdline/runner
INFO: Elapsed time: 1.576s, Critical Path: 0.81s

INFO: Running command line: bazel-bin/src/main/java/com/example/cmdline/runner
Hi!
```

[参考文档](http://bazel.io/docs/be/common-definitions.html#common.visibility) 中有可见性配置说明。

## 部署

如果你查看 _bazel-bin/src/main/java/com/example/cmdline/runner.jar_ 的内容，
可以看到里面只包含了`Runner.class`，并没有保护所依赖的`Greeting.class`：

```
$ jar tf bazel-bin/src/main/java/com/example/cmdline/runner.jar
META-INF/
META-INF/MANIFEST.MF
com/
com/example/
com/example/cmdline/
com/example/cmdline/Runner.class
```

这只能在本机正常工作（因为Bazel的`runner`脚本已经将greeter jar添加到了classpath），
但是如果将`runner.jar`单独复制到另一台机器上讲不能正常运行。
如果想要构建可用于部署发布的自包含所有依赖的目标，可以构建`runner_deploy.jar`目标
（类似`<target-name>_deploy.jar`以`_deploy`为后缀的名字对应可部署目标）。

```
$ bazel build //src/main/java/com/example/cmdline:runner_deploy.jar
INFO: Found 1 target...
Target //src/main/java/com/example/cmdline:runner_deploy.jar up-to-date:
  bazel-bin/src/main/java/com/example/cmdline/runner_deploy.jar
INFO: Elapsed time: 1.700s, Critical Path: 0.23s
```

`runner_deploy.jar`中将包含全部的依赖。

## 下一步

现在，您可以创建自己的目标并组装最终产品了。
接下来，可查看 [相关教程](http://bazel.io/docs/tutorial/index.html) 分别学习如何用Bazel构建
一个服务器、Android和iOS应用。
也可以参考 [构建百科](http://bazel.io/docs/be/overview.html) 和 [用户手册](http://bazel.io/docs/bazel-user-manual.html)
获得更多的信息。
如果有问题的话，可以到 [bazel-discuss](https://groups.google.com/forum/#!forum/bazel-discuss) 论坛提问。
