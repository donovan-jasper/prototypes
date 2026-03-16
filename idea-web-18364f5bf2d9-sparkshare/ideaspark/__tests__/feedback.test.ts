import { createFeedback, getFeedbackByIdeaId, getFeedback } from '../lib/feedback';
import { getDatabase } from '../lib/database';

jest.mock('../lib/database', () => ({
  getDatabase: jest.fn(),
}));

describe('feedback', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn((callback) => callback(mockDb)),
      executeSql: jest.fn(),
    };
    getDatabase.mockReturnValue(mockDb);
  });

  it('should create feedback', async () => {
    const feedback = { ideaId: 1, comment: 'Test Comment' };
    mockDb.executeSql.mockImplementation((sql, params, success) => {
      success(null, { insertId: 1 });
    });

    const result = await createFeedback(feedback);
    expect(result.insertId).toBe(1);
  });

  it('should get feedback by idea id', async () => {
    const feedback = [{ id: 1, ideaId: 1, comment: 'Test Comment' }];
    mockDb.executeSql.mockImplementation((sql, params, success) => {
      success(null, { rows: { _array: feedback } });
    });

    const result = await getFeedbackByIdeaId(1);
    expect(result).toEqual(feedback);
  });

  it('should get all feedback', async () => {
    const feedback = [{ id: 1, ideaId: 1, comment: 'Test Comment', ideaTitle: 'Test Idea' }];
    mockDb.executeSql.mockImplementation((sql, params, success) => {
      success(null, { rows: { _array: feedback } });
    });

    const result = await getFeedback();
    expect(result).toEqual(feedback);
  });
});
