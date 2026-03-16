import { initDatabase, insertContact, getContacts } from '../lib/database';

describe('Database', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('inserts and retrieves contact', async () => {
    await insertContact({ name: 'Frank', frequency: 30, lastContact: new Date() });
    const contacts = await getContacts();
    expect(contacts.length).toBeGreaterThan(0);
    expect(contacts.some(c => c.name === 'Frank')).toBe(true);
  });
});
