export const impedanceRules = {
  'receiver': {
    'speaker': {
      min: 4,
      max: 8,
      message: 'Speaker impedance should match receiver impedance for best performance',
    },
  },
};

export const powerRules = {
  'receiver': {
    'speaker': {
      min: 0.5,
      max: 1.5,
      message: 'Receiver power should be at least 50% of speaker power rating',
    },
  },
};

export const connectionRules = {
  'receiver': {
    'speaker': {
      required: ['RCA', 'Binding Post'],
      message: 'Receiver and speaker must have compatible connection types',
    },
  },
};
