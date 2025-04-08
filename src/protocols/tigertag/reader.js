const { NFC } = require('nfc-pcsc');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

// La classe TigerTagSpoolData reste identique
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
      new Uint8Array(this.buffer, 0, 4).set(val);
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
      const weightValue = (val[0] << 16) | (val[1] << 8) | val[2];
      console.log("Weight set from array:", val, "=>", weightValue);
    } else if (typeof val === 'number') {
      const bytes = [
        (val >> 16) & 0xFF,
        (val >> 8) & 0xFF,
        val & 0xFF
      ];
      new Uint8Array(this.buffer, 20, 3).set(bytes);
      console.log("Weight set from number:", val, "=> bytes:", bytes);
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
    if (typeof val !== 'number') {
      throw new Error("timeStamp must be a number");
    }
    const bytes = [
      (val >> 24) & 0xFF, // octet le plus significatif
      (val >> 16) & 0xFF,
      (val >> 8)  & 0xFF,
      val & 0xFF           // octet le moins significatif
    ];
    console.log("Setting timeStamp:", val, "=> bytes:", bytes);
    // Écriture manuelle des 4 octets dans le buffer à partir de l'offset 32
    new Uint8Array(this.buffer, 32, 4).set(bytes);
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

// Fonction pour rechercher un label dans un fichier JSON
function lookupLabel(dbKey, id) {
  try {
    const filePath = path.join(__dirname, '../../../tigertag_db', `${dbKey}.json`);
    console.log(`Looking up ${dbKey} in file: ${filePath}`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const entry = data.find(item => Number(item.id) === Number(id));
      console.log(`For ${dbKey} with id ${id}, found entry:`, entry);
      if (entry) {
        // Pour versionId, on retourne explicitement le champ "name"
        if (dbKey === 'versionId') {
          return entry.name;
        }
        // Sinon, on retourne label s'il existe, sinon name
        return entry.label || entry.name;
      }
      return null;
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error looking up ${dbKey} with id ${id}:`, error);
  }
  return null;
}

// Fonction de lecture de la puce
function readTag(callback) {
  const nfc = new NFC();
  nfc.on('reader', reader => {
    console.log(`Reader ${reader.reader.name} detected for reading.`);
    reader.on('card', async card => {
      console.log("Card detected for reading:", card);
      try {
        // Lire 144 octets à partir du bloc 4
        const data = await reader.read(4, 144); // retourne un Buffer
        // Convertir le Buffer en ArrayBuffer
        const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        const tagData = new TigerTagSpoolData(arrayBuffer);

        // Enrichissement des données avec les labels issus des JSON
        tagData.versionLabel = lookupLabel('versionId', tagData.tigerTagID);
        tagData.materialLabel = lookupLabel('materialId', tagData.materialID);
        tagData.brandLabel = lookupLabel('brandId', tagData.brandID);
        tagData.typeLabel = lookupLabel('typeId', tagData.typeID);
        tagData.aspect1Label = lookupLabel('aspectId', tagData.aspect1ID);
        tagData.aspect2Label = lookupLabel('aspectId', tagData.aspect2ID);
        tagData.unitLabel = lookupLabel('unitId', tagData.unitId);
        tagData.diameterLabel = lookupLabel('diameterId', tagData.diameterID);

        // Ajout de la propriété productIdDecimal
        const pid = tagData.productID;
        tagData.productIdDecimal = ((pid[0] << 24) >>> 0) + (pid[1] << 16) + (pid[2] << 8) + pid[3];

        // Calcul du poids à partir des 3 octets (Big Endian)
        const weightBytes = Array.from(tagData.weight);
        const weightValue = (weightBytes[0] << 16) | (weightBytes[1] << 8) | weightBytes[2];
        tagData.weightValue = weightValue; // Doit donner 1000 dans votre exemple

        // Conversion du timestamp en une date lisible
        const baseDate = new Date('2000-01-01T00:00:00Z'); // Base définie dans writer.js
        if (tagData.timeStamp) {
          const timestampDate = new Date(baseDate.getTime() + tagData.timeStamp * 1000);
          tagData.timeStampReadable = timestampDate.toLocaleString();
        } else {
          tagData.timeStampReadable = "Not set";
        }

        // Ajout d'unités de mesure pour l'affichage
        tagData.tempMinDisplay = `${tagData.tempMin} °C`;
        tagData.tempMaxDisplay = `${tagData.tempMax} °C`;
        tagData.dryTempDisplay = `${tagData.dryTemp} °C`;
        tagData.dryTimeDisplay = `${tagData.dryTime} h`;

        callback(null, tagData);
        // Une fois la lecture effectuée, retirer les écouteurs et fermer le lecteur
        reader.removeAllListeners('card');
        nfc.close();
      } catch (err) {
        console.error("Error during tag reading:", err);
        callback(err);
      }
    });

    reader.on('error', err => {
      console.error(`Reader error (${reader.reader.name}):`, err);
    });
    reader.on('end', () => {
      console.log(`Reader ${reader.reader.name} disconnected.`);
    });
  });

  nfc.on('error', err => {
    console.error("NFC error:", err);
  });
}

module.exports = {
  readTag
};