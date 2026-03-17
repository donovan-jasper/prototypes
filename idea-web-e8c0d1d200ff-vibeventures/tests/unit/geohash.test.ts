import { encodeGeohash, decodeGeohash, getGeohashRange, calculateDistance } from '../../src/utils/geohash';

describe('Geohash utilities', () => {
  test('encodes coordinates to geohash', () => {
    const geohash = encodeGeohash(35.5951, -82.5515, 9);
    expect(geohash).toBeTruthy();
    expect(geohash.length).toBe(9);
  });

  test('decodes geohash to coordinates', () => {
    const geohash = encodeGeohash(35.5951, -82.5515, 9);
    const decoded = decodeGeohash(geohash);
    
    expect(decoded.latitude).toBeCloseTo(35.5951, 3);
    expect(decoded.longitude).toBeCloseTo(-82.5515, 3);
  });

  test('generates geohash range for radius', () => {
    const ranges = getGeohashRange(35.5951, -82.5515, 10);
    expect(ranges.length).toBeGreaterThan(0);
    expect(ranges[0]).toBeTruthy();
  });

  test('calculates distance between coordinates', () => {
    const distance = calculateDistance(35.5951, -82.5515, 35.6, -82.55);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(10);
  });

  test('geohash precision matches radius', () => {
    const hash1 = encodeGeohash(35.5951, -82.5515, 5);
    const hash2 = encodeGeohash(35.5951, -82.5515, 9);
    
    expect(hash1.length).toBe(5);
    expect(hash2.length).toBe(9);
    expect(hash2.startsWith(hash1)).toBe(true);
  });
});
