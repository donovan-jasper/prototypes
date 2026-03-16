import { initDatabase, getFriends, addFriend, getInteractions, addInteraction, getChallenges, addChallenge, getSettings, setSetting } from '../lib/database';
import * as SQLite from 'expo-sqlite';

jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(),
}));

describe('Database operations', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn((callback) => {
        const mockTx = {
          executeSql: jest.fn((sql, params, success, error) => {
            if (success) {
              if (sql.includes('SELECT')) {
                success(null, { rows: { _array: [] } });
              } else {
                success(null, { insertId: 1 });
              }
            }
          }),
        };
        callback(mockTx);
      }),
    };
    SQLite.openDatabase.mockReturnValue(mockDb);
    initDatabase();
  });

  it('should initialize database tables', () => {
    expect(mockDb.transaction).toHaveBeenCalled();
  });

  it('should get friends', async () => {
    const friends = await getFriends();
    expect(friends).toEqual([]);
  });

  it('should add a friend', async () => {
    const friendId = await addFriend({ name: 'Test Friend', phone: '1234567890', email: 'test@example.com', avatar: '' });
    expect(friendId).toBe(1);
  });

  it('should get interactions for a friend', async () => {
    const interactions = await getInteractions(1);
    expect(interactions).toEqual([]);
  });

  it('should add an interaction', async () => {
    const interactionId = await addInteraction({ friend_id: 1, type: 'text', notes: 'Test interaction' });
    expect(interactionId).toBe(1);
  });

  it('should get challenges', async () => {
    const challenges = await getChallenges();
    expect(challenges).toEqual([]);
  });

  it('should add a challenge', async () => {
    const challengeId = await addChallenge({ friend_id: 1, challenge_type: 'Send a text', status: 'active' });
    expect(challengeId).toBe(1);
  });

  it('should get settings', async () => {
    const settings = await getSettings();
    expect(settings).toEqual([]);
  });

  it('should set a setting', async () => {
    await setSetting('notificationsEnabled', 'true');
    expect(mockDb.transaction).toHaveBeenCalled();
  });
});
