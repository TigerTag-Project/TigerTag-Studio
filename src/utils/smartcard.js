const NFC = require('nfc-pcsc').NFC;
const logger = require('./logger');

function readCard() {
  return new Promise((resolve, reject) => {
    const nfc = new NFC();
    let timeout;

    nfc.on('reader', reader => {
      logger.info(`Reader detected: ${reader.name}`);

      reader.on('card', async card => {
        clearTimeout(timeout);
        logger.info(`Card detected: ${card.uid}`);
        resolve(card);
      });

      reader.on('error', err => {
        logger.error('Reader error:', err);
        reject(err);
      });
    });

    nfc.on('error', err => {
      logger.error('NFC error:', err);
      reject(err);
    });

    timeout = setTimeout(() => {
      reject(new Error('Timeout: No card detected'));
    }, 10000);
  });
}

/**
 * Establishes a connection to the card.
 * For simplicity, on détecte le premier lecteur et utilise reader.connect() sans options.
 */
function getConnection() {
  return new Promise((resolve, reject) => {
    const nfc = new NFC();
    nfc.on('reader', reader => {
      logger.info(`Reader detected: ${reader.name}`);
      reader.connect((err, protocol) => {
        if (err) {
          logger.error('Error connecting to card:', err);
          return reject(err);
        }
        logger.info(`Connected to card using protocol: ${protocol}`);
        resolve(reader);
      });
    });
    nfc.on('error', err => {
      logger.error('NFC error:', err);
      reject(err);
    });
  });
}

module.exports = {
  readCard,
  getConnection
};