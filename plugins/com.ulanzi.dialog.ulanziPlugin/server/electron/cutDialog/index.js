const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
function cutDialog() {
  app.whenReady().then(() => {
    if (!mainWindow) {
      mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false, // 隐藏标题栏
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false, // 禁用 remote 模块
            nodeIntegration: false
        }
      });
      mainWindow.loadFile(path.resolve(__dirname, 'index.html'));
      mainWindow.on('close', () => {
        mainWindow = null;
      });
      ipcMain.on('close-cut-dialog', () => {
        if (mainWindow && typeof mainWindow.close === 'function') {
          mainWindow.close();
        }
      });
    } else {
      mainWindow.close();
    }
  }).catch((err) => {
    console.error(err);
  })
}
module.exports = cutDialog;