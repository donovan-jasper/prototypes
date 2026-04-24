import { faker } from '@faker-js/faker';

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

const generateMockEvents = (userLat, userLon) => {
  const events = [];
  const now = new Date();
  const currentHour = now.getHours();

  // Generate 5-15 events
  const eventCount = Math.floor(Math.random() * 11) + 5;

  for (let i = 0; i < eventCount; i++) {
    const activity = ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)];

    // Generate coordinates within 10 miles of user location
    const latOffset = (Math.random() - 0.5) * 0.15; // ~10 miles in degrees
    const lonOffset = (Math.random() - 0.5) * 0.15;

    const eventLat = userLat + latOffset;
    const eventLon = userLon + lonOffset;

    // Generate time (within next 2 hours)
    const eventHour = (currentHour + Math.floor(Math.random() * 3)) % 24;
    const eventMinute = Math.floor(Math.random() * 60);
    const eventTime = `${eventHour.toString().padStart(2, '0')}:${eventMinute.toString().padStart(2, '0')}`;

    // Generate participants
    const maxCapacity = Math.floor(Math.random() * 10) + 5;
    const currentParticipants = Math.floor(Math.random() * maxCapacity);

    events.push({
      id: faker.datatype.uuid(),
      title: activity.name,
      emoji: activity.emoji,
      location: faker.address.streetAddress(),
      latitude: eventLat,
      longitude: eventLon,
      time: eventTime,
      currentParticipants,
      maxCapacity,
      createdBy: Math.random() > 0.7 ? 'user' : 'other',
      distance: 0, // Will be calculated in HomeScreen
    });
  }

  return events;
};

export { generateMockEvents };
