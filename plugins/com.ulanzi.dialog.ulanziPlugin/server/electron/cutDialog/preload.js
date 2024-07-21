const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    closeCutDialog: () => ipcRenderer.send('close-cut-dialog')
});