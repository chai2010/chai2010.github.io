---
title: "谈谈Go语言字符串"
date: 2019-05-17
draft: false

tags: ["golang", "string"]
categories: ["golang"]
---

字符串是一种特别重要的类型, 可以说整个世界都是建立在字符串处理基础之上的, 甚至有很多专门针对字符串处理设计的编程语言(比如perl). 因为字符串处理非常重要, Go语言将字符串作为值以简化使用, 同时标准库提供了strings/fmt/strconv/regexp/template等诸多包用于协助处理字符串.

## 1. 基本用法

Go语言中字符串是一个不可修改的字节序列, 如果要做类比的话可以看作是一个只读的byte数组类型. 字符串有两种方式构建: 第一种是在代码中通过双引号包括起来的字符串字面值, 这是编译前就知道了字符串的内容; 另一种是在运行时通过代码运行动态产生的字符串.

因为Go语言源代码要求是UTF8编码, 因此字符串面值的内容也是UTF8编码的. 为了方便面值字符串的遍历, Go语言的for range内置了对UTF8的支持:

```go
for i, c := range "hello, 世界" {
    // ...
}
```

其中i是字符所在的索引下标,  c表示Unicode字符的值(对应int32类型). 因为UTF8是一种变长的编码, 因此每次i的步进长度是变化的, 每次步进的是前当前字符串对应UTF8编码的长度.

此外字符串语法还支持切片、链接和获取某个下标字节值的功能, 比如:

```go
var s = "光谷码农 - https://guanggu-coder.cn/"
var c = s[0] // 获取字节值, 而不是字符对应的Unicode值
var x = s[:len(s)-1] + "abc"
```

字符串不仅仅可以作为字面值, 还可以当做二进制数组使用, 这时候可以用于保存任意类型的数据:

```go
var s = "\xe4\xb8\x96" // 世
var x = []byte{0xE4, 0xB8, 0x96}
var s = string(x)
```

字符串的基本用法大家都是熟悉的, 我们这里不再向西展开.

## 2. 内部表示

Go语言字符串的底层结构在reflect.StringHeader中定义：

```go
type StringHeader struct {
    Data uintptr
    Len  int
}
```

字符串结构由两个信息组成：第一个是字符串指向的底层字节数组，第二个是字符串的字节的长度。字符串其实是一个结构体，因此字符串的赋值操作也就是reflect.StringHeader结构体的复制过程，并不会涉及底层字节数组的复制。

需要注意的是字符串的头部结构是切片头部结构的前缀(只是缺少了cap表示的容量部分), 这是为了便于[]byte类型的切片和字符串相互之间的转化.

## 3. 其它类型转换

这里讨论是底层有着不同数据布局的类型和字符串的相互转换. 如果是基于字符串重新定义的类型不在讨论之列.

Go语言中和字符串相关的内置转换主要有三种类型: 首先是字符转为字符串, 其次是字符串和字节切片的转换, 最后是字符串和rune切片的转换.

字符到字符串的转换时单向操作(无法从字符串反向转为字符), 下面的例子中是从“a”这个字符的ASCII值转为字符串“a”:

```go
fmt.Println(string(97))       // a
fmt.Println(string(rune(97))) // a
fmt.Println(string('a'))      // a
```

在第一行语句中, 97是一个无具体类型的数值类型的字面值常量. 在遇到string强制转型时, 只有rune类型可以和无具体类型的数值类型建立关系, 因此97被捕获为rune类型的常量, 也就是第二个语句的方法. 第三个语句中'a'是rune(97)对应字符的字面值写法.

然后是字符串和字节切片的相互转换:

```go
var s = string([]byte{97, 98, 99}) // abc
var x = []byte("abc")
```

因为字节切片和字符串底层的数据布局是相融的, 因此这种转换一般有着较高的优化空间(前提是不能破坏字符串只读的语义).

内置转换的语法中最特殊的是字符串和rune切片的转换:

```go
var s = string([]rune{97, 98, 99}) // abc
var x = []rune("abc")
```

rune其实是int32类型的别名, 因此换成以下写法会发现其特殊之处:

```go
var s = string([]int32{97, 98, 99}) // abc
var x = []int32("abc")
```

Go语言居然内置了字符串和int32切片的转型操作, 而这个操作是有相当的复杂度的(具体要涉及内存分配和UTF8字符串编码解码, 时间复杂度和长度相关)! 很多人如果看到上面代码可行, 自然会下意识将int32推广为其它整数类型的切片. 但是这只是字符串为int32开的一个特例(所以说Go语言也不是完全正交的设计, 有不是补丁特性).

除了内置的转换之外, 字符串还进程需要和其它bool/int等类型的转换. 这里大部分也是双向的转换, 不过我们重点讨论其他类型到字符串的转换. strconv包提供了很多这类转换操作:

```go
s := strconv.Itoa(-42)

s10 := strconv.FormatInt(v, 10)
s16 := strconv.FormatInt(v, 16)

s := strconv.FormatBool(true)
```

其中Itoa是Int-to-ASCII的缩写, 表示整数到字符串转换, 采用十进制模式转换.  而FormatInt则可以用于指定进制进行转换. 此外FormatBool等用于其他数值类型的转换.

strconv的转换实现性能较好. 如果不在意这转换操作这一点点的性能损耗, 可以通过fmt.Sprintf来实现到字符串的转换(fmt.Sscanf可解析, 但是打破了链式操作的便捷性):

```go
i := fmt.Srpintf("%v", -42)
b := fmt.Srpintf("%v", true)
```

fmt包会通过反射识别输入参数的类型, 然后以默认的方式转换为字符串.

此外, 对于字符串本身也提供了一种转换, 就是字符串和字符串面值格式. 比如以下代码:

```go
q := strconv.Quote(`"hello"`)     // "\"hello\""
q := fmt.Sprintf("%q", `"hello"`) // "\"hello\""
```

输出的字符串会有一个双引号包裹, 内部的特殊符号会采用转义语法表示, 它对应fmt包中%q格式的输出.

更进一步, 为了方便不支持中文的环境也能处理, 还可以选择完全用ASCII方式表示字符串面值:

```go
q := strconv.Quote(`"世"`)      // "\"\u4e16\""
q := fmt.Sprintf("%+q", `"世"`) // "\"\u4e16\""
```

其中“世”已经超出ASCII值域, 因此通过\u???语法通过Unicode码点值表示, , 它对应fmt包中%+q格式的输出.

## 4. 字符串替换

字符串处理中除了涉及其他类型和字符串之间相互转换, 另一种经常遇到的是将一个字符串处理为另一个字符串. 标准库中strings包提供了诸多字符串处理函数.

比如, 将字符串改成大写字符串:

```go
var s = strings.ToUpper("Gopher") // GOPHER
```

这其实是将字符串中某些子串根据某种指定的规则替换成新的字符串.

我们可以通过strings.Map来重新实现ToUpper的功能:

```go
strings.Map(func(r rune) rune { return r &^ ' ' }, "Gopher"))
```

strings.Map会遍历字符串中的每个字符, 然后通过第一参数传入的函数转换为新的字符, 最后构造出新的字符串. 而字符转换函数只有一个语句r &^ ' ', 作用是将小写字母转为大写字母.

strings.Map函数的输出是根据输入字符动态生成输出的字符, 但是这种替换是一个字符对应一个字符, 因此输出的字符串长度输入的字符串是一样的.

字符层面的替换是比较简单的需求. 更多时候我们需要将一个子串替换为一个新的子串. 子串的替换虽然看似功能强大, 但是因为没有统一的遍历子串的规则, 因此标准库并没有类似strings.Map这样方便的函数.

简单的替换可以通过strings. Replace完成:

```go
fmt.Println(strings.Replace("oink oink oink", "k", "ky", 2))
fmt.Println(strings.Replace("oink oink oink", "oink", "moo", -1))
```

上面是strings自带的例子. strings.Replace的第一个参数是输入的字符串, 第二个是要替换的子串, 第三个是用了替换的子串, 最后一个参数表示要替换几个子串.
如果替换规则稍微复杂一点, strings.Replace就比较难以实现了.

复杂的替换可以通过regexp的包完成:

```go
regexp.MustCompile(`a(x*)b`).ReplaceAllString("-ab-axxb-", "T")
// -T-T-
```

如果满足a(x*)b模式的子串将被替换为新的子串.

## 5. 模板输出

字符串替换其实是模板的雏形. 我们可以通过字符串替换来构造一个简单的模板:

```go
func ReplaceMap(s string, m map[string]string) string {
    for old, new := m {
        s = strings.Replace(s, old, new, -1)
    }
    return s
}

func main() {
    var s = ReplaceMap(`{a}+{b} = {c}`, map[string]string{
        "a": 1, "b": 2, "c": 3,
    })
}
```

通过{name}来表示要替换的子串, 然后通过map来定一个子串替换表格.

基于类型的技巧, 我们可以将{name}定义为子串的查找规则, 这样我们将得到一个子串列表:

```go
func MapString(s string,
    mapping func(x string) string,
) string {
    re := regexp.MustCompile(`\{\w+\}`)
    for _, old := range re.FindAllString("{name}{age}", -1) {
        s = strings.Replace(s, old, mapping(old), -1)
    }
}
```

既然能够得到子串列表, 那么就可以仿造strings.Map的接口, 通过一个转换函数来实现子串的替换(函数比表格更加灵活).

如果结合反射机制, 完全可以基于一个接口类型输出转换表格:

```go
func RenderTemplate(s string, data interface{}) string {
    return MapString(s, func(filedName string) string {
        // 通过反射, 根据 filedName 从 data 获取数据
    })
}
```

当然, 这种模板比较粗糙, 没有实现结构化编程中分支和循环等语句的支持. 完整的模板可以查看标准库的template包实现. template包是一个较大的话题, 有机会的话会在新的文章中专门讨论.

