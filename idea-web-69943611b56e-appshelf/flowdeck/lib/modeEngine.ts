import { useStore } from '../store/appStore';

export const switchMode = (mode) => {
  const { setActiveMode } = useStore.getState();
  setActiveMode(mode);
  // Save to database
  // Implementation depends on your database schema
};

export const getActiveMode = () => {
  const { activeMode } = useStore.getState();
  return activeMode;
};

export const shouldAutoSwitch = (mode, currentTime, currentLocation) => {
  if (!mode.triggers) return false;

  // Check time trigger
  if (mode.triggers.time) {
    const { start, end } = mode.triggers.time;
    const startTime = new Date();
    const endTime = new Date();
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    startTime.setHours(startHour, startMinute, 0, 0);
    endTime.setHours(endHour, endMinute, 0, 0);

    if (currentTime >= startTime && currentTime <= endTime) {
      return true;
    }
  }

  // Check location trigger (premium feature)
  // Implementation depends on your location service

  return false;
};

export const autoSwitchDaemon = () => {
  // Check triggers every 5 minutes
  setInterval(async () => {
    const modes = await getModes();
    const currentTime = new Date();
    // const currentLocation = await getCurrentLocation(); // Premium feature

    modes.forEach(mode => {
      if (shouldAutoSwitch(mode, currentTime)) {
        switchMode(mode);
      }
    });
  }, 5 * 60 * 1000);
};
