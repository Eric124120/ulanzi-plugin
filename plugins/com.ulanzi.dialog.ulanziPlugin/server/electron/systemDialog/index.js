const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
function systemDialog() {
  app.whenReady().then(() => {
    if (!mainWindow) {
      mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false, // 隐藏标题栏
      });
      mainWindow.loadFile('index.html');
    } else {
      mainWindow.close();
    }
  }).catch((err) => {
    console.error(err);
  })
}

module.exports = systemDialog;