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
  };
};
