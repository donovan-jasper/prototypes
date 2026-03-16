import { calculateSparkScore, updateSparkScore } from '../lib/scoring';
import { getDatabase } from '../lib/database';

jest.mock('../lib/database', () => ({
  getDatabase: jest.fn(),
}));

describe('scoring', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn((callback) => callback(mockDb)),
      executeSql: jest.fn(),
    };
    getDatabase.mockReturnValue(mockDb);
  });

  it('should calculate spark score', async () => {
    mockDb.executeSql.mockImplementation((sql, params, success) => {
      if (sql.includes('COUNT(*) as ideaCount')) {
        success(null, { rows: { _array: [{ ideaCount: 2 }] } });
      } else if (sql.includes('COUNT(*) as feedbackCount')) {
        success(null, { rows: { _array: [{ feedbackCount: 3 }] } });
      }
    });

    const result = await calculateSparkScore(1);
    expect(result).toBe(35);
  });

  it('should update spark score', async () => {
    mockDb.executeSql.mockImplementation((sql, params, success) => {
      success(null, { rowsAffected: 1 });
    });

    const result = await updateSparkScore(1, 35);
    expect(result.rowsAffected).toBe(1);
  });
});
