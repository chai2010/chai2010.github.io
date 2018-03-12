// Copyright 2017 ChaiShushan <chaishushan{AT}gmail.com>. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const helloPkg = require('./hello')
const hiPkg = require('./hi')

exports.sayHello = helloPkg.sayHello
exports.hi = hiPkg.hi
