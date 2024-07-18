const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
function cutDialog() {
  console.log('-----------cut', app)
  // if (!mainWindow) {
  //   mainWindow = new BrowserWindow({
  //     width: 800,
  //     height: 600,
  //     // frame: false, // 隐藏标题栏
  //     webPreferences: {
  //       nodeIntegration: true
  //     }
  //   });
  //   mainWindow.loadFile('index.html');
  // } else {
  //   mainWindow.close();
  // }
}
module.exports = cutDialog;