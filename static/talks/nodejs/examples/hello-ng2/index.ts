// Copyright 2017 chaishushan{AT}gmail.com. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import * as fs from 'fs'
import * as electron from 'electron'

let win: Electron.BrowserWindow = null

function createWindow() {
	win = new electron.BrowserWindow({width: 800, height: 600})
	win.loadURL(`file://${__dirname}/demo.html`)
	win.webContents.openDevTools()

	win.on('closed', () => { win = null })
}

function main() {
	electron.app.on('ready', () => {
		createWindow()
	})
	electron.app.on('activate', () => {
		createWindow()
	})
	electron.app.on('window-all-closed', () => {
		if(process.platform !== 'darwin') {
			electron.app.quit()
		}
	})
}

if(require.main === module) {
	main()
}

