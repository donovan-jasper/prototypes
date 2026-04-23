import { WEAPONS_DB, ARMOR_DB } from './itemDatabase';

// Calculate how well an item matches target stats
const calculateItemScore = (item, targetStats, weights) => {
  let score = 0;

  // Attack contribution
  if (targetStats.attack > 0) {
    const attackContribution = (item.attack / targetStats.attack) * weights.attack;
    score += Math.min(attackContribution, weights.attack);
  }

  // Defense contribution
  if (targetStats.defense > 0) {
    const defenseContribution = (item.defense / targetStats.defense) * weights.defense;
    score += Math.min(defenseContribution, weights.defense);
  }

  // Bonus for having special perks
  if (item.special) {
    score += weights.special;
  }

  // Bonus for rarity
  if (item.rarity === 'Legendary' || item.rarity === 'Exotic' || item.rarity === 'Mythic') {
    score += weights.rarity;
  }

  // Bonus for matching type (if type is specified)
  if (item.type && targetStats.type && item.type === targetStats.type) {
    score += weights.type;
  }

  // Bonus for matching game (if specified)
  if (item.game && targetStats.game && item.game === targetStats.game) {
    score += weights.game;
  }

  return score;
};

// Greedy algorithm to select best items
const selectBestItems = (items, targetStats, weights, count) => {
  const scoredItems = items.map(item => ({
    ...item,
    score: calculateItemScore(item, targetStats, weights),
  }));

  // Sort by score descending
  scoredItems.sort((a, b) => b.score - a.score);

  // Return top N items
  return scoredItems.slice(0, count);
};

export const optimizeBuild = (stats) => {
  // Stat weights for scoring
  const weights = {
    attack: 50,
    defense: 50,
    special: 20,
    rarity: 15,
    type: 10,
    game: 10
  };

  // Select top 3 weapons
  const weapons = selectBestItems(WEAPONS_DB, stats, weights, 3);

  // Select top 3 armor pieces
  const armor = selectBestItems(ARMOR_DB, stats, weights, 3);

  // Calculate total stats achieved
  const totalStats = {
    attack: weapons.reduce((sum, w) => sum + w.attack, 0),
    defense: armor.reduce((sum, a) => sum + a.defense, 0),
  };

  // Calculate optimization effectiveness
  const attackEffectiveness = stats.attack > 0
    ? Math.min((totalStats.attack / stats.attack) * 100, 100)
    : 100;
  const defenseEffectiveness = stats.defense > 0
    ? Math.min((totalStats.defense / stats.defense) * 100, 100)
    : 100;

  // Calculate stat distribution percentages
  const totalTargetStats = stats.attack + stats.defense;
  const attackPercentage = totalTargetStats > 0
    ? (stats.attack / totalTargetStats) * 100
    : 50;
  const defensePercentage = totalTargetStats > 0
    ? (stats.defense / totalTargetStats) * 100
    : 50;

  return {
    weapons,
    armor,
    totalStats,
    targetStats: stats,
    effectiveness: {
      attack: attackEffectiveness,
      defense: defenseEffectiveness,
      overall: (attackEffectiveness + defenseEffectiveness) / 2,
    },
    statDistribution: {
      attack: attackPercentage,
      defense: defensePercentage,
    },
    recommendations: {
      weapons: weapons.map(w => ({
        ...w,
        recommendationScore: calculateItemScore(w, stats, weights),
      })),
      armor: armor.map(a => ({
        ...a,
        recommendationScore: calculateItemScore(a, stats, weights),
      })),
    },
  };
};
