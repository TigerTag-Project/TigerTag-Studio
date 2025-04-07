/**
 * TigerTag Pro module.
 * Checks if the tag is TigerTag Pro V1.0 and fetches API data.
 */

const axios = require('axios');
const logger = require('../../utils/logger');

function isProTag(decodedData) {
  return decodedData.includes("TigerTag Pro V1.0");
}

async function fetchProData(uid, productId) {
  const apiUrl = `https://api.tigertag.io/api:tigertag/product/filament/get?uid=${uid}&product_id=${productId}`;
  try {
    const response = await axios.get(apiUrl);
    logger.info('API call successful.');
    return response.data;
  } catch (error) {
    logger.error('API call failed, using fallback data.', error);
    return { fallback: true, message: 'Using chip data due to API failure.' };
  }
}

module.exports = {
  isProTag,
  fetchProData
};