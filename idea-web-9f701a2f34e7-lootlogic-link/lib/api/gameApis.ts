interface Item {
  id: string;
  name: string;
  game: string;
  rarity: string;
  value: number;
}

export const fetchFortniteInventory = (): Promise<Item[]> => {
  return Promise.resolve([
    { id: '1', name: 'Legendary Sword', game: 'Fortnite', rarity: 'legendary', value: 1500 },
    { id: '2', name: 'Epic Shield', game: 'Fortnite', rarity: 'epic', value: 800 },
    { id: '3', name: 'Rare Armor', game: 'Fortnite', rarity: 'rare', value: 300 },
  ]);
};

export const fetchGenshinImpactInventory = (): Promise<Item[]> => {
  return Promise.resolve([
    { id: '4', name: '5-Star Weapon', game: 'Genshin Impact', rarity: '5-star', value: 2000 },
    { id: '5', name: '4-Star Character', game: 'Genshin Impact', rarity: '4-star', value: 1200 },
    { id: '6', name: '3-Star Artifact', game: 'Genshin Impact', rarity: '3-star', value: 500 },
  ]);
};

export const fetchDestiny2Inventory = (): Promise<Item[]> => {
  return Promise.resolve([
    { id: '7', name: 'Exotic Weapon', game: 'Destiny 2', rarity: 'exotic', value: 2500 },
    { id: '8', name: 'Legendary Armor', game: 'Destiny 2', rarity: 'legendary', value: 1800 },
    { id: '9', name: 'Rare Exotic', game: 'Destiny 2', rarity: 'rare', value: 1000 },
  ]);
};
