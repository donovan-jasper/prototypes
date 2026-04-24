import { generateCrisisPin, setCrisisPin, getCrisisPin, verifyCrisisPin, isCrisisModeEnabled, getShareableLink } from '../app/services/crisisMode';
import * as SQLite from 'expo-sqlite';

// Mock SQLite
jest.mock('expo-sqlite', () => {
  const mockDb = {
    transaction: jest.fn((callback) => {
      const mockTx = {
        executeSql: jest.fn((sql, params, success, error) => {
          if (sql.includes('CREATE TABLE')) {
            success();
          } else if (sql.includes('INSERT OR REPLACE')) {
            success();
          } else if (sql.includes('SELECT pin')) {
            success(null, { rows: { length: 1, item: () => ({ pin: 'encrypted-pin' }) } });
          } else if (sql.includes('SELECT isEnabled')) {
            success(null, { rows: { length: 1, item: () => ({ isEnabled: 1 }) } });
          }
        })
      };
      callback(mockTx);
    })
  };
  return {
    openDatabase: jest.fn(() => mockDb)
  };
});

// Mock encryption
jest.mock('../app/services/encryption', () => ({
  encrypt: jest.fn((data) => `encrypted-${data}`),
  decrypt: jest.fn((data) => data.replace('encrypted-', ''))
}));

describe('Crisis Mode Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generateCrisisPin should return a 6-digit string', () => {
    const pin = generateCrisisPin();
    expect(pin).toMatch(/^\d{6}$/);
  });

  test('setCrisisPin should store the encrypted PIN', async () => {
    await setCrisisPin('123456');
    expect(SQLite.openDatabase().transaction).toHaveBeenCalled();
  });

  test('getCrisisPin should return the decrypted PIN', async () => {
    const pin = await getCrisisPin();
    expect(pin).toBe('encrypted-pin');
  });

  test('verifyCrisisPin should return true for correct PIN', async () => {
    const isValid = await verifyCrisisPin('encrypted-pin');
    expect(isValid).toBe(true);
  });

  test('verifyCrisisPin should return false for incorrect PIN', async () => {
    const isValid = await verifyCrisisPin('wrong-pin');
    expect(isValid).toBe(false);
  });

  test('isCrisisModeEnabled should return true when enabled', async () => {
    const enabled = await isCrisisModeEnabled();
    expect(enabled).toBe(true);
  });

  test('getShareableLink should return a valid URL with PIN', async () => {
    const link = await getShareableLink();
    expect(link).toMatch(/^https:\/\/echovault\.app\/crisis\?pin=\d{6}$/);
  });
});
