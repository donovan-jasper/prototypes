import { DatabaseService } from '../../src/services/DatabaseService';
import * as SQLite from 'expo-sqlite';

jest.mock('expo-sqlite');

describe('DatabaseService', () => {
  it('initializes database and creates tasks table', async () => {
    const mockExecuteSql = jest.fn();
    (SQLite.openDatabase as jest.Mock).mockReturnValue({
      transaction: (callback: (tx: any) => void) => {
        callback({ executeSql: mockExecuteSql });
      },
    });

    await DatabaseService.initialize();

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS tasks'),
      [],
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('handles database errors gracefully', async () => {
    const mockError = new Error('Database error');
    (SQLite.openDatabase as jest.Mock).mockReturnValue({
      transaction: (callback: (tx: any) => void, errorCallback: (error: Error) => void) => {
        errorCallback(mockError);
      },
    });

    await expect(DatabaseService.initialize()).rejects.toThrow('Database error');
  });
});
