---
title: "Go1.1性能测试报告(和C差距在10%以内)"
date: 2013-05-14
draft: false

tags: ["golang"]
categories: [golang]
---

<!-- Go1.1性能测试报告(和C差距在10%以内) -->
<!-- http://blog.golang.org/2011/06/profiling-go-programs.html -->

最近Go1.1正式发布, 根据官方的说法, Go1.1性能比Go1.0提升基本有30%-40%, 有时更多(当然也有不明显的情况).

Go1.1的详细介绍: **[Go1.1新特性介绍(语言和库更完善/性能提高约30%)](http://my.oschina.net/chai2010/blog/117984)**.

这里是针对Go1.1和C语言的性能测试: 测试的重点是语言的性能, 当然也会受到标准库性能的影响.

## 测试环境

- 测试程序: [$GOROOT/test/bench/shootout/timing.sh](http://go.googlecode.com/hg/test/bench/shootout/timing.sh)
- 硬件配置: Intel(R) Core(TM) i7-3770 CPU @ 3.40GHz; 16GB内存
- 操作系统: CentOS6.3 x86_64

**补充:** i7-3770是4核心8线程.

`gcc`和`gc`版本:

	gcc -v
	gcc version 4.4.7 20120313 (Red Hat 4.4.7-3) (GCC)

	go version
	go version go1.1 linux/amd64

## 测试结果

	$GOROOT/test/bench/shootout/timing.sh
	fasta -n 25000000
		gcc -m64 -O2 fasta.c              0.86u 0.00s 0.87r
		gc fasta                          0.85u 0.00s 0.86r
		gc_B fasta                        0.83u 0.00s 0.83r

	reverse-complement < output-of-fasta-25000000
		gcc -m64 -O2 reverse-complement.c 0.45u 0.05s 0.50r
		gc reverse-complement             0.60u 0.05s 0.65r
		gc_B reverse-complement           0.55u 0.04s 0.59r

	nbody -n 50000000
		gcc -m64 -O2 nbody.c -lm          5.51u 0.00s 5.52r
		gc nbody                          7.16u 0.00s 7.18r
		gc_B nbody                        7.12u 0.00s 7.14r

	binary-tree 15 # too slow to use 20
		gcc -m64 -O2 binary-tree.c -lm    0.31u 0.00s 0.31r
		gc binary-tree                    1.08u 0.00s 1.07r
		gc binary-tree-freelist           0.15u 0.00s 0.15r

	fannkuch 12
		gcc -m64 -O2 fannkuch.c           26.45u 0.00s 26.54r
		gc fannkuch                       35.99u 0.00s 36.08r
		gc fannkuch-parallel              73.40u 0.00s 18.58r
		gc_B fannkuch                     25.18u 0.00s 25.25r

	regex-dna 100000
		gcc -m64 -O2 regex-dna.c -lpcre   0.25u 0.00s 0.26r
		gc regex-dna                      1.65u 0.00s 1.66r
		gc regex-dna-parallel             1.72u 0.01s 0.67r
		gc_B regex-dna                    1.64u 0.00s 1.65r

	spectral-norm 5500
		gcc -m64 -O2 spectral-norm.c -lm  9.63u 0.00s 9.66r
		gc spectral-norm                  9.63u 0.00s 9.66r
		gc_B spectral-norm                9.63u 0.00s 9.66r

	k-nucleotide 1000000
		gcc -O2 k-nucleotide.c -I/usr/include/glib-2.0 -I/usr/lib64/glib-2.0/include -lglib-2.0  2.62u 0.00s 2.63r
		gc k-nucleotide                   2.69u 0.01s 2.71r
		gc k-nucleotide-parallel          3.02u 0.00s 0.97r
		gc_B k-nucleotide                 2.66u 0.01s 2.68r

	mandelbrot 16000
		gcc -m64 -O2 mandelbrot.c        20.95u 0.00s 21.01r
		gc mandelbrot                    23.73u 0.00s 23.79r
		gc_B mandelbrot                  23.72u 0.00s 23.79r

	meteor 2098
		gcc -m64 -O2 meteor-contest.c     0.05u 0.00s 0.05r
		gc meteor-contest                 0.06u 0.00s 0.07r
		gc_B meteor-contest               0.06u 0.00s 0.06r

	pidigits 10000
		gcc -m64 -O2 pidigits.c -lgmp     0.77u 0.00s 0.77r
		gc pidigits                       1.45u 0.01s 1.44r
		gc_B pidigits                     1.45u 0.01s 1.43r

	threadring 50000000
		gcc -m64 -O2 threadring.c -lpthread     12.05u 261.20s 216.36r
		gc threadring                           6.61u 0.00s 6.63r

	chameneos 6000000
		gcc -m64 -O2 chameneosredux.c -lpthread 4.04u 21.08s 4.20r
		gc chameneosredux                       4.97u 0.00s 4.99r


## 测试结果说明

其中`gc_B`是开了`-B`选项, 选项的说明如下:

	go tool 6g -h
	usage: 6g [options] file.go...
	  -+    compiling runtime
	  -%    debug non-static initializers
	  -A    for bootstrapping, allow 'any' type
	  -B    disable bounds checking
	...

应该就是禁用了Go的slice下标越界检测等特性.

测试的结果显示Go的性能已经和C语言已经非常接近了, 有极个别的场景甚至比C还好(`binary-tree`).

根据`$GOROOT/test/bench/shootout/timing.log`的数据, `gccgo` 的优化应该更好一点.

不过目前`gccgo`的标准库比`gc`标准库可能要差一些(gccgo1.1还未发布), 因此有些测试性能比`gc`差一些.

我电脑没有安装gccgo, 因此只有gcc/gc/gc_B三个测试结果.


## 关于 BenchmarksGame 的测试差异

[http://benchmarksgame.alioth.debian.org/u64q/go.php](http://benchmarksgame.alioth.debian.org/u64q/go.php)

**说明:** [BenchmarksGame](http://benchmarksgame.alioth.debian.org/u64q/go.php)
不是为了测试不同语言的最优性能, 而且为了测试不同语言最自然状态下编写程序的性能.
比如, `binary-trees`测试就是禁止自己定制专有的缓冲池的, 而C语言的版本则可以随意使用
各种优化手段(基于`apr`和缓冲池和`openmp`的并行优化).

[BenchmarksGame](http://benchmarksgame.alioth.debian.org/u64q/go.php)的测试结果中, 有几个Go的性能很差(已经提交了`spectral-norm`的优化版本):

	Benchmark      Time Memory   Code
	fasta           3×    3×      ±
	spectral-norm   4×    3×      ±
	binary-trees   13×    4×      ±
	regex-dna †    26×    ±      1/4

**补充:** [BenchmarksGame](http://benchmarksgame.alioth.debian.org/u64q/go.php) 测试的是程序实际运行时间, [GoBench](http://go.googlecode.com/hg/test/bench/shootout/) 是测试的CPU时间. 如果 [GoBench](http://go.googlecode.com/hg/test/bench/shootout/) 要减少实际时间, 需要充分利用多个CPU的运算资源(Go测试代码对多CPU的性能还有待进一步分析).

**补充:**  [BenchmarksGame](http://benchmarksgame.alioth.debian.org/u64q/go.php)的
`binary-trees`测试禁止自己定制专有的缓冲池. 因此, 只能寄希望于Go的GC性能改进或新的`sync.Cache`能尽快发布.

为了方便比较, 在同一台机器上对比了 [BenchmarksGame](http://benchmarksgame.alioth.debian.org/u64q/go.php) 和 [GoBench](http://go.googlecode.com/hg/test/bench/shootout/) 的测试结果 .

完整测试代码在: [https://bitbucket.org/chai2010/gobench](https://bitbucket.org/chai2010/gobench)

**spectral-norm.go的优化**

Go自带的`spectral-norm`测试性能比BenchmarksGame的性能要低.

我对`spectral-norm`的代码进行了优化, 优化之后的性能比BenchmarksGame要好一些.

优化前的代码(spectral-norm.go):

	func evalA(i, j int) float64 { return 1 / float64(((i+j)*(i+j+1)/2 + i + 1)) }
	v[i] += evalA(i, j) * u[j]

函数`evalA`将整数表达式先转换为`float64`, 然后做了一次倒数运算. 其中倒数的运算有一定冗余.

优化后的代码(chai2010-spectral-norm.go):

	func evalA(i, j int) int { return ((i+j)*(i+j+1)/2 + i + 1) }
	v[i] += u[j] / float64(evalA(i, j))

只在必要的时候才做浮点的转换, 减少了一次倒数的运算.

测试时间由 `9.62u` 减少到 `4.35u`, 性能提高约1倍.

**完整的对比结果如下:**

	./timing.sh
	fasta -n 25000000
		gcc -m64 -O3 -fomit-frame-pointer -march=native -mfpmath=sse -msse3 alioth-fasta.gcc-2.c   0.96u 0.18s 1.15r
		gcc -m64 -O3 alioth-fasta.gcc-2.c       0.92u 0.22s 1.15r
		gcc -m64 -O2 alioth-fasta.gcc-2.c       0.99u 0.15s 1.15r
		gc alioth-fasta 3.04u 0.00s 3.06r
		gc_B alioth-fasta       3.03u 0.00s 3.04r
		gcc -m64 -O3 fasta.c    0.87u 0.00s 0.87r
		gcc -m64 -O2 fasta.c    0.86u 0.00s 0.87r
		gc fasta        0.85u 0.00s 0.86r
		gc_B fasta      0.83u 0.00s 0.83r

	spectral-norm 5500
		g++ -m64 -O3 -march=native -fopenmp -mfpmath=sse -msse2 alioth-spectralnorm.gpp-2.cpp   4.69u 0.00s 0.59r
		g++ -m64 -O2 -march=native -fopenmp -mfpmath=sse -msse2 alioth-spectralnorm.gpp-2.cpp   4.69u 0.00s 0.59r
		gc alioth-spectralnorm  6.75u 0.00s 1.67r
		gc_B alioth-spectralnorm        6.93u 0.00s 1.69r
		gcc -m64 -O2 spectral-norm.c -lm        9.63u 0.00s 9.66r
		gc spectral-norm        9.62u 0.00s 9.65r
		gc_B spectral-norm      9.62u 0.00s 9.66r
		gc spectral-norm-parallel       9.86u 0.00s 4.91r
		gc_B spectral-norm-parallel     9.85u 0.00s 4.90r
		gc chai2010-spectral-norm       4.35u 0.00s 4.36r
		gc_B chai2010-spectral-norm     4.35u 0.00s 4.36r
		gc chai2010-spectral-norm-parallel      5.15u 0.00s 2.21r
		gc_B chai2010-spectral-norm-parallel    4.58u 0.00s 2.22r

	binary-tree 15 # too slow to use 20
		gcc -m64 -O3 -fomit-frame-pointer -march=native -fopenmp -I/usr/include/apr-1 -lapr-1 -lgomp alioth-binarytrees.gcc-7.c -lm 0.21u 0.00s 0.03r
		gcc -m64 -O3 -fopenmp -I/usr/include/apr-1 -lapr-1 -lgomp alioth-binarytrees.gcc-7.c -lm   0.21u 0.00s 0.03r
		gcc -m64 -O2 -fopenmp -I/usr/include/apr-1 -lapr-1 -lgomp alioth-binarytrees.gcc-7.c -lm   0.23u 0.00s 0.03r
		gc alioth-binarytrees   2.16u 0.04s 0.42r
		gc_B alioth-binarytrees 2.20u 0.04s 0.42r
		gcc -m64 -O3 binary-tree.c -lm  0.34u 0.00s 0.34r
		gcc -m64 -O2 binary-tree.c -lm  0.31u 0.00s 0.31r
		gc binary-tree  1.07u 0.00s 1.07r
		gc binary-tree-freelist 0.15u 0.00s 0.15r

	regex-dna 100000
		gc alioth-regexdna      2.07u 0.00s 0.64r
		gc_B alioth-regexdna    2.22u 0.00s 0.71r
		gcc -m64 -O2 regex-dna.c -lpcre 0.25u 0.00s 0.26r
		gc regex-dna    1.63u 0.00s 1.64r
		gc regex-dna-parallel   1.84u 0.00s 0.72r
		gc_B regex-dna  1.63u 0.00s 1.64r


分析测试的数据, 有以下几个特征(仅针对当前的测试):

- `gcc`的`-O3`和`-O2`以及`-fomit-frame-pointer`等优化参数对性能的优化在20%以内, 可以暂时忽略
- `gc_B`和`gc`的对性能的优化在5%以内, 可以暂时忽略
- BenchmarksGame 和 GoBench 的C版本测试程序性能很接近(fasta是BenchmarksGame稍好, binary-tree是GoBench稍好)
- 大部分BenchmarksGame 和 GoBench 的**Go版本**测试程序性能**差距巨大**, GoBench要比BenchmarksGame快2~4X.
- BenchmarksGame 的 `spectralnorm` 测试性能比 GoBench 的要好(`6.75u`/`9.86u`)
- 经过我手工优化过的 GoBench 的 `chai2010-spectral-norm` 测试性能比 BenchmarksGame 的要好(`5.15`/`6.75u`)
- BenchmarksGame 的 `regexdna` 暂时缺少C语言版本的测试数据(没有编译过)
- GoBench 的 binary-tree-freelist 使用内存池对性能提高约 7X.

综上可以发现 **BenchmarksGame 的很多 Go 版本测试程序性能较差(甚至快到10X的差距)**.
关于 BenchmarksGame 的 Go 测试程序性能低的原因, 大家可以自己去分析代码.

关于`regex`的测试主要是因为Go的regex标准库比高度优化的C库`pcre`还是较慢,
目前Go的`regex`库还有待进一步的优化.

关于`pidigits`的测试, BenchmarksGame 和 GoBench 基本是一致的:
目前`math/big`和`gmp`的性能还有2倍的差距.

关于BenchmarksGame和GoBench 的测试差异的很多细节还需要进一步分析.
重点应该是64位系统下多核和并发的性能对比(毕竟Go是多核时代的编程语言).


## 官方的测试结论

[http://go.googlecode.com/hg/test/bench/shootout/timing.log](http://go.googlecode.com/hg/test/bench/shootout/timing.log):

	# Sep 26, 2012
	# 64-bit ints, plus significantly better floating-point code.
	# Interesting details:
	# 	Generally something in the 0-10% slower range, some (binary tree) more
	#	Floating-point noticeably faster:
	#		nbody -25%
	#		mandelbrot -37% relative to Go 1.
	#	Other:
	#		regex-dna +47%

Go已经和C差距在10%以内, 有特殊场景性能甚至更好.

## 2013.11.26 补充的官方数据:

	# May 23, 2013
	# Go 1.1, which includes precise GC, new scheduler, faster maps.
	# 20%-ish speedups across many benchmarks.
	# gccgo showing significant improvement (even though it's not yet up to Go 1.1)
	#
	# Standouts:
	#	fannkuch, regex-dna, k-nucleotide, threadring, chameneos

在很多测试中, gccgo的性能已经开始超越gc编译的程序的性能.

大数运算的性能比 gmp 还在差  30~40%.

正则比pcre还慢约 5 倍.
