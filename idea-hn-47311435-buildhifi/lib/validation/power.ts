export const validatePower = (ampWatts, speakerMaxWatts) => {
  if (ampWatts > speakerMaxWatts * 1.2) {
    return 'warning';
  }

  if (ampWatts >= speakerMaxWatts * 0.5 && ampWatts <= speakerMaxWatts * 0.8) {
    return 'optimal';
  }

  return 'compatible';
};
