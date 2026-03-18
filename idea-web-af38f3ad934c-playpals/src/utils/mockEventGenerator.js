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

const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomDistance = () => {
  return (Math.random() * 2.5 + 0.5).toFixed(1);
};

const getStartTime = () => {
  const now = new Date();
  const minutesToAdd = getRandomInt(10, 120);
  const startTime = new Date(now.getTime() + minutesToAdd * 60000);
  
  const hours = startTime.getHours();
  const minutes = startTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

export const generateMockEvents = (count = getRandomInt(5, 10)) => {
  const events = [];
  const usedVenues = new Set();
  
  for (let i = 0; i < count; i++) {
    let venue;
    do {
      venue = getRandomElement(VENUE_NAMES);
    } while (usedVenues.has(venue) && usedVenues.size < VENUE_NAMES.length);
    usedVenues.add(venue);
    
    const activity = getRandomElement(ACTIVITY_TYPES);
    const currentParticipants = getRandomInt(1, 8);
    const maxCapacity = getRandomInt(currentParticipants + 2, 12);
    
    events.push({
      id: `event-${Date.now()}-${i}`,
      title: activity.name,
      emoji: activity.emoji,
      location: venue,
      distance: getRandomDistance(),
      time: getStartTime(),
      currentParticipants,
      maxCapacity,
      description: `Join us for a spontaneous ${activity.name.toLowerCase()} session! All skill levels welcome.`,
    });
  }
  
  return events.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
};
