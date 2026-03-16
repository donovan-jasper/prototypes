import { initDatabase, saveConnection, getConnections } from '../../services/database';

describe('Database Service', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  test('saves and retrieves connections', async () => {
    const connection = {
      id: 'conn1',
      userId: 'user1',
      matchId: 'user2',
      status: 'active',
      createdAt: Date.now(),
    };

    await saveConnection(connection);
    const connections = await getConnections('user1');

    expect(connections.length).toBe(1);
    expect(connections[0].matchId).toBe('user2');
  });
});
