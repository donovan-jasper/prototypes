/**
 * Build Optimizer Utility
 * Generates optimized weapon and armor combinations based on input stats
 */

// Game-specific stat weights (example for an RPG)
const STAT_WEIGHTS = {
  attack: 0.4,
  defense: 0.3,
  magic: 0.2,
  speed: 0.1
};

// Example weapon database
const WEAPON_DATABASE = [
  { id: 'sword1', name: 'Iron Sword', attack: 50, defense: 10, magic: 5, speed: 8, type: 'sword' },
  { id: 'axe1', name: 'Steel Axe', attack: 60, defense: 5, magic: 3, speed: 6, type: 'axe' },
  { id: 'staff1', name: 'Mage Staff', attack: 30, defense: 8, magic: 40, speed: 5, type: 'staff' },
  { id: 'dagger1', name: 'Assassin Dagger', attack: 40, defense: 5, magic: 10, speed: 12, type: 'dagger' }
];

// Example armor database
const ARMOR_DATABASE = [
  { id: 'plate1', name: 'Iron Plate', defense: 40, magicDefense: 10, speedPenalty: 2, type: 'chest' },
  { id: 'robe1', name: 'Mage Robe', defense: 20, magicDefense: 30, speedPenalty: 0, type: 'chest' },
  { id: 'leather1', name: 'Leather Armor', defense: 30, magicDefense: 5, speedPenalty: 5, type: 'chest' },
  { id: 'cloak1', name: 'Shadow Cloak', defense: 15, magicDefense: 20, speedPenalty: 8, type: 'chest' }
];

/**
 * Calculates the effectiveness score of a build combination
 * @param {Object} stats - Player stats
 * @param {Object} weapon - Selected weapon
 * @param {Object} armor - Selected armor
 * @returns {number} Effectiveness score (0-100)
 */
const calculateEffectiveness = (stats, weapon, armor) => {
  const totalStats = {
    attack: stats.attack + weapon.attack,
    defense: stats.defense + weapon.defense + armor.defense,
    magic: stats.magic + weapon.magic,
    speed: stats.speed + weapon.speed - armor.speedPenalty
  };

  let score = 0;
  Object.entries(STAT_WEIGHTS).forEach(([stat, weight]) => {
    score += totalStats[stat] * weight;
  });

  // Normalize to 0-100 scale
  const maxPossible = Object.values(STAT_WEIGHTS).reduce((a, b) => a + b, 0) * 100;
  return Math.min(100, Math.round((score / maxPossible) * 100));
};

/**
 * Optimizes a build based on input stats
 * @param {Object} stats - Player stats (attack, defense, magic, speed)
 * @returns {Object} Optimized build with weapons, armor, and effectiveness
 */
export const optimizeBuild = (stats) => {
  // Find best weapon based on attack stat
  const bestWeapon = WEAPON_DATABASE.reduce((best, current) => {
    const currentScore = current.attack * STAT_WEIGHTS.attack +
                        current.defense * STAT_WEIGHTS.defense +
                        current.magic * STAT_WEIGHTS.magic +
                        current.speed * STAT_WEIGHTS.speed;
    const bestScore = best.attack * STAT_WEIGHTS.attack +
                      best.defense * STAT_WEIGHTS.defense +
                      best.magic * STAT_WEIGHTS.magic +
                      best.speed * STAT_WEIGHTS.speed;

    return currentScore > bestScore ? current : best;
  }, WEAPON_DATABASE[0]);

  // Find best armor based on defense stat
  const bestArmor = ARMOR_DATABASE.reduce((best, current) => {
    const currentScore = current.defense * STAT_WEIGHTS.defense +
                        current.magicDefense * STAT_WEIGHTS.magic;
    const bestScore = best.defense * STAT_WEIGHTS.defense +
                      best.magicDefense * STAT_WEIGHTS.magic;

    return currentScore > bestScore ? current : best;
  }, ARMOR_DATABASE[0]);

  // Calculate effectiveness
  const effectiveness = calculateEffectiveness(stats, bestWeapon, bestArmor);

  return {
    weapons: [bestWeapon],
    armor: [bestArmor],
    effectiveness,
    totalStats: {
      attack: stats.attack + bestWeapon.attack,
      defense: stats.defense + bestWeapon.defense + bestArmor.defense,
      magic: stats.magic + bestWeapon.magic,
      speed: stats.speed + bestWeapon.speed - bestArmor.speedPenalty
    }
  };
};
