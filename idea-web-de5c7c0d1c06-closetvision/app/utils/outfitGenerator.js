import { shuffleArray } from './arrayUtils';

const workOutfitRules = {
  top: ['shirt', 'blouse', 'button-up'],
  bottom: ['pants', 'trousers', 'slacks'],
  accessory: ['jacket', 'blazer', 'cardigan']
};

const casualOutfitRules = {
  top: ['t-shirt', 'hoodie', 'sweater'],
  bottom: ['jeans', 'shorts', 'leggings'],
  accessory: ['sneakers', 'boots', 'sandals']
};

const itemDatabase = {
  shirts: ['Oxford shirt', 'Polo shirt', 'Dress shirt'],
  blouses: ['Silk blouse', 'Cotton blouse', 'Linen blouse'],
  'button-ups': ['Formal button-up', 'Casual button-up'],
  pants: ['Chinos', 'Dress pants', 'Cargo pants'],
  trousers: ['Wool trousers', 'Corduroy trousers'],
  slacks: ['Black slacks', 'Khaki slacks'],
  jackets: ['Wool jacket', 'Leather jacket', 'Trench coat'],
  blazers: ['Single-breasted blazer', 'Double-breasted blazer'],
  cardigans: ['Cable-knit cardigan', 'Chunky cardigan'],
  't-shirts': ['Graphic tee', 'V-neck tee', 'Pocket tee'],
  hoodies: ['Zip-up hoodie', 'Pullover hoodie'],
  sweaters: ['Crewneck sweater', 'V-neck sweater'],
  jeans: ['Straight-leg jeans', 'Skinny jeans', 'Bootcut jeans'],
  shorts: ['Denim shorts', 'Cargo shorts'],
  leggings: ['Black leggings', 'Gray leggings'],
  sneakers: ['Running shoes', 'Sneakers', 'Loafers'],
  boots: ['Ankle boots', 'Knee-high boots'],
  sandals: ['Flip-flops', 'Espadrilles', 'Slides']
};

export function generateOutfit(wardrobe, occasion) {
  const rules = occasion === 'work' ? workOutfitRules : casualOutfitRules;
  const outfits = [];

  for (let i = 0; i < 3; i++) {
    const topType = shuffleArray(rules.top)[0];
    const bottomType = shuffleArray(rules.bottom)[0];
    const accessoryType = shuffleArray(rules.accessory)[0];

    const top = shuffleArray(itemDatabase[topType + 's'] || [])[0] || `Generic ${topType}`;
    const bottom = shuffleArray(itemDatabase[bottomType] || [])[0] || `Generic ${bottomType}`;
    const accessory = shuffleArray(itemDatabase[accessoryType] || [])[0] || `Generic ${accessoryType}`;

    outfits.push({
      top,
      bottom,
      accessory,
      occasion
    });
  }

  return outfits;
}
