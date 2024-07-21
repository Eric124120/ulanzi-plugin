const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
function cutDialog() {
  app.whenReady().then(() => {
    if (!mainWindow) {
      mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        // frame: false, // 隐藏标题栏
        webPreferences: {
          nodeIntegration: true
        }
      });
      mainWindow.loadFile('index.html');
    } else {
      mainWindow.close();
      mainWindow = null;
    }
  }).catch((err) => {
    console.error(err);
  })
}
module.exports = cutDialog;