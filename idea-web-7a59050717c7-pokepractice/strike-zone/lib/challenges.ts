export const generateTargets = (count, bounds) => {
  const targets = [];
  for (let i = 0; i < count; i++) {
    targets.push({
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
      radius: 20,
    });
  }
  return targets;
};

export const validateHit = (tap, target) => {
  const dx = tap.x - target.x;
  const dy = tap.y - target.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= target.radius;
};

export const startChallenge = (type) => {
  const bounds = { width: 300, height: 500 };
  const targets = generateTargets(10, bounds);
  return { type, targets };
};
