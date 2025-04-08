/**
 * decoder.js - Decodes TigerTag data from an array of pages.
 */

/**
 * Convert 4 bytes (array of numbers) to a 32-bit unsigned integer (little endian).
 */
function bytesToUint32(bytes) {
  return (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
}

/**
 * Convert 2 bytes (array of numbers) to a 16-bit unsigned integer (little endian).
 */
function bytesToUint16(bytes) {
  return (bytes[1] << 8) | bytes[0];
}

/**
 * Decodes an array of pages into a human-readable object.
 * Assume pages[0] corresponds to page 4 in the tag.
 * Mapping (example):
 * - Page 4: TigerTagID (4 bytes)
 * - Page 5: ProductID (4 bytes, as hex string)
 * - Page 6: MaterialID (2 bytes), Aspect1ID (1 byte), Aspect2ID (1 byte)
 * - Page 7: TypeID (1 byte), DiameterID (1 byte), BrandID (2 bytes)
 * - Page 8: Color (4 bytes)
 * - Page 9: Weight (4 bytes)
 * - Page 10: TempMin (2 bytes), TempMax (2 bytes)
 * - Page 11: DryTemp (1 byte), DryTime (1 byte), Reserved (2 bytes, ignorés)
 * - Page 12: TimeStamp (4 bytes)
 */
function decode(pages) {
  if (pages.length < 9) {
    throw new Error("Insufficient pages to decode");
  }
  const result = {};
  result.tigerTagID = bytesToUint32(pages[0]);
  result.productID = pages[1].map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
  result.materialID = bytesToUint16(pages[2].slice(0,2));
  result.aspect1ID = pages[2][2];
  result.aspect2ID = pages[2][3];
  result.typeID = pages[3][0];
  result.diameterID = pages[3][1];
  result.brandID = bytesToUint16(pages[3].slice(2,4));
  result.color = bytesToUint32(pages[4]);
  result.weight = bytesToUint32(pages[5]);
  result.tempMin = bytesToUint16(pages[6].slice(0,2));
  result.tempMax = bytesToUint16(pages[6].slice(2,4));
  result.dryTemp = pages[7][0];
  result.dryTime = pages[7][1];
  result.timeStamp = bytesToUint32(pages[8]);
  return result;
}

module.exports = {
  decode
};