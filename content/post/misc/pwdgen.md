---
title: "PwdGen - 用Go语言实现的密码生成工具"
date: 2013-03-27
draft: false

tags: ["password"]
categories: []
---

针对CSDN等各大网站私自保存密码的问题, 尝试用Go语言 写了个密码生成工具.

<!--more-->

[pwdgen](https://bitbucket.org/chai2010/pwdgen/wiki/Home) 是 password generator 的缩写, 支持生成[KeePass](http://keepass.info/ )格式.

下面是生成算法和实现的代码:

	// base58(sha512(md5hex(encrypt_key+encrypt_salt)+site_id+site_salt)[0:16]
	func pwdgen(site_id, site_salt, encrypt_key, encrypt_salt string) string {
		md5 := md5.New()
		md5.Write([]byte(encrypt_key + encrypt_salt))
		md5Hex := fmt.Sprintf("%x", md5.Sum(nil))

		sha := sha512.New()
		sha.Write([]byte(md5Hex + site_id + site_salt))
		shaSum := sha.Sum(nil)

		pwd := base58.EncodeBase58(shaSum)[0:16]
		return string(pwd)
	}

完整的程序请访问: [https://bitbucket.org/chai2010/pwdgen/wiki/Home][pwdgen]

在线文档请访问:

- [http://godoc.org/bitbucket.org/chai2010/pwdgen][pwdgen-doc]
- [http://godoc.org/bitbucket.org/chai2010/pwdgen/base58][pwdgen-base58-doc]
- [http://godoc.org/bitbucket.org/chai2010/pwdgen/ini][pwdgen-ini-doc]

  [pwdgen]: https://bitbucket.org/chai2010/pwdgen/wiki/Home
  [pwdgen-doc]: http://godoc.org/bitbucket.org/chai2010/pwdgen
  [pwdgen-base58-doc]: http://godoc.org/bitbucket.org/chai2010/pwdgen/base58
  [pwdgen-ini-doc]: http://godoc.org/bitbucket.org/chai2010/pwdgen/ini


