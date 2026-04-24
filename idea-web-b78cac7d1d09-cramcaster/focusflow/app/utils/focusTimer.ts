export const calculateFocusProgress = (elapsedTime: number, totalDuration: number): number => {
  if (totalDuration <= 0) return 0;
  const progress = (elapsedTime / totalDuration) * 100;
  return Math.min(Math.max(progress, 0), 100); // Clamp between 0-100
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
