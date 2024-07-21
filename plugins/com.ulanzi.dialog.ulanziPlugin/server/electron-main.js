/*
 * @Author: 黄承文 chengwen@ssc-hn.com
 * @Date: 2024-07-21 16:03:45
 * @LastEditors: 黄承文 chengwen@ssc-hn.com
 * @LastEditTime: 2024-07-22 01:48:54
 * @FilePath: /ulanzi-plugin/plugins/com.ulanzi.dialog.ulanziPlugin/server/electron-main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const {cutDialog, systemDialog} = require('./electron/index');

function createWindow() {
  // 创建一个新的窗口
  const mainWin = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // 需要禁用上下文隔离以使用 ipcRenderer
    }
  });
  mainWin.loadFile('electron.html');
}

ipcMain.on('trigger-cut-dialog', (_event, ...args) => {
  cutDialog.apply(null, args);
});

ipcMain.on('trigger-system-dialog', (_event, ...args) => {
  systemDialog.apply(null, args);
})
app.on('ready', createWindow);