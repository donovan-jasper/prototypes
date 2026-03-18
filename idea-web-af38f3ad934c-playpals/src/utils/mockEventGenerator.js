const ACTIVITY_TYPES = [
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Yoga', emoji: '🧘' },
  { name: 'Frisbee', emoji: '🥏' },
  { name: 'Soccer', emoji: '⚽' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Running', emoji: '🏃' },
  { name: 'Volleyball', emoji: '🏐' },
  { name: 'Cycling', emoji: '🚴' },
  { name: 'Hiking', emoji: '🥾' },
  { name: 'Pickleball', emoji: '🏓' },
];

const VENUE_NAMES = [
  'Central Park Courts',
  'Riverside Recreation Center',
  'Downtown Fitness Plaza',
  'Lakeside Sports Complex',
  'Community Wellness Hub',
  'Greenway Trail Head',
  'Sunset Park Fields',
  'Urban Fitness Studio',
  'Northside Athletic Center',
  'Eastside Community Gym',
  'Westwood Sports Arena',
  'Hillside Recreation Area',
];

// Constants for geographical calculations
const EARTH_RADIUS_MILES = 3958.8; // Earth's radius in miles

// Helper functions for degrees/radians conversion
const toRadians = (degrees) => degrees * (Math.PI / 180);
const toDegrees = (radians) => radians * (180 / Math.PI);

// Haversine formula to calculate distance between two points on Earth
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = EARTH_RADIUS_MILES; // Earth's radius in miles

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in miles
};

/**
 * Generates random coordinates within a given radius from a central point.
 * Uses a random distance and bearing from the center.
 * @param {number} centerLat - Latitude of the central point.
 * @param {number} centerLon - Longitude of the central point.
 * @param {number} minRadiusMiles - Minimum radius in miles.
 * @param {number} maxRadiusMiles - Maximum radius in miles.
 * @returns {object} An object containing the generated latitude and longitude.
 */
const generateRandomCoordsInRadius = (centerLat, centerLon, minRadiusMiles, maxRadiusMiles) => {
  const R = EARTH_RADIUS_MILES;

  // Generate a random distance within the specified range
  const distance = Math.random() * (maxRadiusMiles - minRadiusMiles) + minRadiusMiles; // in miles

  // Generate a random bearing (angle) from 0 to 360 degrees
  const bearing = Math.random() * 2 * Math.PI; // in radians

  const lat1 = toRadians(centerLat);
  const lon1 = toRadians(centerLon);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / R) +
    Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearing)
  );

  let lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distance / R) * Math.cos(lat1),
      Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  // Normalize longitude to -180 to +180
  lon2 = (lon2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

  return {
    latitude: toDegrees(lat2),
    longitude: toDegrees(lon2),
  };
};


const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getStartTime = () => {
  const now = new Date();
  const minutesToAdd = getRandomInt(10, 120); // Events start 10 to 120 minutes from now
  const startTime = new Date(now.getTime() + minutesToAdd * 60000);

  const hours = startTime.getHours();
  const minutes = startTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 24h to 12h format
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${displayHours}:${displayMinutes} ${ampm}`;
};

/**
 * Generates a list of mock events based on a user's current location.
 * Events will have coordinates within a specified radius of the user and their distance will be calculated.
 * @param {number} userLatitude - The user's current latitude.
 * @param {number} userLongitude - The user's current longitude.
 * @param {number} [count=5-10] - The number of mock events to generate.
 * @returns {Array<object>} An array of mock event objects, sorted by distance.
 */
export const generateMockEvents = (userLatitude, userLongitude, count = getRandomInt(5, 10)) => {
  if (userLatitude === undefined || userLongitude === undefined) {
    console.warn("User location not provided to generateMockEvents. Using a default location for event generation.");
    // Fallback to a default location (e.g., a central point in a major city)
    // This ensures the app doesn't crash if location permission is denied or not yet fetched.
    userLatitude = 34.052235; // Default to Los Angeles, CA
    userLongitude = -118.243683;
  }

  const events = [];
  const usedVenues = new Set(); // To ensure unique venue names for mock events

  for (let i = 0; i < count; i++) {
    let venue;
    // Ensure venue names are unique for each event if possible
    do {
      venue = getRandomElement(VENUE_NAMES);
    } while (usedVenues.has(venue) && usedVenues.size < VENUE_NAMES.length);
    usedVenues.add(venue);

    const activity = getRandomElement(ACTIVITY_TYPES);
    const currentParticipants = getRandomInt(1, 8);
    const maxCapacity = getRandomInt(currentParticipants + 2, 12);

    // Generate event coordinates within 0.5 to 5 miles of the user's location
    const { latitude: eventLat, longitude: eventLon } = generateRandomCoordsInRadius(
      userLatitude,
      userLongitude,
      0.5, // Minimum radius for events (miles)
      5.0  // Maximum radius for events (miles)
    );

    // Calculate the actual distance between the user and the generated event location
    const distance = haversineDistance(userLatitude, userLongitude, eventLat, eventLon).toFixed(1);

    events.push({
      id: `event-${Date.now()}-${i}`,
      title: activity.name,
      emoji: activity.emoji,
      location: venue, // Display name for the location
      latitude: eventLat, // Actual latitude of the event
      longitude: eventLon, // Actual longitude of the event
      distance: parseFloat(distance), // Calculated distance from user to event
      time: getStartTime(),
      currentParticipants,
      maxCapacity,
      description: `Join us for a spontaneous ${activity.name.toLowerCase()} session! All skill levels welcome.`,
    });
  }

  // Sort events by distance, closest first
  return events.sort((a, b) => a.distance - b.distance);
};
