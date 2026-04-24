import { generateOutfit } from '../../app/utils/outfitGenerator';

jest.mock('../../app/services/wardrobeService', () => ({
  getWardrobe: jest.fn(() => Promise.resolve({
    shirts: ['blue', 'red'],
    pants: ['black', 'grey'],
    jackets: ['brown']
  })),
}));

test('generates 3 outfits for "work" occasion', async () => {
  const outfits = await generateOutfit('work');
  expect(outfits.length).toBe(3);
  outfits.forEach(outfit => {
    expect(outfit).toHaveProperty('top');
    expect(outfit).toHaveProperty('bottom');
    expect(outfit).toHaveProperty('accessory');
  });
});
