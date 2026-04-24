import { getWardrobe } from '../services/wardrobeService';

export const generateOutfit = async (occasion) => {
  const wardrobe = await getWardrobe();
  const outfits = [];

  // Rule-based outfit generation logic
  if (occasion === 'work') {
    // Work outfits: shirt + pants + jacket
    const shirts = wardrobe.filter(item => item.category === 'shirt');
    const pants = wardrobe.filter(item => item.category === 'pants');
    const jackets = wardrobe.filter(item => item.category === 'jacket');

    for (let i = 0; i < 3; i++) {
      if (shirts.length > 0 && pants.length > 0 && jackets.length > 0) {
        const randomShirt = shirts[Math.floor(Math.random() * shirts.length)];
        const randomPants = pants[Math.floor(Math.random() * pants.length)];
        const randomJacket = jackets[Math.floor(Math.random() * jackets.length)];

        outfits.push({
          id: `work-${i}`,
          top: randomShirt.name,
          bottom: randomPants.name,
          accessory: randomJacket.name,
          occasion: 'work'
        });
      }
    }
  } else if (occasion === 'casual') {
    // Casual outfits: t-shirt + jeans + sneakers
    const tshirts = wardrobe.filter(item => item.category === 't-shirt');
    const jeans = wardrobe.filter(item => item.category === 'jeans');
    const sneakers = wardrobe.filter(item => item.category === 'sneakers');

    for (let i = 0; i < 3; i++) {
      if (tshirts.length > 0 && jeans.length > 0 && sneakers.length > 0) {
        const randomTshirt = tshirts[Math.floor(Math.random() * tshirts.length)];
        const randomJeans = jeans[Math.floor(Math.random() * jeans.length)];
        const randomSneakers = sneakers[Math.floor(Math.random() * sneakers.length)];

        outfits.push({
          id: `casual-${i}`,
          top: randomTshirt.name,
          bottom: randomJeans.name,
          accessory: randomSneakers.name,
          occasion: 'casual'
        });
      }
    }
  }

  return outfits;
};
