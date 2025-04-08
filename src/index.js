/**
 * Main entry point for the TigerTag Project.
 * This file initializes the system and selects the appropriate protocol module.
 */

const logger = require('./utils/logger');
const smartcard = require('./utils/smartcard');
// const resetModule = require('./utils/reset');

// Import TigerTag protocol modules
const tigerTagReader = require('./protocols/tigertag/reader');
//const tigerTagDecoder = require('./protocols/tigertag/decoder');
const tigerTagWriter = require('./protocols/tigertag/writer');
const tigerTagPro = require('./protocols/tigertag/pro');

// Example function to run the reading/decoding process
async function run() {
  try {
    // Connect to the smartcard reader
    const cardData = await smartcard.readCard();
    logger.info('Card data read successfully.');

    // Decode the card data using TigerTag Maker decoder
    const decodedData = tigerTagDecoder.decode(cardData);
    logger.info('Card data decoded:', decodedData);

    // Check if the tag version indicates a TigerTag Pro tag
    if (tigerTagPro.isProTag(decodedData)) {
      logger.info('TigerTag Pro detected, calling API...');
      const proData = await tigerTagPro.fetchProData(cardData.uid, decodedData.productId);
      logger.info('API response:', proData);
    } else {
      logger.info('TigerTag Maker detected.');
    }

    // Write data example (this can be triggered as needed)
    // const newData = { ... }; // Prepare new data payload
    // await tigerTagWriter.write(newData);

  } catch (error) {
    logger.error('Error in processing:', error);
  }
}

run();