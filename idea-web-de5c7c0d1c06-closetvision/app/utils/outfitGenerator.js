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

  for (let i = 0; i < 3; i++) {
    const topType = shuffleArray(rules.top)[0];
    const bottomType = shuffleArray(rules.bottom)[0];
    const accessoryType = shuffleArray(rules.accessory)[0];

    const top = shuffleArray(wardrobe[topType] || [])[0] || `Generic ${topType}`;
    const bottom = shuffleArray(wardrobe[bottomType] || [])[0] || `Generic ${bottomType}`;
    const accessory = shuffleArray(wardrobe[accessoryType] || [])[0] || `Generic ${accessoryType}`;

    outfits.push({
      top,
      bottom,
      accessory,
      occasion
    });
  }

  return outfits;
}
