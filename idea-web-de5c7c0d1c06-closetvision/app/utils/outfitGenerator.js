import { shuffleArray } from './arrayUtils';

const workOutfitRules = {
  top: ['shirts', 'blouses', 'button-ups'],
  bottom: ['pants', 'trousers', 'slacks'],
  accessory: ['jackets', 'blazers', 'cardigans']
};

const casualOutfitRules = {
  top: ['t-shirts', 'hoodies', 'sweaters'],
  bottom: ['jeans', 'shorts', 'leggings'],
  accessory: ['sneakers', 'boots', 'sandals']
};

const formalOutfitRules = {
  top: ['blouses', 'button-ups', 'shirts'],
  bottom: ['pants', 'trousers', 'skirts'],
  accessory: ['blazers', 'jackets', 'ties']
};

const athleisureOutfitRules = {
  top: ['t-shirts', 'hoodies', 'sweaters'],
  bottom: ['jeans', 'leggings', 'shorts'],
  accessory: ['sneakers', 'boots', 'sandals']
};

export function generateOutfit(wardrobe, occasion) {
  let rules;
  switch (occasion) {
    case 'work':
      rules = workOutfitRules;
      break;
    case 'casual':
      rules = casualOutfitRules;
      break;
    case 'formal':
      rules = formalOutfitRules;
      break;
    case 'athleisure':
      rules = athleisureOutfitRules;
      break;
    default:
      rules = casualOutfitRules;
  }

  const outfits = [];
  const usedCombinations = new Set();

  for (let i = 0; i < 3; i++) {
    let top, bottom, accessory;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const topType = shuffleArray(rules.top)[0];
      const bottomType = shuffleArray(rules.bottom)[0];
      const accessoryType = shuffleArray(rules.accessory)[0];

      const combinationKey = `${topType}-${bottomType}-${accessoryType}`;

      if (!usedCombinations.has(combinationKey)) {
        top = shuffleArray(wardrobe[topType] || [])[0] || `Generic ${topType}`;
        bottom = shuffleArray(wardrobe[bottomType] || [])[0] || `Generic ${bottomType}`;
        accessory = shuffleArray(wardrobe[accessoryType] || [])[0] || `Generic ${accessoryType}`;

        if (top && bottom && accessory) {
          outfits.push({
            top,
            bottom,
            accessory,
            occasion
          });
          usedCombinations.add(combinationKey);
          break;
        }
      }
      attempts++;
    }
  }

  // If we couldn't create 3 outfits, try to create more with different combinations
  if (outfits.length < 3) {
    const additionalOutfits = generateAdditionalOutfits(wardrobe, rules, 3 - outfits.length, usedCombinations);
    outfits.push(...additionalOutfits);
  }

  return outfits;
}

function generateAdditionalOutfits(wardrobe, rules, needed, usedCombinations) {
  const additionalOutfits = [];

  for (let i = 0; i < needed; i++) {
    let top, bottom, accessory;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const topType = shuffleArray(rules.top)[0];
      const bottomType = shuffleArray(rules.bottom)[0];
      const accessoryType = shuffleArray(rules.accessory)[0];

      const combinationKey = `${topType}-${bottomType}-${accessoryType}`;

      if (!usedCombinations.has(combinationKey)) {
        top = shuffleArray(wardrobe[topType] || [])[0] || `Generic ${topType}`;
        bottom = shuffleArray(wardrobe[bottomType] || [])[0] || `Generic ${bottomType}`;
        accessory = shuffleArray(wardrobe[accessoryType] || [])[0] || `Generic ${accessoryType}`;

        if (top && bottom && accessory) {
          additionalOutfits.push({
            top,
            bottom,
            accessory,
            occasion: 'custom'
          });
          usedCombinations.add(combinationKey);
          break;
        }
      }
      attempts++;
    }
  }

  return additionalOutfits;
}
