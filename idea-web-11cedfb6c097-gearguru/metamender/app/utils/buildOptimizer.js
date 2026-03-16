export const optimizeBuild = (stats) => {
  // Simple build optimization logic
  const build = {
    weapons: [],
    armor: [],
  };

  // Add weapons based on attack stat
  for (let i = 0; i < stats.attack / 20; i++) {
    build.weapons.push({ name: `Weapon ${i + 1}`, attack: 20 });
  }

  // Add armor based on defense stat
  for (let i = 0; i < stats.defense / 10; i++) {
    build.armor.push({ name: `Armor ${i + 1}`, defense: 10 });
  }

  return build;
};
