import { initDB, getItems, updateItem } from '../app/utils/db';

beforeAll(async () => {
  await initDB();
});

test('getItems returns items', async () => {
  const items = await getItems();
  expect(items.length).toBeGreaterThan(0);
});

test('updateItem updates item', async () => {
  const items = await getItems();
  const itemToUpdate = items[0];
  const updatedItem = { ...itemToUpdate, archived: true };
  await updateItem(updatedItem);
  const updatedItems = await getItems();
  const item = updatedItems.find(i => i.id === itemToUpdate.id);
  expect(item.archived).toBe(true);
});
