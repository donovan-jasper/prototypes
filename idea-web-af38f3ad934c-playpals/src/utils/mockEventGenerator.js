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

const LOCATION_NAMES = [
  'Central Park',
  'Brooklyn Bridge Park',
  'Washington Square Park',
  'Prospect Park',
  'High Line',
  'Madison Square Park',
  'Bryant Park',
  'Chelsea Piers',
  'Fort Tryon Park',
  'Hudson River Park'
];

const generateTime = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  now.setMinutes(roundedMinutes);
  now.setSeconds(0);

  const hours = now.getHours();
  const mins = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = mins < 10 ? `0${mins}` : mins;

  return `${displayHours}:${displayMinutes} ${ampm}`;
};

const generateDescription = (activity) => {
  const descriptions = {
    'Basketball': [
      'Casual pickup game looking for 2-3 more players. Bring your own ball!',
      'Looking for a fun game of one-on-one. All skill levels welcome.',
      'Quick 30-minute game to get some exercise. Come join!'
    ],
    'Yoga': [
      'Relaxing yoga session for all levels. Bring your mat if you have one.',
      'Guided yoga session to start your day. All are welcome!',
      'Outdoor yoga in the park. Perfect for stretching and relaxation.'
    ],
    'Frisbee': [
      'Frisbee golf anyone? Let\'s play a casual round.',
      'Looking for a few more players for a friendly game.',
      'Bring your disc and join us for some outdoor fun!'
    ],
    'Soccer': [
      'Casual 5v5 game looking for players. All skill levels welcome.',
      'Quick 30-minute scrimmage. Come join the fun!',
      'Looking for a few more players to complete our team.'
    ],
    'Tennis': [
      'Singles match anyone? Let\'s play a friendly game.',
      'Looking for a partner for a doubles match.',
      'Casual tennis game. All skill levels welcome.'
    ],
    'Running': [
      'Morning run group. Let\'s go!',
      'Evening jog through the park. Join us!',
      'Casual running group. All paces welcome.'
    ],
    'Volleyball': [
      'Beach volleyball anyone? Let\'s play!',
      'Looking for a few more players for a casual game.',
      'Quick 30-minute volleyball match. Come join!'
    ],
    'Cycling': [
      'Group ride through the park. Let\'s go!',
      'Casual cycling group. All levels welcome.',
      'Evening bike ride. Join us for some fresh air!'
    ],
    'Hiking': [
      'Easy trail hike. Let\'s explore!',
      'Group hike for beginners. Join us!',
      'Casual hike through the park. All are welcome.'
    ],
    'Pickleball': [
      'Casual pickleball game. All skill levels welcome.',
      'Looking for a partner for a doubles match.',
      'Quick 30-minute pickleball game. Come join!'
    ]
  };

  const options = descriptions[activity] || [
    'Casual activity looking for more participants. Come join!',
    'Fun group activity. All are welcome to participate.',
    'Quick session to get some exercise. Join us!'
  ];

  return faker.helpers.arrayElement(options);
};

const generateMockEvents = (userLat, userLon) => {
  const events = [];
  const now = new Date();
  const currentHour = now.getHours();

  // Generate 5-10 events
  const eventCount = faker.datatype.number({ min: 5, max: 10 });

  for (let i = 0; i < eventCount; i++) {
    const activity = faker.helpers.arrayElement(ACTIVITY_TYPES);
    const location = faker.helpers.arrayElement(LOCATION_NAMES);
    const time = generateTime();

    // Generate coordinates within 1-3 miles of user
    const distance = faker.datatype.float({ min: 0.5, max: 3, precision: 0.1 });
    const bearing = faker.datatype.float({ min: 0, max: 360 });

    const latOffset = distance * Math.cos(bearing * Math.PI / 180) / 69;
    const lonOffset = distance * Math.sin(bearing * Math.PI / 180) / (69 * Math.cos(userLat * Math.PI / 180));

    const eventLat = userLat + latOffset;
    const eventLon = userLon + lonOffset;

    // Generate participant counts based on time of day
    let minParticipants, maxParticipants;
    if (currentHour >= 6 && currentHour < 12) {
      // Morning
      minParticipants = 2;
      maxParticipants = 6;
    } else if (currentHour >= 12 && currentHour < 18) {
      // Afternoon
      minParticipants = 3;
      maxParticipants = 8;
    } else {
      // Evening
      minParticipants = 1;
      maxParticipants = 5;
    }

    const currentParticipants = faker.datatype.number({
      min: minParticipants,
      max: maxParticipants
    });

    const maxCapacity = faker.datatype.number({
      min: currentParticipants + 1,
      max: currentParticipants + 4
    });

    events.push({
      id: `mock-${i}`,
      title: activity.name,
      emoji: activity.emoji,
      location: location,
      latitude: eventLat,
      longitude: eventLon,
      distance: parseFloat(distance.toFixed(1)),
      time: time,
      currentParticipants: currentParticipants,
      maxCapacity: maxCapacity,
      description: generateDescription(activity.name),
      createdBy: 'system',
      createdAt: new Date(Date.now() - faker.datatype.number({ min: 0, max: 3600000 })).toISOString(),
    });
  }

  return events;
};

export { generateMockEvents };
