export const validateImpedance = (speakerOhms, ampOhms, options = {}) => {
  const { minOhms = 0, maxOhms = Infinity } = options;

  if (speakerOhms < minOhms || speakerOhms > maxOhms) {
    return 'incompatible';
  }

  if (ampOhms < speakerOhms) {
    return 'warning';
  }

  return 'compatible';
};
