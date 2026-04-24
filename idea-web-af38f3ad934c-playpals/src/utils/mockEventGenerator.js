import { faker } from '@faker-js/faker';

const ACTIVITY_TYPES = [
  { name: 'Basketball', emoji: '🏀', popularity: 0.8, timeOfDay: 'evening' },
  { name: 'Yoga', emoji: '🧘', popularity: 0.6, timeOfDay: 'morning' },
  { name: 'Frisbee', emoji: '🥏', popularity: 0.5, timeOfDay: 'afternoon' },
  { name: 'Soccer', emoji: '⚽', popularity: 0.9, timeOfDay: 'evening' },
  { name: 'Tennis', emoji: '🎾', popularity: 0.7, timeOfDay: 'afternoon' },
  { name: 'Running', emoji: '🏃', popularity: 0.7, timeOfDay: 'morning' },
  { name: 'Volleyball', emoji: '🏐', popularity: 0.6, timeOfDay: 'evening' },
  { name: 'Cycling', emoji: '🚴', popularity: 0.5, timeOfDay: 'morning' },
  { name: 'Hiking', emoji: '🥾', popularity: 0.4, timeOfDay: 'afternoon' },
  { name: 'Pickleball', emoji: '🏓', popularity: 0.6, timeOfDay: 'afternoon' },
];

const generateMockEvents = (userLat, userLon) => {
  const events = [];
  const currentHour = new Date().getHours();

  // Generate 15-25 events
  const eventCount = Math.floor(Math.random() * 11) + 15;

  for (let i = 0; i < eventCount; i++) {
    const activity = ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)];

    // Adjust popularity based on time of day
    let popularityModifier = 1;
    if (activity.timeOfDay === 'morning' && currentHour < 12) {
      popularityModifier = 1.5;
    } else if (activity.timeOfDay === 'afternoon' && currentHour >= 12 && currentHour < 18) {
      popularityModifier = 1.5;
    } else if (activity.timeOfDay === 'evening' && currentHour >= 18) {
      popularityModifier = 1.5;
    }

    // Calculate distance (0.5-10 miles)
    const distance = Math.random() * 9.5 + 0.5;

    // Calculate coordinates based on distance
    const angle = Math.random() * Math.PI * 2;
    const latOffset = (distance / 3958.8) * Math.cos(angle);
    const lonOffset = (distance / 3958.8) * Math.sin(angle) / Math.cos(userLat * Math.PI / 180);

    const eventLat = userLat + latOffset * (180 / Math.PI);
    const eventLon = userLon + lonOffset * (180 / Math.PI);

    // Generate realistic time (within next 2 hours)
    const now = new Date();
    const timeOffset = Math.floor(Math.random() * 120) * 60 * 1000;
    const eventTime = new Date(now.getTime() + timeOffset);

    // Generate participant count based on popularity
    const baseParticipants = Math.floor(activity.popularity * popularityModifier * 10) + 1;
    const participants = Math.min(baseParticipants + Math.floor(Math.random() * 5), 20);

    events.push({
      id: faker.string.uuid(),
      title: activity.name,
      emoji: activity.emoji,
      location: faker.location.streetAddress(),
      latitude: eventLat,
      longitude: eventLon,
      distance: parseFloat(distance.toFixed(1)),
      time: eventTime,
      participants: participants,
      description: `Join us for a ${activity.name.toLowerCase()} session! ${faker.lorem.sentences(2)}`,
      organizer: faker.person.fullName(),
      isPopular: participants > 10,
      isNew: Math.random() > 0.7,
    });
  }

  // Sort by distance
  events.sort((a, b) => a.distance - b.distance);

  return events;
};

export { generateMockEvents };
