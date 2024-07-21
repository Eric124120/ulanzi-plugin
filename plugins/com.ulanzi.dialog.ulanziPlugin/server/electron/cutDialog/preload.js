const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    closeCutDialog: () => ipcRenderer.send('close-cut-dialog'),
    copyText: (text) => ipcRenderer.send('copy-text', text),
    copyCustom: (data) => ipcRenderer.send('copy-custom', data),
    onSendCutInfo: (callback) => ipcRenderer.on('send-cut-info', callback)
});