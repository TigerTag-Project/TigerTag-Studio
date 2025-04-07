/**
 * TigerTag Reset Module.
 * Resets pages 4 to 12 on the smartcard by sending APDU commands that write zeros.
 */

const logger = require('../../utils/logger');
const smartcard = require('../../utils/smartcard');

/**
 * Sends an APDU command to the smartcard using the established connection.
 * @param {Object} connection - The smartcard connection.
 * @param {Array} apdu - The APDU command array.
 * @returns {Promise<Array>} - Resolves with the response from the card.
 */
function sendAPDU(connection, apdu) {
  return new Promise((resolve, reject) => {
    connection.transmit(apdu, 40, (err, response) => {
      if (err) {
        return reject(err);
      }
      resolve(response);
    });
  });
}

/**
 * Resets pages 4 to 12 on the smartcard by writing zeros to each page.
 * Uses the APDU command [0xFF, 0xD6, 0x00, page, 0x04, 0x00, 0x00, 0x00, 0x00] for each page.
 * @returns {Promise<Object>} - An object indicating success or error.
 */
async function resetPages() {
  try {
    // Obtain a real connection to the smartcard
    const connection = await smartcard.getConnection();
    // Loop through pages 4 to 12 (inclusive)
    for (let page = 4; page <= 12; page++) {
      // Build APDU command: CLA=0xFF, INS=0xD6, P1=0x00, P2=page, Lc=0x04, then 4 bytes of zeros
      const apdu = [0xFF, 0xD6, 0x00, page, 0x04, 0x00, 0x00, 0x00, 0x00];
      logger.info(`Resetting page ${page} with APDU: ${apdu.map(byte => byte.toString(16).padStart(2, '0').toUpperCase()).join(' ')}`);
      const response = await sendAPDU(connection, apdu);
      logger.info(`Response for page ${page}: ${response}`);
    }
    logger.info("Reset of pages 4 to 12 completed successfully.");
    return { success: true };
  } catch (error) {
    logger.error("Error resetting pages:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  resetPages
};