// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readTag: () => ipcRenderer.invoke('readTag'),
  makeTag: (formData) => ipcRenderer.invoke('make-tag', formData),
  updateDB: () => ipcRenderer.invoke('update-db'),
  loadDBData: (key) => ipcRenderer.invoke('load-db-data', key),
  resetTag: () => ipcRenderer.invoke('reset-tag')
});