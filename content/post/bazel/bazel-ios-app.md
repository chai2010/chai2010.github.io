---
title: "Bazel教程：构建iOS应用[翻译]"
date: 2016-05-19

tags: [
	"bazel", "翻译",
]
categories: [
	"bazel",
]
---

# Bazel教程：构建iOS应用

- 原文：http://bazel.io/docs/tutorial/ios-app.html
- 译者：[chai2010](http://github.com/chai2010)

本教程包含以下步骤（Bazel新用户请先参考: [Bazel入门教程](http://my.oschina.net/chai2010/blog/674110)）：

- 代码预览
- 创建BUILD构建文件
- 针对模拟器构建应用
- 查看构建输出
- 在模拟器环境运行／调试应用
- 针对设备构建应用
- 安装应用到设备

需要在 Mac OS X 环境，`WORKSPACE` 不用配置。

<!--more-->

## 查看源文件结构

iOS应用源文件在`$WORKSPACE/ios-app/UrlGet`目录。

代码在这里：https://github.com/bazelbuild/examples/tree/master/tutorial/ios-app/UrlGet

## 创建BUILD文件

在命令行用vi创建并编辑BUILD文件（其它编辑器也可以）：

```bash
$ vi $WORKSPACE/ios-app/BUILD
```

## 添加一个`objc_library`规则

Bazel针对构建iOS应用提供了诸多规则命令。在这里，我们首先使用
[`objc_library`](http://bazel.io/docs/be/objective-c.html#objc_library)
规则从源文件和Xib文件构建 [静态库](https://developer.apple.com/library/ios/technotes/iOSStaticLibraries/Introduction.html)。
（这个只是最小的规则，此外还有`ios_application`规则可以用于构建多架构的iOS应用。）

BUILD的内容如下：

```python
objc_library(
    name = "UrlGetClasses",
    srcs = [
        "UrlGet/AppDelegate.m",
        "UrlGet/UrlGetViewController.m",
    ],
    hdrs = glob(["UrlGet/*.h"]),
    xibs = ["UrlGet/UrlGetViewController.xib"],
)
```

规则对应的目标名字是`UrlGetClasses`。

## 添加`objc_binary`规则

[`objc_binary`](http://bazel.io/docs/be/objective-c.html#objc_binary) 创建一个
bundled应用中的二进制可执行程序。

BUILD文件添加如下内容：

```python
objc_binary(
    name = "ios-app-binary",
    srcs = [
        "UrlGet/main.m",
    ],
    deps = [
        ":UrlGetClasses",
    ],
)

```

其中`deps`属性引用了前面的`UrlGetClasses`静态库。

## 添加`ios_application`规则

[`ios_application`](/docs/be/objective-c.html#ios_application) 规则用于创建`.ipa`打包应用，
同时生成Xcode过程文件。

BUILD文件添加如下内容：

```python
ios_application(
    name = "ios-app",
    binary = ":ios-app-binary",
    infoplist = "UrlGet/UrlGet-Info.plist",
)
```

完整的BUILD文件在这里：https://github.com/bazelbuild/examples/blob/master/tutorial/ios-app/BUILD

## 构建模拟器环境的应用

命令行环境，确保当前目录对应Bazel的workspace：

```bash
$ cd $WORKSPACE
```

输入以下命令构建应用：

```bash
$ bazel build //ios-app:ios-app
```

Bazel将启动构建工作。当构建完成时，输出类似下面的信息：

```bash
INFO: Found 1 target...
Target //ios-app:ios-app up-to-date:
  bazel-bin/ios-app/ios-app.ipa
  bazel-bin/ios-app/ios-app.xcodeproj/project.pbxproj
INFO: Elapsed time: 3.765s, Critical Path: 3.44s
```

## 查找构建的输出

输出的`.ipa`和其它文件在`$WORKSPACE/bazel-bin/ios-app`目录。

## 模拟器环境运行／调试应用

现在可以从Xcode环境的模拟器来运行应用。先打开`$WORKSPACE/bazel-bin/ios-app/ios-app.xcodeproj`工程文件，
然后选择相应版本的iOS模拟器，然后点击 **Run** 按钮运行。

**注意：** 如果要Xcode工程中的任何信息发生变化（比如删除文件或添加／改变依赖），必须使用Bazel重新生成Xcode工程文件。

## 针对设备构建应用

针对设备构建应用，需要设置bazel以找到目标对应设备的provisioning profile配置文件。
根据以下步骤设置：

   1. 打开网页 [Apple Profiles](https://developer.apple.com/account/ios/profile/profileList.action)
      下载设备对应的provisioning profile配置文件。
      如果又疑问，请参考 [Apple's documentation](https://developer.apple.com/library/ios/documentation/IDEs/Conceptual/AppDistributionGuide/MaintainingProfiles/MaintainingProfiles.html)。
   1. 将profile配置文件放到`$WORKSPACE/tools/objc`目录。
   1. 可选操作 － 可以在`.gitignore`中忽略配置文件。
   1. 编辑 `$WORKSPACE/tools/objc/BUILD` 文件，添加：

      ```python
      filegroup(
          name = "default_provisioning_profile",
          srcs = ["<NAME OF YOUR PROFILE>.mobileprovision"],
      )
      ```

现在可以构建针对设备的应用了：

```bash
$ bazel build //ios-app:ios-app --ios_multi_cpus=armv7,arm64
```

上面的命令将构建针对多个类型的设备应用。如果只需要构建真的特定类型的应用，
可以指定一个特定的设备架构体系结构。

如果需要选择一个特定版本的Xcode或特定版本的SDK，可以通过`--xcode_version=7.2 --ios_sdk_version=9.2`指定。
要确保选定版本的SDK对应的Xcode已经安装到本机。

如果需要指定一个能够运行的最小iOS版本，可以通过`--ios_minimum_os=7.0`指定。

## 安装应用到设备上

安装应用到设备最简单的方法是打开Xcode，然后点击`Windows > Devices`菜单。
从左边列表选择相应的设备，点击 "+" 按钮并选择生成的 `.ipa` 文件。

如果程序没有运行，请检查设备和provisioning profile配置是否匹配。
点击`Devices`下面的`View Device Logs`按钮，可以查看到相关的错误信息。
