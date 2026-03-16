import { initDatabase, saveGift, getGiftHistory } from '../services/database';

describe('Database Service', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('should save and retrieve gift history', async () => {
    const gift = {
      recipientName: 'Charlie',
      restaurant: 'Burger Barn',
      message: 'Congrats on the promotion!',
      amount: 25.50,
      createdAt: new Date().toISOString(),
    };

    await saveGift(gift);
    const history = await getGiftHistory();

    expect(history.length).toBeGreaterThan(0);
    expect(history[0].recipientName).toBe('Charlie');
  });
});
