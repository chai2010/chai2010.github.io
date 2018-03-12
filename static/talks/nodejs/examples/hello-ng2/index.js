"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron = require("electron");
var win = null;
function createWindow() {
    win = new electron.BrowserWindow({ width: 800, height: 600 });
    win.loadURL("file://" + __dirname + "/demo.html");
    win.webContents.openDevTools();
    win.on('closed', function () { win = null; });
}
function main() {
    electron.app.on('ready', function () {
        createWindow();
    });
    electron.app.on('activate', function () {
        createWindow();
    });
    electron.app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') {
            electron.app.quit();
        }
    });
}
if (require.main === module) {
    main();
}
