const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    closeSystemDialog: () => ipcRenderer.send('close-system-dialog'),
    onSystemInfo: (callback) => ipcRenderer.on('system-info', callback),
    onOsxCpuTempFail: (callback) => ipcRenderer.on('osx-cpu-temp-fail', callback)
});