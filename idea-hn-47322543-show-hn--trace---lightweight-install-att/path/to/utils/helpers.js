export const formatInstallCount = (count) => {
  return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formatDeepLinkCount = (count) => {
  return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
