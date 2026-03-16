export const helpers = {
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  },

  capitalizeFirstLetter: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },
};
