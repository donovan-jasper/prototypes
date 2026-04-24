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

  for (let i = 0; i < 20; i++) {
    const activity = faker.helpers.arrayElement(ACTIVITY_TYPES);
    const distance = faker.datatype.float({ min: 0.1, max: 15, precision: 0.1 });
    const bearing = faker.datatype.float({ min: 0, max: 360 });

    // Convert distance and bearing to coordinates
    const R = 3958.8; // Earth radius in miles
    const lat2 = userLat + (distance / R) * (180 / Math.PI) * Math.cos(bearing * (Math.PI / 180));
    const lon2 = userLon + (distance / R) * (180 / Math.PI) / Math.cos(userLat * (Math.PI / 180)) * Math.sin(bearing * (Math.PI / 180));

    // Generate random time (next 24 hours)
    const now = new Date();
    const randomMinutes = faker.datatype.number({ min: 0, max: 1440 });
    const eventTime = new Date(now.getTime() + randomMinutes * 60000);

    const hours = eventTime.getHours();
    const minutes = eventTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

    events.push({
      id: `mock-${i}`,
      title: activity.name,
      emoji: activity.emoji,
      location: faker.address.streetAddress(),
      latitude: lat2,
      longitude: lon2,
      distance: parseFloat(distance.toFixed(1)),
      time: `${displayHours}:${displayMinutes} ${ampm}`,
      currentParticipants: faker.datatype.number({ min: 1, max: 15 }),
      maxCapacity: faker.datatype.number({ min: 8, max: 20 }),
      description: faker.lorem.sentence(),
      createdBy: 'community',
    });
  }

  return events;
};

export { generateMockEvents };
