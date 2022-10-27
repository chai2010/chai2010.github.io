---
title: "Go 语言 CGO 用户深度定制 SQLite 代码"
date: 2022-10-26
draft: false

tags: ["golang", "sqlite", "cgo"]
categories: ["golang", "sqlite", "cgo"]
---

本文是 BRUNO CALZA 记录的关于如何改变SQLite源代码，使记录行更新时可用于 Go 的更新钩子函数的过程。原文通过深度定制 C 语言的 API 函数达成目的，这几乎是所有 CGO 深度用户必然经历的过程（关于 CGO 的基本用法可以参考译者的《Go高级编程》第2章），是一个非常有借鉴意义的技术文章。

- 作者：[BRUNO CALZA](https://brunocalza.me/author/brunocalza)
- 译者：柴树杉，[凹语言](https://github.com/wa-lang/wa) 作者、Go语言贡献者、多本Go语言图书作者，目前在蚂蚁从事 [KusionStack](https://github.com/kusionStack/kusion) 和 KCL 开发。
- 原文：https://brunocalza.me/making-a-change-to-sqlite-source-code/

## 1. 背景

有一天，我正在考虑如何在 SQLite 中获取最近插入或更新的行记录的数据。这样做的动机是我想创建该行的 hash，本质上是为了在插入或更新行时能够构建相应表的 [Merkle 树](https://en.wikipedia.org/wiki/Merkle_tree)。

SQLite 提供的最符合的 API 可能是 [`sqlite3_update_hook`](https://www.sqlite.org/c3ref/update_hook.html):

> `sqlite3_update_hook()` 函数为数据库连接注册一个回调函数，该数据库连接由第一个参数标识，在 rowwid 表中更新、插入或删除行时调用。

这个 API 的问题是它只返回行的 [rowid](https://sqlite.org/lang_createtable.html#rowid)。这意味着还需要为列内的行获取所有列。即使使用这种方法，我仍然无法获得行记录的原始数据。只能得到那一行的驱动信息。

关于如何构建这样的树可能有很多方法，但就我而言 SQLite API 并没有提供真正想要的东西。因此，我决定趁此机会更深入地挖掘下源代码，同时看看内部实现的细节。不仅如此，我希望可以对它进行一些修改和测试，看看能否满足需求。

因为对 C 语言的畏惧，开始我只是想假装看下几个源文件就跑路。没想到这次真的有惊喜。

## 2. 看看 SQLite 的代码结构

首先使用 `fossil` 工具克隆了 [SQLite源代码](https://sqlite.org/src/doc/trunk/README.md)，下面是文件。

![SQLite 代码目录](/images/2022/making-a-change-to-sqlite-source-code/01.png)

如果你对数据库比较熟悉，或许可以猜测出一些文件对应的操作。因此，我决定直接跳到 `insert.c` 文件，看看能不能找到一些有趣的东西。

遍历函数名列表，路过 [`sqlite3Insert`](https://github.com/sqlite/sqlite/blob/version-3.39.4/src/insert.c#L671) 函数，看到以下注释：

```
** This routine is called to handle SQL of the following forms:
**
**    insert into TABLE (IDLIST) values(EXPRLIST),(EXPRLIST),...
**    insert into TABLE (IDLIST) select
**    insert into TABLE (IDLIST) default values
**
```

也许在这个函数中有一些可鼓捣的地方。我能够对其中发生的情况进行一些猜测，但引起我注意的是对名称类似于 `sqlite3vdbeXXX` 的函数的函数调用的数量。

这让我想起 SQLite 底层使用了一个名为 [vdbe](https://www.sqlite.org/opcode.html) 的虚拟机。这意味着所有SQL语句都首先被翻译成该虚拟机的语言。然后，执行引擎执行虚拟机代码。让我们看一个简单的 `INSERT` 语句如何被翻译成字节码:

```
sqlite> create table a (a int, b text);
sqlite> explain INSERT INTO a VALUES (1, 'Hello');
addr  opcode         p1    p2    p3    p4             p5  comment      
----  -------------  ----  ----  ----  -------------  --  -------------
0     Init           0     8     0                    0   Start at 8
1     OpenWrite      0     2     0     2              0   root=2 iDb=0; a
2     Integer        1     2     0                    0   r[2]=1
3     String8        0     3     0     Hello          0   r[3]='Hello'
4     NewRowid       0     1     0                    0   r[1]=rowid
5     MakeRecord     2     2     4     DB             0   r[4]=mkrec(r[2..3])
6     Insert         0     4     1     a              57  intkey=r[1] data=r[4]
7     Halt           0     0     0                    0   
8     Transaction    0     1     1     0              1   usesStmtJournal=0
9     Goto           0     1     0                    0   
```

我得出的结论是 [`sqlite3Insert`](https://github.com/sqlite/sqlite/blob/version-3.39.4/src/insert.c#L671) 实际上是根据SQLite插入规则，将解析后的 `INSERT` 语句转换为一系列虚拟机字节码指令。

因此这并不是我要找的地方。我真正需要的是在插入之前创建记录的位置。我猜测那只能是执行虚拟机代码的地方，可能是执行 `Insert (OP_INSERT)` 操作码的地方。

根据上图我直接找到了 `vdbe.c` 文件的位置，直奔主题。

我发现有一个有 8000行代码的 `switch( pOp->opcode )` 语句，通过 `OP_INSERT` 关键字找到插入操作对应的代码位置。

在对应分支的第一行中，总算找到了相关的线索:

```c
 Mem *pData;       /* MEM cell holding data for the record to be inserted */
```

所以 `pData` 指向要插入的记录数据。您可以在 `L5402` 中看到`pData = &aMem[pOp->p2];`，它是如何将 `pData` 值设置为虚拟机内存 `aMem` 地址的，该地址位于虚拟机寄存器 `p2` 所指向的位置。

快速回顾一下: 首先在 `insert.c` 文件我们了解到 `INSERT` 语句被翻译成一堆虚拟机指令。然后通过 `INSERT` 的数据通过这些`sqlite3vdbeXXX` 调用到达虚拟机。我假设将 `OP_INSERT` 操作码和数据注册到虚拟机是在第2593行:

```c
sqlite3VdbeAddOp3(v, OP_Insert, iDataCur, aRegIdx[i], regNewData);
```

下面 `regNewData` 的一个更详细的说明:

```
** The regNewData parameter is the first register in a range that contains
** the data to be inserted or the data after the update.  There will be
** pTab->nCol+1 registers in this range.  The first register (the one
** that regNewData points to) will contain the new rowid, or NULL in the
** case of a WITHOUT ROWID table.  The second register in the range will
** contain the content of the first table column.  The third register will
** contain the content of the second table column.  And so forth.
**
** The regOldData parameter is similar to regNewData except that it contains
** the data prior to an UPDATE rather than afterwards.  regOldData is zero
** for an INSERT.  This routine can distinguish between UPDATE and INSERT by
** checking regOldData for zero.
```

所以，在这一点上，我们正在用数据执行机器代码。代码向下滚动一点，让我们看看如何使用 `pData`。在 `L5448-L5449` 处可以看到:

```c
  x.pData = pData->z;
  x.nData = pData->n;
```

`x` 的定义如下：

```c
 BtreePayload x;   /* Payload to be inserted */
```

完美。再向下滚动一点，我们看到:

```c
  rc = sqlite3BtreeInsert(pC->uc.pCursor, &x,
      (pOp->p5 & (OPFLAG_APPEND|OPFLAG_SAVEPOSITION|OPFLAG_PREFORMAT)), 
      seekResult
  );
```

我们终于找到了插入原始数据的位置。但是，我们怎么知道它的格式和这里记录的一样呢? 如果仔细查看示例 `INSERT` 中的虚拟机代码，在`INSERT` 操作码之前有一个 `MakeRecord` 操作码，它负责构建记录。

你可以在 `vdb.c` 文件中查看 `OP_MakeRecord` 实现，并看到以下注释:

You can check the OP_MakeRecord implementation at vdbe.c file and see the following comment:

> 将 `P1` 开头的 `P2` 寄存器转换为记录格式，用作数据库表中的数据记录或索引中的键。

在 `case` 语句的最后几行看到了关键部分:

```c
  /* Invoke the update-hook if required. */
  if( rc ) goto abort_due_to_error;
  if( pTab ){
    assert( db->xUpdateCallback!=0 );
    assert( pTab->aCol!=0 );
    db->xUpdateCallback(db->pUpdateArg,
           (pOp->p5 & OPFLAG_ISUPDATE) ? SQLITE_UPDATE : SQLITE_INSERT,
           zDb, pTab->zName, x.nKey);
  }
  break;
```

看来我需要的东西都在这里了。更新钩子钩子和原始数据。只需要更新时传递给回调函数即可。

## 3. 开始定制 SQLite

这就是我期望的 API：

```c
db->xUpdateCallback(db->pUpdateArg,
	(pOp->p5 & OPFLAG_ISUPDATE) ? SQLITE_UPDATE : SQLITE_INSERT,
	zDb, pTab->zName, x.nKey, pData->z, pData->n);
```

传递的是数据（`pData->z`）和其大小(`pData->n`)。

为了解释函数签名的变化，还需要在多个地方进行相应的修改。

以下是 `fossil` 工具提示的变化的源文件：

```
EDITED     src/main.c
EDITED     src/sqlite.h.in
EDITED     src/sqlite3ext.h
EDITED     src/sqliteInt.h
EDITED     src/tclsqlite.c
EDITED     src/vdbe.c
```

还有一些针对编译提示的修改。

## 4. 克隆一份 Go SQLite 驱动

现在是时候在一个 Go 程序中创建一个简单的测试了。我比较熟悉与 SQLite 交互的 `mattn/go-sqlite3` 驱动程序。该项目通过导入SQLite合并文件并通过CGO绑定工作。

因此还需要再克隆下 Go SQLite 驱动，更新被我修改的文件。并在Go API中进行了必要的更新以访问新值。

主要是对 `updateHookTrampoline` 的更改，现在接收记录为 `*C.Char` 和 `int` 类型的数据大小，转型为字节 Slice 并将其传递给回调函数:

```go
func updateHookTrampoline(handle unsafe.Pointer, op int, db *C.char, table *C.char, rowid int64, data *C.char, size int) {
	callback := lookupHandle(handle).(func(int, string, string, int64, []byte))
	callback(op, C.GoString(db), C.GoString(table), rowid, C.GoBytes(unsafe.Pointer(data), C.int(size)))
}
```

`RegisterUpdateHook` 函数也需要做同样的调整。

## 5. 改动后的效果

现在已经准备好了测试的所有东西。让我们运行一个简单的例子，灵感来自 [SQLite Internals: Pages & B-trees](https://fly.io/blog/sqlite-internals-btree/) 博客文章。

```go
package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/mattn/go-sqlite3"
)

func main() {
	sqlite3conn := []*sqlite3.SQLiteConn{}
	sql.Register("sqlite3_with_hook_example",
		&sqlite3.SQLiteDriver{
			ConnectHook: func(conn *sqlite3.SQLiteConn) error {
				sqlite3conn = append(sqlite3conn, conn)
				conn.RegisterUpdateHook(func(op int, db string, table string, rowid int64, data []byte) {
					switch op {
					case sqlite3.SQLITE_INSERT:
						fmt.Printf("%x\n", data)
					}
				})
				return nil
			},
		})
	os.Remove("./foo.db")

	srcDb, err := sql.Open("sqlite3_with_hook_example", "./foo.db")
	if err != nil {
		log.Fatal(err)
	}
	defer srcDb.Close()
	srcDb.Ping()

	_, err = srcDb.Exec(`CREATE TABLE sandwiches (
		id INTEGER PRIMARY KEY,
		name TEXT,
		length REAL,
		count INTEGER
	);`)
	if err != nil {
		log.Fatal(err)
	}
	_, err = srcDb.Exec("INSERT INTO sandwiches (name, length, count) VALUES ('Italian', 7.5, 2);")
	if err != nil {
		log.Fatal(err)
	}
}
```

不要忘记添加更新 `go.mod` 文件 `replace github.com/mattn/go-sqlite3 => github.com/brunocalza/go-sqlite3 v0.0.0-20220926005737-36475033d841`，重新定向驱动。

运行后应该得到以下的结果：

```
05001b07014974616c69616e401e00000000000002
```

这正是 `('Italian', 7.5, 2)` 数据的 Efficient Sandwich 编码的结果，不包含主键和记录的长度(前两个字节)。

看到输出结果我才发现能够理解SQLite源代码的部分内容真的很有趣，尽管我不理解它的大部分。但是我做了一些更改并看到这些更改，并通过 Go 的驱动程序看到结果的变化。

老实说这种更改数据库源代码的方法风险太大。与新版本保持同步也是一个太大的问题，但这是一个值得记录的有趣经历。

