export const DEFAULT_PROFILES = [
  {
    id: 'study',
    name: 'Study',
    icon: '📚',
    sensitivity: 5,
  },
  {
    id: 'work',
    name: 'Work',
    icon: '💼',
    sensitivity: 5,
  },
  {
    id: 'audiobook',
    name: 'Audiobook',
    icon: '🎧',
    sensitivity: 5,
  },
];

export const ALERT_LEVELS = {
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
};

export const SENSOR_UPDATE_INTERVAL = 100; // ms
export const STILLNESS_BUFFER_SIZE = 30; // readings (3 seconds at 100ms interval)
