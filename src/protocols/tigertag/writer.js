const { NFC } = require('nfc-pcsc');
const logger = require('../../utils/logger');

// Définition de la classe TigerTagSpoolData avec des accesseurs.
class TigerTagSpoolData {
  constructor(buffer) {
    if (buffer instanceof ArrayBuffer && buffer.byteLength === 144) {
      this.buffer = buffer;
    } else {
      this.buffer = new ArrayBuffer(144);
    }
    this.view = new DataView(this.buffer);
  }

  get tigerTagID() {
    return this.view.getUint32(0, false);
  }
  set tigerTagID(val) {
    if (typeof val === 'number') {
      this.view.setUint32(0, val, false);
    } else if (Array.isArray(val) && val.length === 4) {
      const view = new Uint8Array(this.buffer, 0, 4);
      view.set(val);
    } else {
      throw new Error("tigerTagID must be a 32-bit number or an array of 4 bytes");
    }
  }

  get productID() {
    return new Uint8Array(this.buffer, 4, 4);
  }
  set productID(val) {
    if (Array.isArray(val) && val.length === 4) {
      new Uint8Array(this.buffer, 4, 4).set(val);
    } else if (typeof val === 'number') {
      const bytes = [
        (val >> 24) & 0xFF,
        (val >> 16) & 0xFF,
        (val >> 8) & 0xFF,
        val & 0xFF
      ];
      new Uint8Array(this.buffer, 4, 4).set(bytes);
    } else {
      throw new Error("ProductID must be a 4-byte array or a 32-bit number");
    }
  }

  get materialID() {
    return this.view.getUint16(8, false);
  }
  set materialID(val) {
    this.view.setUint16(8, val, false);
  }

  get aspect1ID() {
    return this.view.getUint8(10);
  }
  set aspect1ID(val) {
    this.view.setUint8(10, val);
  }

  get aspect2ID() {
    return this.view.getUint8(11);
  }
  set aspect2ID(val) {
    this.view.setUint8(11, val);
  }

  get typeID() {
    return this.view.getUint8(12);
  }
  set typeID(val) {
    this.view.setUint8(12, val);
  }

  get diameterID() {
    return this.view.getUint8(13);
  }
  set diameterID(val) {
    this.view.setUint8(13, val);
  }

  get brandID() {
    return this.view.getUint16(14, false);
  }
  set brandID(val) {
    this.view.setUint16(14, val, false);
  }

  get color() {
    return this.view.getUint32(16, false);
  }
  set color(val) {
    this.view.setUint32(16, val, false);
  }

  get weight() {
    return new Uint8Array(this.buffer, 20, 3);
  }
  set weight(val) {
    if (Array.isArray(val) && val.length === 3) {
      new Uint8Array(this.buffer, 20, 3).set(val);
    } else if (typeof val === 'number') {
      const bytes = [
        (val >> 16) & 0xFF,
        (val >> 8) & 0xFF,
        val & 0xFF
      ];
      new Uint8Array(this.buffer, 20, 3).set(bytes);
    } else {
      throw new Error("Weight must be a 3-byte array or a number");
    }
  }

  get unitId() {
    return this.view.getUint8(23);
  }
  set unitId(val) {
    this.view.setUint8(23, val);
  }

  get tempMin() {
    return this.view.getUint16(24, false);
  }
  set tempMin(val) {
    this.view.setUint16(24, val, false);
  }

  get tempMax() {
    return this.view.getUint16(26, false);
  }
  set tempMax(val) {
    this.view.setUint16(26, val, false);
  }

  get dryTemp() {
    return this.view.getUint8(28);
  }
  set dryTemp(val) {
    this.view.setUint8(28, val);
  }

  get dryTime() {
    return this.view.getUint8(29);
  }
  set dryTime(val) {
    this.view.setUint8(29, val);
  }

  get reservedBlock11() {
    return this.view.getUint16(30, false);
  }
  set reservedBlock11(val) {
    this.view.setUint16(30, val, false);
  }

  get timeStamp() {
    return this.view.getUint32(32, false);
  }
  set timeStamp(val) {
    this.view.setUint32(32, val, false);
  }

  get reservedBlock13() {
    return this.view.getUint32(36, false);
  }
  set reservedBlock13(val) {
    this.view.setUint32(36, val, false);
  }

  get reservedBlock14() {
    return this.view.getUint32(40, false);
  }
  set reservedBlock14(val) {
    this.view.setUint32(40, val, false);
  }

  get reservedBlock15() {
    return this.view.getUint32(44, false);
  }
  set reservedBlock15(val) {
    this.view.setUint32(44, val, false);
  }

  get metadata() {
    return new Uint8Array(this.buffer, 48, 32);
  }
  set metadata(arr) {
    if (!Array.isArray(arr) || arr.length !== 32) {
      throw new Error("Metadata must be an array of 32 numbers");
    }
    new Uint8Array(this.buffer, 48, 32).set(arr);
  }

  get ttSignature() {
    return new Uint8Array(this.buffer, 80, 64);
  }
  set ttSignature(arr) {
    if (!Array.isArray(arr) || arr.length !== 64) {
      throw new Error("TTSignature must be an array of 64 numbers");
    }
    new Uint8Array(this.buffer, 80, 64).set(arr);
  }
}

/**
 * Fonction qui construit le buffer complet de 144 octets à partir de formData.
 */
function buildBuffer(formData) {
  const tagData = new TigerTagSpoolData();
  if (formData.tigerTagID !== undefined) tagData.tigerTagID = formData.tigerTagID;
  if (formData.productID !== undefined) tagData.productID = formData.productID;
  if (formData.materialID !== undefined) tagData.materialID = formData.materialID;
  if (formData.aspect1ID !== undefined) tagData.aspect1ID = formData.aspect1ID;
  if (formData.aspect2ID !== undefined) tagData.aspect2ID = formData.aspect2ID;
  if (formData.typeID !== undefined) tagData.typeID = formData.typeID;
  if (formData.diameterID !== undefined) tagData.diameterID = formData.diameterID;
  if (formData.brandID !== undefined) tagData.brandID = formData.brandID;
  if (formData.color !== undefined) tagData.color = formData.color;
  if (formData.weight !== undefined) tagData.weight = formData.weight;
  if (formData.unitId !== undefined) tagData.unitId = formData.unitId;
  if (formData.tempMin !== undefined) tagData.tempMin = formData.tempMin;
  if (formData.tempMax !== undefined) tagData.tempMax = formData.tempMax;
  if (formData.dryTemp !== undefined) tagData.dryTemp = formData.dryTemp;
  if (formData.dryTime !== undefined) tagData.dryTime = formData.dryTime;
  if (formData.timeStamp !== undefined) {
    tagData.timeStamp = formData.timeStamp;
  } else {
    // Calcul du timestamp (secondes écoulées depuis 2000-01-01)
    tagData.timeStamp = Math.floor((Date.now() / 1000) - 946684800);
  }
  // Champs réservés et metadata
  tagData.reservedBlock11 = 0;
  tagData.metadata = new Array(32).fill(0);
  tagData.ttSignature = new Array(64).fill(0);

  console.log("Tag data buffer:", Array.from(new Uint8Array(tagData.buffer)));
  return Buffer.from(tagData.buffer);
}

/**
 * Fonction qui écrit le buffer sur la carte.
 * Gère deux états :
 *   - Attendre la présence d'une puce.
 *   - Programmer la puce une fois détectée et arrêter le processus.
 * De plus, si aucune puce n'est détectée après 5 secondes, le processus s'arrête.
 */
async function writeTag(formData) {
  const { NFC } = require('nfc-pcsc');
  const nfc = new NFC();
  let programmed = false;
  let timeoutCleared = false;

  // Démarrer un timer de 5 secondes
  const timeoutId = setTimeout(() => {
    if (!programmed) {
      console.log("Aucune puce détectée pendant 10 secondes. Arrêt du processus d'écriture.");
      timeoutCleared = true;
      // Fermer les lecteurs NFC (ceci arrête la détection, mais ne ferme pas l'application Electron)
      nfc.close();
      // Vous pouvez également notifier l'utilisateur via l'interface (par exemple, en affichant un message)
    }
  }, 10000);

  nfc.on('reader', reader => {
    console.log(`Reader ${reader.reader.name} detected`);

    reader.on('card', async card => {
      // Si déjà programmé ou en timeout, on ignore la carte
      if (programmed || timeoutCleared) return;

      console.log("Carte détectée:", card);
      try {
        const fullBuffer = buildBuffer(formData);
        console.log("APDU payload:", fullBuffer.toString('hex').toUpperCase());
        await reader.write(4, fullBuffer);
        console.log("Données écrites avec succès !");
        programmed = true;
        clearTimeout(timeoutId);
        // Retirer les écouteurs pour éviter d'écrire sur d'autres cartes
        reader.removeAllListeners('card');
        // Fermer le lecteur sans arrêter l'application Electron
        nfc.close();
      } catch (err) {
        console.error("Erreur lors de l'écriture :", err);
        clearTimeout(timeoutId);
        // Vous pouvez notifier l'utilisateur de l'erreur ici sans fermer l'application
      }
    });

    reader.on('error', err => {
      console.error(`Erreur (${reader.reader.name}) :`, err);
    });

    reader.on('end', () => {
      console.log(`Reader ${reader.reader.name} déconnecté.`);
    });
  });

  nfc.on('error', err => {
    console.error("Erreur NFC :", err);
  });
}

// Pour tester en stand-alone
if (require.main === module) {
  const sampleFormData = {
    tigerTagID: 0xDEADBEEF,
    productID: [0x01, 0x02, 0x03, 0x04],
    materialID: 12844,
    aspect1ID: 92,
    aspect2ID: 64,
    typeID: 142,
    diameterID: 56,
    brandID: 4356,
    color: 16711680, // 0xFF0000
    weight: 1000,
    tempMin: 190,
    tempMax: 230,
    dryTemp: 50,
    dryTime: 6
  };
  writeTag(sampleFormData);
}

module.exports = {
  writeTag
};