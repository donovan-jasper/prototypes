export const DateUtils = {
  formatDate: (date: Date): string => {
    return date.toLocaleDateString();
  },

  formatTime: (date: Date): string => {
    return date.toLocaleTimeString();
  },

  isToday: (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },
};
