export const swipeToArchive = (item) => {
  return { ...item, archived: true };
};

export const swipeToMute = (item) => {
  return { ...item, muted: !item.muted };
};

export const swipeToPin = (item) => {
  return { ...item, pinned: !item.pinned };
};

export const swipeToDelete = (item) => {
  return { ...item, deleted: true };
};

export const getSwipeAction = (direction: 'left' | 'right' | 'up' | 'down') => {
  switch (direction) {
    case 'left':
      return swipeToArchive;
    case 'right':
      return swipeToMute;
    case 'up':
      return swipeToPin;
    case 'down':
      return swipeToDelete;
    default:
      return (item) => item;
  }
};
