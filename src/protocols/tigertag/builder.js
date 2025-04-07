/**
 * builder.js - Builds the pages to be written to the TigerTag.
 * The builder uses the TigerTagSpoolData structure as reference.
 */

// Classe TigerTagSpoolData (référentiel)
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
    return this.view.getUint32(0, true);
  }
  set tigerTagID(val) {
    this.view.setUint32(0, val, true);
  }

  get productID() {
    return new Uint8Array(this.buffer, 4, 4);
  }
  set productID(arr) {
    if (!Array.isArray(arr) || arr.length !== 4) {
      throw new Error("ProductID must be an array of 4 numbers");
    }
    new Uint8Array(this.buffer, 4, 4).set(arr);
  }

  get materialID() {
    return this.view.getUint16(8, true);
  }
  set materialID(val) {
    this.view.setUint16(8, val, true);
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
    return this.view.getUint16(14, true);
  }
  set brandID(val) {
    this.view.setUint16(14, val, true);
  }

  get color() {
    return this.view.getUint32(16, true);
  }
  set color(val) {
    this.view.setUint32(16, val, true);
  }

  get weight() {
    return this.view.getUint32(20, true);
  }
  set weight(val) {
    this.view.setUint32(20, val, true);
  }

  get tempMin() {
    return this.view.getUint16(24, true);
  }
  set tempMin(val) {
    this.view.setUint16(24, val, true);
  }

  get tempMax() {
    return this.view.getUint16(26, true);
  }
  set tempMax(val) {
    this.view.setUint16(26, val, true);
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
    return this.view.getUint16(30, true);
  }
  set reservedBlock11(val) {
    this.view.setUint16(30, val, true);
  }

  get timeStamp() {
    return this.view.getUint32(32, true);
  }
  set timeStamp(val) {
    this.view.setUint32(32, val, true);
  }

  get reservedBlock13() {
    return this.view.getUint32(36, true);
  }
  set reservedBlock13(val) {
    this.view.setUint32(36, val, true);
  }

  get reservedBlock14() {
    return this.view.getUint32(40, true);
  }
  set reservedBlock14(val) {
    this.view.setUint32(40, val, true);
  }

  get reservedBlock15() {
    return this.view.getUint32(44, true);
  }
  set reservedBlock15(val) {
    this.view.setUint32(44, val, true);
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
 * Builds the pages to be written to the TigerTag.
 * It creates a TigerTagSpoolData instance, sets its fields from formData,
 * and then returns an array of pages (each page is an array of 4 numbers).
 *
 * Les clés de formData doivent correspondre aux setters de TigerTagSpoolData.
 * Par exemple : materialID, aspect1ID, aspect2ID, typeID, diameterID, brandID, color, weight, tempMin, tempMax, dryTemp, dryTime, timeStamp.
 *
 * @param {Object} formData - Object with the following possible keys:
 *   tigerTagID, productID, materialID, aspect1ID, aspect2ID, typeID,
 *   diameterID, brandID, color, weight, tempMin, tempMax, dryTemp, dryTime, timeStamp.
 * @returns {Array} - Array of pages (each page is an array of 4 numbers).
 */
function buildPages(formData) {
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
  if (formData.tempMin !== undefined) tagData.tempMin = formData.tempMin;
  if (formData.tempMax !== undefined) tagData.tempMax = formData.tempMax;
  if (formData.dryTemp !== undefined) tagData.dryTemp = formData.dryTemp;
  if (formData.dryTime !== undefined) tagData.dryTime = formData.dryTime;
  if (formData.timeStamp !== undefined) {
    tagData.timeStamp = formData.timeStamp;
  } else {
    tagData.timeStamp = Math.floor((Date.now() / 1000) - 946684800);
  }
  
  // Les autres champs restent à zéro ou sont initialisés par défaut.
  tagData.reservedBlock11 = 0;
  tagData.metadata = new Array(32).fill(0);
  tagData.ttSignature = new Array(64).fill(0);

  // Log du contenu du buffer après affectation
  console.log("Tag data buffer:", Array.from(new Uint8Array(tagData.buffer)));

  // Découper le buffer complet (144 octets) en pages de 4 octets.
  const pages = [];
  const totalPages = tagData.buffer.byteLength / 4; // devrait être 36 pages
  const view = new Uint8Array(tagData.buffer);
  for (let i = 0; i < totalPages; i++) {
    const page = [];
    for (let j = 0; j < 4; j++) {
      page.push(view[i * 4 + j]);
    }
    pages.push(page);
  }
  return pages;
}

module.exports = {
  buildPages
};