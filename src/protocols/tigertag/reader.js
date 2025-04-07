/**
 * reader.js - Reads TigerTag data from the smartcard using APDU commands.
 */

const logger = require('../../utils/logger');
const smartcard = require('../../utils/smartcard');

/**
 * Sends an APDU command to the card.
 * @param {Object} connection - La connexion au lecteur.
 * @param {Array} apdu - Le tableau de commande APDU.
 * @returns {Promise<Buffer>} - La réponse de la carte.
 */
function sendAPDU(connection, apdu) {
  return new Promise((resolve, reject) => {
    connection.transmit(Buffer.from(apdu), 40, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

/**
 * Reads pages 4 to 12 from the card.
 * Utilise la commande APDU [0xFF, 0xB0, 0x00, block, 0x04] pour lire 4 octets du bloc.
 * @returns {Promise<Array>} - Tableau de pages (chaque page est un tableau de 4 octets).
 */
async function read() {
  logger.info("Starting card read operation...");
  try {
    const connection = await smartcard.getConnection();
    const pages = [];
    // Lecture des pages 4 à 12 (9 pages)
    for (let block = 4; block <= 12; block++) {
      const apdu = [0xFF, 0xB0, 0x00, block, 0x04];
      const response = await sendAPDU(connection, apdu);
      logger.info(`Read block ${block}: ${response.toString('hex').toUpperCase()}`);
      pages.push(Array.from(response));
    }
    return pages;
  } catch (error) {
    logger.error("Error reading card:", error);
    throw error;
  }
}

module.exports = {
  read
}; 