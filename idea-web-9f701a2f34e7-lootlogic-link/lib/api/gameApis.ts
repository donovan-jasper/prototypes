import axios from 'axios';

interface Item {
  id: string;
  name: string;
  game: string;
  rarity: string;
  value: number;
  imageUrl?: string;
  description?: string;
  acquiredAt?: string;
}

interface FortniteItemResponse {
  accountId: string;
  items: {
    templateId: string;
    attributes: {
      max_level_bonus: number;
      item_seen: boolean;
      variants: Array<{ channel: string; active: string; owned: string[] }>;
      favorite: boolean;
    };
    quantity: number;
  }[];
}

interface FortniteCatalogItem {
  id: string;
  name: string;
  description: string;
  type: {
    id: string;
    name: string;
  };
  rarity: {
    id: string;
    name: string;
  };
  images: {
    icon: string;
    featured: string;
  };
}

export class FortniteApiClient {
  private accessToken: string;
  private accountId: string;

  constructor(accessToken: string, accountId: string) {
    this.accessToken = accessToken;
    this.accountId = accountId;
  }

  private async fetchWithAuth(url: string) {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async fetchInventory(): Promise<Item[]> {
    try {
      // Get the player's inventory
      const inventoryUrl = `https://fortniteapi.io/v2/profile/${this.accountId}?accountType=epic`;
      const inventoryData: FortniteItemResponse = await this.fetchWithAuth(inventoryUrl);

      // Get the item catalog to map IDs to names
      const catalogUrl = 'https://fortniteapi.io/v2/shop?lang=en';
      const catalogData = await this.fetchWithAuth(catalogUrl);

      // Map inventory items to our Item interface
      const items: Item[] = inventoryData.items.map((fortniteItem) => {
        const catalogItem = catalogData.shop.find(
          (item: FortniteCatalogItem) => item.id === fortniteItem.templateId
        );

        return {
          id: fortniteItem.templateId,
          name: catalogItem?.name || 'Unknown Item',
          game: 'Fortnite',
          rarity: catalogItem?.rarity?.name.toLowerCase() || 'common',
          value: this.calculateItemValue(catalogItem?.rarity?.name),
          imageUrl: catalogItem?.images?.icon,
          description: catalogItem?.description,
          acquiredAt: new Date().toISOString(),
        };
      });

      return items;
    } catch (error) {
      console.error('Error fetching Fortnite inventory:', error);
      throw error;
    }
  }

  private calculateItemValue(rarity: string): number {
    // Simple value calculation based on rarity
    const rarityValues: Record<string, number> = {
      common: 100,
      uncommon: 200,
      rare: 500,
      epic: 1000,
      legendary: 2000,
      mythic: 5000,
    };

    return rarityValues[rarity.toLowerCase()] || 100;
  }
}

export const fetchFortniteInventory = async (accessToken?: string, accountId?: string): Promise<Item[]> => {
  if (accessToken && accountId) {
    try {
      const apiClient = new FortniteApiClient(accessToken, accountId);
      return await apiClient.fetchInventory();
    } catch (error) {
      console.error('Error fetching real Fortnite inventory:', error);
      // Fall back to mock data if API fails
      return mockFortniteInventory();
    }
  } else {
    // Return mock data when no auth is provided
    return mockFortniteInventory();
  }
};

const mockFortniteInventory = (): Item[] => {
  return [
    {
      id: '1',
      name: 'Legendary Sword',
      game: 'Fortnite',
      rarity: 'legendary',
      value: 1500,
      imageUrl: 'https://example.com/legendary-sword.png',
      description: 'A powerful legendary sword',
      acquiredAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '2',
      name: 'Epic Shield',
      game: 'Fortnite',
      rarity: 'epic',
      value: 800,
      imageUrl: 'https://example.com/epic-shield.png',
      description: 'A sturdy epic shield',
      acquiredAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: '3',
      name: 'Rare Armor',
      game: 'Fortnite',
      rarity: 'rare',
      value: 300,
      imageUrl: 'https://example.com/rare-armor.png',
      description: 'Basic rare armor set',
      acquiredAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ];
};

export const fetchGenshinImpactInventory = (): Promise<Item[]> => {
  return Promise.resolve([
    {
      id: '4',
      name: '5-Star Weapon',
      game: 'Genshin Impact',
      rarity: '5-star',
      value: 2000,
      imageUrl: 'https://example.com/5-star-weapon.png',
      description: 'A powerful 5-star weapon',
      acquiredAt: new Date(Date.now() - 345600000).toISOString(),
    },
    {
      id: '5',
      name: '4-Star Character',
      game: 'Genshin Impact',
      rarity: '4-star',
      value: 1200,
      imageUrl: 'https://example.com/4-star-character.png',
      description: 'A versatile 4-star character',
      acquiredAt: new Date(Date.now() - 432000000).toISOString(),
    },
    {
      id: '6',
      name: '3-Star Artifact',
      game: 'Genshin Impact',
      rarity: '3-star',
      value: 500,
      imageUrl: 'https://example.com/3-star-artifact.png',
      description: 'A basic 3-star artifact',
      acquiredAt: new Date(Date.now() - 518400000).toISOString(),
    },
  ]);
};

export const fetchDestiny2Inventory = (): Promise<Item[]> => {
  return Promise.resolve([
    {
      id: '7',
      name: 'Exotic Weapon',
      game: 'Destiny 2',
      rarity: 'exotic',
      value: 2500,
      imageUrl: 'https://example.com/exotic-weapon.png',
      description: 'A unique exotic weapon',
      acquiredAt: new Date(Date.now() - 604800000).toISOString(),
    },
    {
      id: '8',
      name: 'Legendary Armor',
      game: 'Destiny 2',
      rarity: 'legendary',
      value: 1800,
      imageUrl: 'https://example.com/legendary-armor.png',
      description: 'High-quality legendary armor',
      acquiredAt: new Date(Date.now() - 691200000).toISOString(),
    },
    {
      id: '9',
      name: 'Rare Exotic',
      game: 'Destiny 2',
      rarity: 'rare',
      value: 1000,
      imageUrl: 'https://example.com/rare-exotic.png',
      description: 'A rare exotic item',
      acquiredAt: new Date(Date.now() - 777600000).toISOString(),
    },
  ]);
};
