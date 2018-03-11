---
title: "Bazel C++ 基础[翻译]"
date: 2016-06-28

tags: [
	"bazel", "翻译",
]
categories: [
	"bazel",
]
---

- 原文：http://www.bazel.io/docs/cpp.html
- 译者：[chai2010](http://github.com/chai2010)

<!--more-->

## 使用绝对路径

包含的路径是相对于工作区的根路径。假设有以下的目录结构：

```
[workspace]/
    WORKSPACE
    a/
        BUILD
        a.h
        a.cc
    b/
        BUILD
        b.h
        b.cc
        main.cc
```

如果`b/main.cc`需要包含`b.h`头文件，我们需要创建以下的`b/BUILD`文件：

```python
cc_library(
    name = "b",
    srcs = ["b.cc"],
    hdrs = ["b.h"],
)

cc_binary(
    name = "main",
    srcs = ["main.cc"],
    deps = [":b"],
)
```

`b/main.cc`可以这样包含`b.h`：

```cpp
#include "b/b.h"
```

上面的头文件包含路径是相对于工作区根目录的相对路径。如果`b/main.cc`还要依赖`a/a.h`头文件的话，我们还需要添加`a/BUILD`文件：

```python
cc_library(
    name = "a",
    srcs = ["a.cc"],
    hdrs = ["a.h"],
    visibility = ["//b:__pkg__"],
)
```

然后我们在`b/BUILD`添加依赖关系：

```python
cc_binary(
    name = "main",
    srcs = ["main.cc"],
    deps = [
        ":b",
        "//a",
    ],
)
```

`b/main.cc`代码中也包含了`a/a.h`头文件：

```cpp
#include "a/a.h"
```

`b/main.cc`就可以正常使用`a/a.h`或`b/b.h`中导出的符号了。



## 依赖传递

如果包含了一个头文件，那么需要将头文件对应的库添加到依赖中。不过，只需有添加直接依赖的库。假设三明治对应的`sandwich.h`文件包含了面包对应的`bread.h`文件，同时`bread.h`又包含了面粉对应的`flour.h`文件。但是，三明治`sandwich.h`文件并没有直接包含面粉`flour.h`文件（三明治用户当然不关心面粉的事情），因此BUILD文件可以这样：

```python
cc_library(
    name = "sandwich",
    srcs = ["sandwich.cc"],
    hdrs = ["sandwich.h"],
    deps = [":bread"],
)

cc_library(
    name = "bread",
    srcs = ["bread.cc"],
    hdrs = ["bread.h"],
    deps = [":flour"],
)

cc_library(
    name = "flour",
    srcs = ["flour.cc"],
    hdrs = ["flour.h"],
)
```

上面表示了`sandwich`三明治库依赖`bread`面包库，`bread`又依赖`flour`对应的面粉库。

## 添加头文件包含路径

很多时候你可能并不希望基于工作区根路径的相对路径来包含每个头文件。因为很多已经存在的第三方库的头文件包含方式并不是基于工作区的根路径。假设有以下目录结构：

```
[workspace]/
    WORKSPACE
    third_party/
        some_lib/
            include/
                some_lib.h
            BUILD
            some_lib.cc
```

Bazel希望用`third_party/some_lib/include/some_lib.h`方式包含`some_lib.h`，但是`some_lib.cc`可能跟希望用`"include/some_lib.h"`方式包含。为了使得包含路径有效，需要在`third_party/some_lib/BUILD`文件中将`some_lib/`目录添加到头文件包含路径的搜索列表中：

```python
cc_library(
    name = "some_lib",
    srcs = ["some_lib.cc"],
    hdrs = ["some_lib.h"],
    copts = ["-Ithird_party/some_lib"],
)
```

这对于依赖的外部第三方库特别有效，因为可以避免在头文件路径中出现无关的`external/[repository-name]/`前缀。

## 包含外部库：一个例子

假设使用了 [Google Test](https://github.com/google/googletest)。可以在`WORKSPACE`文件中使用`new_`开头的仓库相关的函数，下载依赖的GTest代码到当前仓库中：

```python
new_http_archive(
    name = "gtest",
    url = "https://googletest.googlecode.com/files/gtest-1.7.0.zip",
    sha256 = "247ca18dd83f53deb1328be17e4b1be31514cedfc1e3424f672bf11fd7e0d60d",
    build_file = "gtest.BUILD",
)
```

创建`gtest.BUILD`文件，对应Google Test的构建配置文件。配置文件中有几个需要特别注意的地方：

* `gtest-1.7.0/src/gtest-all.cc`文件已经采用`#include`语法包含了`gtest-1.7.0/src/`目录中其它`*.cc`文件，因此需要将它排除在外（也可以只包含它一个文件，但是需要正确配置包含路径）。
* 它的头文件在`gtest-1.7.0/include/`目录，需要将它添加到头文件包含路径列表中
* GTest依赖`pthread`多线程库，通过`linkopt`选项指定。

最终的规则大概是这样：

```python
cc_library(
    name = "main",
    srcs = glob(
        ["gtest-1.7.0/src/*.cc"],
        exclude = ["gtest-1.7.0/src/gtest-all.cc"]
    ),
    hdrs = glob([
        "gtest-1.7.0/include/**/*.h",
        "gtest-1.7.0/src/*.h"
    ]),
    copts = [
        "-Iexternal/gtest/gtest-1.7.0/include"
    ],
    linkopts = ["-pthread"],
    visibility = ["//visibility:public"],
)
```

这是有点混乱：所有以`gtest-1.7.0`为前缀的其实都是生成的临时文件。我们可以通过`new_http_archive`函数中的`strip_prefix`属性来忽略它：

```python
new_http_archive(
    name = "gtest",
    url = "https://googletest.googlecode.com/files/gtest-1.7.0.zip",
    sha256 = "247ca18dd83f53deb1328be17e4b1be31514cedfc1e3424f672bf11fd7e0d60d",
    build_file = "gtest.BUILD",
    strip_prefix = "gtest-1.7.0",
)
```

现在`gtest.BUILD`简洁多了：

```python
cc_library(
    name = "main",
    srcs = glob(
        ["src/*.cc"],
        exclude = ["src/gtest-all.cc"]
    ),
    hdrs = glob([
        "include/**/*.h",
        "src/*.h"
    ]),
    copts = ["-Iexternal/gtest/include"],
    linkopts = ["-pthread"],
    visibility = ["//visibility:public"],
)
```

现在`cc_`相关的规则可以通过`//external:gtest/main`引用GTest了。

例如：我们可以创建以下测试：

```cpp
#include "gtest/gtest.h"

TEST(FactorialTest, Negative) {
  EXPECT_EQ(1, 1);
}
```

创建对应的BUILD文件：

```python
cc_test(
    name = "my_test",
    srcs = ["my_test.cc"],
    copts = ["-Iexternal/gtest/include"],
    deps = ["@gtest//:main"],
)
```

使用`bazel test`命令运行测试。

## 依赖预编译的库

如果要依赖一个已经编译好的库（可能只有头文件和对应的`*.so`库文件），可以使用`cc_library`规则包装一个库对象：

```python
cc_library(
    name = "mylib",
    srcs = ["mylib.so"],
    hdrs = ["mylib.h"],
)
```

其它的目标就可以依赖这个包装的库对象了。
