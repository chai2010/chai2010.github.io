// Copyright 2017 ChaiShushan <chaishushan{AT}gmail.com>. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const electron = require('electron')

let win = null

electron.app.on('ready', () => {
    if(win == null) {
        win = new electron.BrowserWindow()

        win.loadURL(`file:///${__dirname}/index.html`)
    }
})
