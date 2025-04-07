const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  scanCard: () => ipcRenderer.invoke('scan-card'),
  makeTag: (formData) => ipcRenderer.invoke('make-tag', formData),
  updateDB: () => ipcRenderer.invoke('update-db'),
  loadDBData: (key) => ipcRenderer.invoke('load-db-data', key),
  resetTag: () => ipcRenderer.invoke('reset-tag')
});