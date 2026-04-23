/**
 * Build Optimizer Utility
 * Generates optimized weapon and armor combinations based on input stats
 */

import { fetchGameData } from './gameDataLoader';

// Game-specific stat weights (example for an RPG)
const STAT_WEIGHTS = {
  attack: 0.4,
  defense: 0.3,
  magic: 0.2,
  speed: 0.1
};

// Default weapon database
const DEFAULT_WEAPON_DATABASE = [
  { id: 'sword1', name: 'Iron Sword', attack: 50, defense: 10, magic: 5, speed: 8, type: 'sword' },
  { id: 'axe1', name: 'Steel Axe', attack: 60, defense: 5, magic: 3, speed: 6, type: 'axe' },
  { id: 'staff1', name: 'Mage Staff', attack: 30, defense: 8, magic: 40, speed: 5, type: 'staff' },
  { id: 'dagger1', name: 'Assassin Dagger', attack: 40, defense: 5, magic: 10, speed: 12, type: 'dagger' }
];

// Default armor database
const DEFAULT_ARMOR_DATABASE = [
  { id: 'plate1', name: 'Iron Plate', defense: 40, magicDefense: 10, speedPenalty: 2, type: 'chest' },
  { id: 'robe1', name: 'Mage Robe', defense: 20, magicDefense: 30, speedPenalty: 0, type: 'chest' },
  { id: 'leather1', name: 'Leather Armor', defense: 30, magicDefense: 5, speedPenalty: 5, type: 'chest' },
  { id: 'cloak1', name: 'Shadow Cloak', defense: 15, magicDefense: 20, speedPenalty: 8, type: 'chest' }
];

// Current game data (initialized with defaults)
let currentGameData = {
  weapons: DEFAULT_WEAPON_DATABASE,
  armor: DEFAULT_ARMOR_DATABASE
};

/**
 * Updates the optimizer with new game data
 * @param {string} gameId - The game identifier
 */
export const updateGameData = async (gameId) => {
  const gameData = await fetchGameData(gameId);
  currentGameData = gameData;
};

/**
 * Calculates the effectiveness score of a build combination
 * @param {Object} stats - Player stats
 * @param {Object} weapon - Selected weapon
 * @param {Object} armor - Selected armor
 * @returns {Object} Effectiveness breakdown and total stats
 */
const calculateBuildStats = (stats, weapon, armor) => {
  const totalStats = {
    attack: stats.attack + weapon.attack,
    defense: stats.defense + weapon.defense + armor.defense,
    magic: stats.magic + weapon.magic,
    speed: stats.speed + weapon.speed - armor.speedPenalty
  };

  // Calculate percentage contributions
  const attackPercent = (weapon.attack / totalStats.attack) * 100;
  const defensePercent = ((weapon.defense + armor.defense) / totalStats.defense) * 100;
  const magicPercent = (weapon.magic / totalStats.magic) * 100;
  const speedPercent = ((weapon.speed - armor.speedPenalty) / totalStats.speed) * 100;

  return {
    effectiveness: {
      attack: attackPercent,
      defense: defensePercent,
      magic: magicPercent,
      speed: speedPercent
    },
    totalStats
  };
};

/**
 * Generates all possible weapon/armor combinations
 * @returns {Array} Array of all possible builds
 */
const generateAllCombinations = () => {
  const combinations = [];

  for (const weapon of currentGameData.weapons) {
    for (const armor of currentGameData.armor) {
      combinations.push({ weapon, armor });
    }
  }

  return combinations;
};

/**
 * Optimizes builds based on input stats
 * @param {Object} stats - Player stats (attack, defense, magic, speed)
 * @returns {Array} Top 3 optimized builds with detailed breakdowns
 */
export const optimizeBuilds = (stats) => {
  const combinations = generateAllCombinations();

  // Calculate effectiveness for each combination
  const builds = combinations.map(({ weapon, armor }) => {
    const { effectiveness, totalStats } = calculateBuildStats(stats, weapon, armor);

    // Calculate overall score based on weighted stats
    const score = (totalStats.attack * STAT_WEIGHTS.attack) +
                 (totalStats.defense * STAT_WEIGHTS.defense) +
                 (totalStats.magic * STAT_WEIGHTS.magic) +
                 (totalStats.speed * STAT_WEIGHTS.speed);

    return {
      weapon,
      armor,
      effectiveness,
      totalStats,
      score
    };
  });

  // Sort by score (descending) and return top 3
  builds.sort((a, b) => b.score - a.score);

  return builds.slice(0, 3).map(build => ({
    weapons: [build.weapon],
    armor: [build.armor],
    effectiveness: build.effectiveness,
    totalStats: build.totalStats,
    score: build.score
  }));
};
