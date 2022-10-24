---
title: "1024・GLCC 开源夏令营 KusionStack 顺利结题"
date: 2022-10-24
draft: false

tags: ["kclvm", "glcc"]
categories: ["kclvm", "glcc"]
---

![](/images/2022/glcc-done/00.gif)

## 1. 1024 程序员节快乐

10 月 24 日是程序员节，首先祝所有程序员节日快乐。同时祝贺 GLCC 开源夏令营选择 KusionStack 项目的同学们全部完成考核，祝贺你们！

## 2. GLCC 编程夏令营活动

CCF GitLink 开源编程夏令营（GitLink Code Camp，简称  GLCC），是在 CCF 中国计算机学会指导下，由 GitLink 社区联合 CCF 开源发展委员会（CCF ODC）共同举办的面向全国高校学生的暑期开源项目实习计划。

![](/images/2022/glcc-done/20.png)

活动主要联合各大开源企业、开源基金会、开源社区及开源领域专家，旨在鼓励高校学生通过参与真实的开源软件开发，感受开源文化，提升自身技术能力，进而达到为开源企业和社区输送优秀人才的目的。

## 3. KusionStack 开源项目

KusionStack 是蚂蚁开源的云原生可编程技术栈！它也是一个可编程、高灵活性的应用交付及运维技术栈，灵感源于融合（Fusion）一词，旨在帮助企业构建的应用运维配置管理平面及 DevOps 生态。

- KusionStack 主仓库：https://github.com/KusionStack/kusion
- KusionStack KCL 语言仓库：https://github.com/KusionStack/KCLVM
- KusionStack 网站主页：https://kusionstack.io

主要希望融合以下几种场景：融合专有云，混合云，多云混合场景；融合以云原生技术为主，同时采用多种平台技术的混合平台技术选型；融合多项目、多团队、多角色、多租户、多环境的企业级诉求。

基于 Platform as Code （平台服务即代码）理念，研发者可以快速收敛围绕应用运维生命周期的全量配置定义，面向混合技术体系及云环境，完成从应用运维研发到上线的端到端工作流程，真正做到一处编写，随处交付。

![](/images/2022/glcc-done/30.png)

以上是 KusionStack 的主题架构。GLCC 的选题主要集中在 KCL 语言和对应的 VS Code 插件部分。

## 4. KusionStack 的 GLCC 编程任务

KusionStack 向 GLCC 提交了 3 个编程任务（都被选中）。第一个是 KCL 语言语法解析错误恢复机制改进，目前的 KCL 语言仅收集了语法解析阶段的错误，没有进行错误恢复。本项目目标是实现 KCL 语言语法解析阶段的错误恢复。第二个是为 KCL 设计包管理工具，希望同学能够提出设计方案并给出原形工具的实现。最后是为 KCL 的 VS Code 插件实现基于代码索引实现 KCL 代码 Find References 功能。

以上三个任务均是从生产使用角度提炼的真实的需求，虽然是相对独立的功能或模块，但是对于在校的同学依然会有不小的挑战。首先 KusionStack 作为一个开源的项目有一些参与的流程和规范，希望同学们通过参与真实的开源项目了解开源社区的文化和开发的一些习惯。其次，这几个任务在不同方向均兼顾了理论和实际的需求，不仅仅便于参与也可以作为长期的一个兴趣专研方向。同时我们也希望即使在 GLCC 结束，同学们能够在响应的方向上专研一段时间，在响应的方向做更多的探索。

## 5. KusionStack 任务考核全部通过

### 5.1 KCL 语言语法解析错误恢复

答辩视频：https://edut7hfmib.feishu.cn/file/boxcnZUz6CONQtpU7XV4KpqacYc

![](/images/2022/glcc-done/51.png)

- Issue：https://github.com/KusionStack/KCLVM/issues/162
- PR： https://github.com/KusionStack/KCLVM/pull/216

### 5.2 KCL 语言包管理工具

答辩视频：https://www.bilibili.com/video/BV18V4y1V7vM/?vd_source=1c9609588c8606302c89ca9a30cf168a

![](/images/2022/glcc-done/52.png)

- Issue: https://github.com/KusionStack/KCLVM/issues/223
- PR：https://github.com/KusionStack/kclvm-go/pull/66

### 5.3 基于代码索引实现 KCL 代码 Find References 功能

答辩视频：https://www.bilibili.com/video/BV1nV4y1V7gF/?vd_source=1c9609588c8606302c89ca9a30cf168a

![](/images/2022/glcc-done/53.png)

- Issue: https://github.com/KusionStack/KCLVM/issues/212
- PR：https://github.com/KusionStack/KCLVM/pull/226

完整的技术方案和代码细节讲在后面的文章中单独分享，欢迎大家关注。

## 6. 对开源的展望

开源已经成为整个社会都在讨论的话题，作为开源的参与者程序员对开源自然非常熟悉。开源最让不同的参与方同学期待的地方是有无限的可能性。通过合作的模式、通过开源社区、GitLink 和 GLCC 夏令营这个桥梁，在校的同学们可以近距离参与一线公司的真实项目，同时在公司的开发人员也可以通过和学生的交流获得不同的反馈。开源是一个多赢的协作，我们期待以后会有更多的开源社区和组织能够参与进来，同时也希望这一届的同学能够通过开源社区这种形式参与、影响和帮助后续的学弟学妹们。最后感谢大家对 KusionStack 项目的关注和支持，谢谢大家！

![](/images/2022/glcc-done/60.png)

