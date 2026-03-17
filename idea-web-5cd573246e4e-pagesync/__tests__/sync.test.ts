import { syncToCloud, syncFromCloud, initAuth } from '../lib/sync';

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ uid: 'test-uid' });
    return jest.fn();
  }),
}));

describe('Cloud sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('syncs local changes to cloud', async () => {
    const localData = { id: '1', currentPage: 100, title: 'Test Book' };
    const result = await syncToCloud(localData);
    expect(result.success).toBe(true);
  });

  test('handles offline gracefully', async () => {
    const localData = { id: '1', currentPage: 100 };
    const result = await syncToCloud(localData, { offline: true });
    expect(result.queued).toBe(true);
    expect(result.success).toBe(false);
  });

  test('initializes auth successfully', async () => {
    const user = await initAuth();
    expect(user).toBeDefined();
    expect(user?.uid).toBe('test-uid');
  });

  test('syncs from cloud returns empty array on error', async () => {
    const { getDocs } = require('firebase/firestore');
    getDocs.mockRejectedValueOnce(new Error('Network error'));
    
    const result = await syncFromCloud();
    expect(result).toEqual([]);
  });
});
