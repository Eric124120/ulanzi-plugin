/*
 * @Author: 黄承文 chengwen@ssc-hn.com
 * @Date: 2024-07-21 15:06:48
 * @LastEditors: 黄承文 chengwen@ssc-hn.com
 * @LastEditTime: 2024-07-22 02:13:22
 * @FilePath: /ulanzi-plugin/plugins/com.ulanzi.dialog.ulanziPlugin/server/electron/cutDialog/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');

let mainWindow;
function cutDialog(cutList) {
  app.whenReady().then(() => {
    if (!mainWindow) {
      mainWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width: 1600,
        height: 1480,
        frame: false, // 隐藏标题栏
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false, // 禁用 remote 模块
            nodeIntegration: false
        }
      });
      mainWindow.loadFile(path.resolve(__dirname, 'index.html'));
      // mainWindow.webContents.openDevTools();
      // 剪切板信息发送给页面
      mainWindow.webContents.send('send-cut-info', cutList);
      mainWindow.on('close', () => {
        mainWindow = null;
      });
      ipcMain.on('close-cut-dialog', () => {
        if (mainWindow && typeof mainWindow.close === 'function') {
          mainWindow.close();
        }
      });
      ipcMain.on('copy-text', (_event, text) => {
        clipboard.writeText(text);
      });
      ipcMain.on('copy-custom', (_event, data) => {
        clipboard.write({
          'application/x-custom-format': data
        });
      });
    } else {
      mainWindow.close();
    }
  }).catch((err) => {
    console.error(err);
  })
}
module.exports = cutDialog;