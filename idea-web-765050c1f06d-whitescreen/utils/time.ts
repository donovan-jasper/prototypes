export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getCurrentTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
};
