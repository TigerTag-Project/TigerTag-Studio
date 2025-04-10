const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const { app } = require('electron');
const isElectron = !!process.versions.electron;

const endpoints = {
  versionId: 'https://api.tigertag.io/api:tigertag/version/get/all',
  materialId: 'https://api.tigertag.io/api:tigertag/material/filament/get/all',
  aspectId: 'https://api.tigertag.io/api:tigertag/aspect/get/all',
  typeId: 'https://api.tigertag.io/api:tigertag/type/get/all',
  diameterId: 'https://api.tigertag.io/api:tigertag/diameter/filament/get/all',
  brandId: 'https://api.tigertag.io/api:tigertag/brand/get/all',
  unitId: 'https://api.tigertag.io/api:tigertag/measure_unit/get/all'
};

// ✅ Cache local dynamique
const cacheDir = isElectron
  ? path.join(app.getPath('userData'), 'tigertag_db')
  : path.join(__dirname, '../../tigertag_db');

function ensureCacheDir() {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
}

async function fetchAndCache() {
  ensureCacheDir();
  const result = {};
  for (const [key, url] of Object.entries(endpoints)) {
    try {
      const response = await axios.get(url);
      result[key] = response.data;
      const filePath = path.join(cacheDir, `${key}.json`);
      fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2));
      logger.info(`Cached data for ${key} at ${filePath}`);
    } catch (error) {
      logger.error(`Error fetching ${key}:`, error);
    }
  }
  return result;
}

function loadCachedData(key) {
  ensureCacheDir();
  const filePath = path.join(cacheDir, `${key}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

module.exports = {
  fetchAndCache,
  loadCachedData
};