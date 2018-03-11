---
title: "Arduino备忘资料"
date: 2009-05-12

categories: [硬件, Arduino]
---

### WiringNano

WiringNano是参考Wiring Mini和Arduino Nano两款板子改的.

![](/images/arduino/WiringNano_01.jpg)

对于Wiring Mini的优点是, 增加了USB接口, 可以直接通过USB供电和串口通讯.
对于Arduino Nano的优点是, 采用ATMega128单片机, 功能更强大.

软件部分打算自己重新做一个, api可以部分参考wiring和arduino, 主要是要
增加一个实时系统.

WiringNano的外形尺寸和Wiring Mini一致, 下面是Wiring Mini的外形:

![](/images/arduino/WiringNano_02.jpg)

以前没做过板子, PCB做起来遇到很多问题. 不过是业余的东西, 慢慢来了 :)


### 基于ATmega128的Wiring

官方的Wiring开发板:

![](/images/arduino/Wiring.jpg)

据说Arduino也是参考的Wiring设计. 今天看了一些它的网站, 发现软件基本一样, 电路也基本一样.
比较理想的是Wiring是采用的128芯片, 如果再把软件接口加强一下, 就完全符合我的需求了.

这是我参考Arduino改造的原理图:

![](/images/arduino/wiring128-01.jpg)

这是 Eagle 软件渲染的效果图:

![](/images/arduino/wiring128-02.jpg)
