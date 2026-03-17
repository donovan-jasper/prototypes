export const CONFIG = {
  NIGHT_SHIFT: {
    DEFAULT_START_HOUR: 2,
    DEFAULT_END_HOUR: 6,
    MIN_BATTERY_LEVEL: 20,
  },
  TASKS: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
  },
  STORAGE: {
    ORGANIZED_FOLDER: 'NightOwlOrganized',
  },
  BATTERY: {
    PAUSE_THRESHOLD: 15, // Pause if battery is below 15%
    RESUME_THRESHOLD: 30, // Resume if battery is above 30%
  },
};
