export const PARTS = {
  RAMP: {
    type: 'RAMP',
    mass: 0,
    friction: 0.1,
    restitution: 0.2,
    shape: 'rectangle',
    color: '#6200ee',
    icon: 'change-history',
    isPremium: false,
  },
  BALL: {
    type: 'BALL',
    mass: 1,
    friction: 0.01,
    restitution: 0.8,
    shape: 'circle',
    color: '#03dac6',
    icon: 'brightness-1',
    isPremium: false,
  },
  WHEEL: {
    type: 'WHEEL',
    mass: 2,
    friction: 0.1,
    restitution: 0.5,
    shape: 'circle',
    color: '#018786',
    icon: 'panorama-fish-eye',
    isPremium: false,
  },
  // Add more basic parts
  MOTOR: {
    type: 'MOTOR',
    mass: 3,
    friction: 0.2,
    restitution: 0.3,
    shape: 'rectangle',
    color: '#bb86fc',
    icon: 'settings',
    isPremium: true,
  },
  // Add more premium parts
};

export const isPremiumPart = (type) => {
  return PARTS[type]?.isPremium || false;
};
