// Copyright 2017 ChaiShushan <chaishushan{AT}gmail.com>. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const electron = require('electron')

let win = null

electron.app.on('ready', () => {
    if(win == null) {
        win = new electron.BrowserWindow({titleBarStyle: 'hidden'})
		//win.webContents.openDevTools() // <-- 打开调试窗口

        win.loadURL(`file:///${__dirname}/index.html`)

    }
})

electron.ipcMain.on('myapp', (event, ...args) => {
    console.log('args:', ...args)

    if(args.length > 0 && args[0] == 'quit') {
        electron.app.quit()
    }
})
