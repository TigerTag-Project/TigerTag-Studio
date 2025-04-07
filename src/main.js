const { app, BrowserWindow, ipcMain } = require('electron'); // Electron modules for creating windows and handling IPC
const path = require('path'); // Path module for handling file paths
const resetModule = require('./protocols/tigertag/reset'); // Chemin mis à jour
const logger = require('./utils/logger'); // Logger for logging messages
const dbService = require('./services/tigertag_db'); // Service for managing the TigerTag database


function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(async () => {
  createWindow();

  // Update the local DB at application startup
  try {
    const data = await dbService.fetchAndCache();
    console.log('Local DB updated:', data);
  } catch (error) {
    console.error('Error updating local DB:', error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handler for "Scan" operation
ipcMain.handle('scan-card', async () => {
  logger.info('Scan button pressed, initiating card scan...');
  try {
    const reader = require('./protocols/tigertag/reader');
    const pages = await reader.read();
    logger.info('Card read successfully:', pages);
    return { success: true, pages };
  } catch (error) {
    logger.error('Error scanning card:', error);
    return { success: false, error: error.message };
  }
});

// IPC handler for "Update TigerTag DB" operation
ipcMain.handle('update-db', async () => {
  try {
    const data = await dbService.fetchAndCache();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handler for "Make" operation
ipcMain.handle('make-tag', async (event, formData) => {
  logger.info('Received formData in main process:', formData);
  try {
    const writer = require('./protocols/tigertag/writer');
    await writer.writeTag(formData); // writer.js gère tout maintenant
    logger.info('Tag written successfully.');
    return { success: true };
  } catch (error) {
    logger.error('Error writing tag:', error);
    return { success: false, error: error.message };
  }
});

// IPC handler for "Load DB Data" operation
ipcMain.handle('load-db-data', async (event, key) => {
  try {
    const data = dbService.loadCachedData(key);
    if (data) {
      return { success: true, data };
    } else {
      return { success: false, error: `No data found for key ${key}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handler for "Reset" operation
ipcMain.handle('reset-tag', async () => {
  try {
    const result = await resetModule.resetPages();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});