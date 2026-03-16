export const detectTimeContext = () => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 9) {
    return 'morning';
  } else if (hour >= 9 && hour < 17) {
    return 'work';
  } else if (hour >= 17 && hour < 22) {
    return 'evening';
  } else {
    return 'night';
  }
};
