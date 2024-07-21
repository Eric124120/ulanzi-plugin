const { app, BrowserWindow, ipcMain } = require('electron');
const {cutDialog, systemDialog} = require('./electron/index');

function createWindow() {
  // 创建一个新的窗口
  const mainWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // 需要禁用上下文隔离以使用 ipcRenderer
    }
  });
  mainWin.loadFile('electron.html');
}

ipcMain.on('trigger-cut-dialog', () => {
  cutDialog();
});

ipcMain.on('trigger-system-dialog', () => {
  systemDialog();
})
app.on('ready', createWindow);