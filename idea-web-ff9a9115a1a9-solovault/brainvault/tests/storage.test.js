import { initDB, saveItem, getItems } from '../app/utils/storage';

describe('Storage Management', () => {
  beforeAll(() => {
    initDB();
  });

  it('saves an item', () => {
    saveItem('Test item');
    expect(saveItem).toHaveBeenCalledWith('Test item');
  });

  it('retrieves all items', async () => {
    const items = await getItems();
    expect(items.length).toBeGreaterThan(0);
  });
});
