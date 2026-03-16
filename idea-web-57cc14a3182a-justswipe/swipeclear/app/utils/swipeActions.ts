export const swipeToArchive = (item) => {
  return { ...item, archived: true };
};

export const swipeToMute = (item) => {
  return { ...item, muted: true };
};

export const swipeToPin = (item) => {
  return { ...item, pinned: true };
};

export const swipeToDelete = (item) => {
  return { ...item, deleted: true };
};
