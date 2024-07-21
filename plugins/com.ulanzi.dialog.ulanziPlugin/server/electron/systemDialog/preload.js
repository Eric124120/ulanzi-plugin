const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    closeSystemDialog: () => ipcRenderer.send('close-system-dialog')
});