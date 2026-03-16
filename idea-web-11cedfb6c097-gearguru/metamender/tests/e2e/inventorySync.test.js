import { device, element, by } from 'detox';

describe('Inventory Sync', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should display inventory items', async () => {
    await expect(element(by.id('inventoryItem'))).toBeVisible();
  });
});
