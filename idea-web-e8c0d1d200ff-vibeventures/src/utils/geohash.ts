// Geohash implementation for location-based queries
// Based on the standard geohash algorithm

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export const encodeGeohash = (latitude: number, longitude: number, precision: number = 9): string => {
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = '';

  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      const lonMid = (lonMin + lonMax) / 2;
      if (longitude > lonMid) {
        idx |= (1 << (4 - bit));
        lonMin = lonMid;
      } else {
        lonMax = lonMid;
      }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (latitude > latMid) {
        idx |= (1 << (4 - bit));
        latMin = latMid;
      } else {
        latMax = latMid;
      }
    }

    evenBit = !evenBit;

    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
};

export const decodeGeohash = (geohash: string): { latitude: number; longitude: number; error: { latitude: number; longitude: number } } => {
  let evenBit = true;
  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;

  for (let i = 0; i < geohash.length; i++) {
    const chr = geohash[i];
    const idx = BASE32.indexOf(chr);

    if (idx === -1) throw new Error('Invalid geohash');

    for (let n = 4; n >= 0; n--) {
      const bitN = (idx >> n) & 1;
      if (evenBit) {
        const lonMid = (lonMin + lonMax) / 2;
        if (bitN === 1) {
          lonMin = lonMid;
        } else {
          lonMax = lonMid;
        }
      } else {
        const latMid = (latMin + latMax) / 2;
        if (bitN === 1) {
          latMin = latMid;
        } else {
          latMax = latMid;
        }
      }
      evenBit = !evenBit;
    }
  }

  const latitude = (latMin + latMax) / 2;
  const longitude = (lonMin + lonMax) / 2;

  const latError = latMax - latitude;
  const lonError = lonMax - longitude;

  return {
    latitude,
    longitude,
    error: { latitude: latError, longitude: lonError }
  };
};

export const getGeohashRange = (latitude: number, longitude: number, radiusInKm: number): string[] => {
  const lat = latitude;
  const lon = longitude;

  const latDegrees = radiusInKm / 110.574;
  const lonDegrees = radiusInKm / (111.320 * Math.cos(lat * Math.PI / 180));

  const precision = getPrecisionForRadius(radiusInKm);

  const centerHash = encodeGeohash(lat, lon, precision);
  const neighbors = getNeighbors(centerHash);

  return [centerHash, ...neighbors];
};

const getPrecisionForRadius = (radiusInKm: number): number => {
  if (radiusInKm <= 0.019) return 9;
  if (radiusInKm <= 0.076) return 8;
  if (radiusInKm <= 0.61) return 7;
  if (radiusInKm <= 2.4) return 6;
  if (radiusInKm <= 20) return 5;
  if (radiusInKm <= 78) return 4;
  if (radiusInKm <= 630) return 3;
  if (radiusInKm <= 2500) return 2;
  return 1;
};

const getNeighbors = (geohash: string): string[] => {
  const neighbors: string[] = [];
  
  const directions = [
    { lat: 0, lon: 1 },   // right
    { lat: 0, lon: -1 },  // left
    { lat: 1, lon: 0 },   // top
    { lat: -1, lon: 0 },  // bottom
    { lat: 1, lon: 1 },   // top-right
    { lat: 1, lon: -1 },  // top-left
    { lat: -1, lon: 1 },  // bottom-right
    { lat: -1, lon: -1 }, // bottom-left
  ];

  const decoded = decodeGeohash(geohash);
  const precision = geohash.length;

  for (const dir of directions) {
    const latOffset = dir.lat * decoded.error.latitude * 2;
    const lonOffset = dir.lon * decoded.error.longitude * 2;
    
    const neighborHash = encodeGeohash(
      decoded.latitude + latOffset,
      decoded.longitude + lonOffset,
      precision
    );
    
    if (neighborHash !== geohash && !neighbors.includes(neighborHash)) {
      neighbors.push(neighborHash);
    }
  }

  return neighbors;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
