/**
 * Test cases for the TigerTag protocol modules using Jest.
 */

const decoder = require('../../src/protocols/tigertag/decoder');

describe('TigerTag Decoder', () => {
  test('should decode sample pages correctly', () => {
    const samplePages = [
      [0x5B, 0xF5, 0x92, 0x64],
      [0xFF, 0xFF, 0xFF, 0xFF],
      [0x00, 0x10, 0x01, 0x02],
      [0x03, 0x04, 0x00, 0x20],
      [0xFF, 0xAA, 0xBB, 0xCC],
      [0x00, 0x00, 0x0F, 0x01],
      [0x00, 0x1E, 0x00, 0x28],
      [0x1A, 0x05, 0x00, 0x00],
      [0x00, 0x00, 0x00, 0x01]
    ];
    const decoded = decoder.decode(samplePages);
    expect(decoded).toContain('Version ID');
    expect(decoded).toContain('Product ID');
  });
});