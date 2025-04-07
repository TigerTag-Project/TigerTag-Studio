const { NFC } = require('nfc-pcsc');

// Define the TigerTagSpoolData class with DataView accessors.
class TigerTagSpoolData {
  constructor(buffer) {
    // Allocate a new ArrayBuffer of 144 bytes if none is provided.
    if (buffer instanceof ArrayBuffer && buffer.byteLength === 144) {
      this.buffer = buffer;
    } else {
      this.buffer = new ArrayBuffer(144);
    }
    this.view = new DataView(this.buffer);
  }

  // Field: TigerTagID (uint32_t) [offset 0, 4 bytes]
  get tigerTagID() {
    return this.view.getUint32(0, false);
  }
  set tigerTagID(val) {
    this.view.setUint32(0, val, false);
  }

  // Field: ProductID (uint8_t[4]) [offset 4, 4 bytes]
  get productID() {
    return new Uint8Array(this.buffer, 4, 4);
  }
  set productID(arr) {
    if (!Array.isArray(arr) || arr.length !== 4) {
      throw new Error("ProductID must be an array of 4 numbers");
    }
    new Uint8Array(this.buffer, 4, 4).set(arr);
  }

  // Field: MaterialID (uint16_t) [offset 8, 2 bytes]
  get materialID() {
    return this.view.getUint16(8, false);
  }
  set materialID(val) {
    this.view.setUint16(8, val, false);
  }

  // Field: Aspect1ID (uint8_t) [offset 10, 1 byte]
  get aspect1ID() {
    return this.view.getUint8(10);
  }
  set aspect1ID(val) {
    this.view.setUint8(10, val);
  }

  // Field: Aspect2ID (uint8_t) [offset 11, 1 byte]
  get aspect2ID() {
    return this.view.getUint8(11);
  }
  set aspect2ID(val) {
    this.view.setUint8(11, val);
  }

  // Field: TypeID (uint8_t) [offset 12, 1 byte]
  get typeID() {
    return this.view.getUint8(12);
  }
  set typeID(val) {
    this.view.setUint8(12, val);
  }

  // Field: DiameterID (uint8_t) [offset 13, 1 byte]
  get diameterID() {
    return this.view.getUint8(13);
  }
  set diameterID(val) {
    this.view.setUint8(13, val);
  }

  // Field: BrandID (uint16_t) [offset 14, 2 bytes]
  get brandID() {
    return this.view.getUint16(14, false);
  }
  set brandID(val) {
    this.view.setUint16(14, val, false);
  }

  // Field: Color (uint32_t) [offset 16, 4 bytes]
  get color() {
    return this.view.getUint32(16, false);
  }
  set color(val) {
    this.view.setUint32(16, val, false);
  }

  // Field: Weight (uint32_t) [offset 20, 4 bytes]
  get weight() {
    return this.view.getUint32(20, false);
  }
  set weight(val) {
    this.view.setUint32(20, val, false);
  }

  // Field: TempMin (uint16_t) [offset 24, 2 bytes]
  get tempMin() {
    return this.view.getUint16(24, false);
  }
  set tempMin(val) {
    this.view.setUint16(24, val, false);
  }

  // Field: TempMax (uint16_t) [offset 26, 2 bytes]
  get tempMax() {
    return this.view.getUint16(26, false);
  }
  set tempMax(val) {
    this.view.setUint16(26, val, false);
  }

  // Field: DryTemp (uint8_t) [offset 28, 1 byte]
  get dryTemp() {
    return this.view.getUint8(28);
  }
  set dryTemp(val) {
    this.view.setUint8(28, val);
  }

  // Field: DryTime (uint8_t) [offset 29, 1 byte]
  get dryTime() {
    return this.view.getUint8(29);
  }
  set dryTime(val) {
    this.view.setUint8(29, val);
  }

  // Field: ReservedBlock11 (uint16_t) [offset 30, 2 bytes]
  get reservedBlock11() {
    return this.view.getUint16(30, false);
  }
  set reservedBlock11(val) {
    this.view.setUint16(30, val, false);
  }

  // Field: TimeStamp (uint32_t) [offset 32, 4 bytes]
  get timeStamp() {
    return this.view.getUint32(32, false);
  }
  set timeStamp(val) {
    this.view.setUint32(32, val, false);
  }

  // Field: ReservedBlock13 (uint32_t) [offset 36, 4 bytes]
  get reservedBlock13() {
    return this.view.getUint32(36, false);
  }
  set reservedBlock13(val) {
    this.view.setUint32(36, val, false);
  }

  // Field: ReservedBlock14 (uint32_t) [offset 40, 4 bytes]
  get reservedBlock14() {
    return this.view.getUint32(40, false);
  }
  set reservedBlock14(val) {
    this.view.setUint32(40, val, false);
  }

  // Field: ReservedBlock15 (uint32_t) [offset 44, 4 bytes]
  get reservedBlock15() {
    return this.view.getUint32(44, false);
  }
  set reservedBlock15(val) {
    this.view.setUint32(44, val, false);
  }

  // Field: Metadata (uint8_t[32]) [offset 48, 32 bytes]
  get metadata() {
    return new Uint8Array(this.buffer, 48, 32);
  }
  set metadata(arr) {
    if (!Array.isArray(arr) || arr.length !== 32) {
      throw new Error("Metadata must be an array of 32 numbers");
    }
    new Uint8Array(this.buffer, 48, 32).set(arr);
  }

  // Field: TTSignature (uint8_t[64]) [offset 80, 64 bytes]
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

// Initialize NFC using nfc-pcsc
const nfc = new NFC();

nfc.on('reader', reader => {
  console.log(`Reader ${reader.reader.name} detected`);

  reader.on('card', async card => {
    console.log(`Card detected:`, card);

    try {
      // Create and populate the TigerTagSpoolData structure with example values.
      const tagData = new TigerTagSpoolData();
      tagData.tigerTagID = 0xDEADBEEF;
      tagData.productID = [0x01, 0x02, 0x03, 0x04];
      tagData.materialID = 0x1234;
      tagData.aspect1ID = 0x11;
      tagData.aspect2ID = 0x22;
      tagData.typeID = 0x01;
      tagData.diameterID = 0x0A;
      tagData.brandID = 0x3344;
      tagData.color = 0xFFAABBCC;
      tagData.weight = 1000;
      tagData.tempMin = 70;
      tagData.tempMax = 80;
      tagData.dryTemp = 90;
      tagData.dryTime = 100;
      // Reserved blocks can remain zero or be set as needed.
      tagData.reservedBlock11 = 0;
      // Set a timestamp: seconds since 01-01-2000 GMT.
      tagData.timeStamp = Math.floor((Date.now() / 1000) - 946684800);
      // Fill Metadata and TTSignature with zeroes (or any user-defined data).
      tagData.metadata = new Array(32).fill(0);
      tagData.ttSignature = new Array(64).fill(0);

      // Convert the underlying ArrayBuffer to a Node Buffer.
      const buffer = Buffer.from(tagData.buffer);
      console.log("length:", buffer.length);
      // Write the 144-byte data buffer to the tag.
      // In this example, we start at block 4. Adjust the block offset as needed.
      console.log("Writing TigerTag data to the tag...");
      await reader.write(4, buffer);
      console.log("Data written successfully!");
    } catch (err) {
      console.error("Error when writing data:", err);
    }
  });

  reader.on('error', err => {
    console.error(`Error (${reader.reader.name}):`, err);
  });

  reader.on('end', () => {
    console.log(`Reader ${reader.reader.name} disconnected.`);
  });
});

nfc.on('error', err => {
  console.error("NFC error:", err);
});