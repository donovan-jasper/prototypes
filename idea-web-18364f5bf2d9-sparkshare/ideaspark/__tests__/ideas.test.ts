import { createIdea, getIdeas, getIdeaById } from '../lib/ideas';
import { getDatabase } from '../lib/database';

jest.mock('../lib/database', () => ({
  getDatabase: jest.fn(),
}));

describe('ideas', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      transaction: jest.fn((callback) => callback(mockDb)),
      executeSql: jest.fn(),
    };
    getDatabase.mockReturnValue(mockDb);
  });

  it('should create an idea', async () => {
    const idea = { title: 'Test Idea', description: 'Test Description', category: 'tech' };
    mockDb.executeSql.mockImplementation((sql, params, success) => {
      success(null, { insertId: 1 });
    });

    const result = await createIdea(idea);
    expect(result.insertId).toBe(1);
  });

  it('should get all ideas', async () => {
    const ideas = [{ id: 1, title: 'Test Idea', description: 'Test Description', category: 'tech' }];
    mockDb.executeSql.mockImplementation((sql, params, success) => {
      success(null, { rows: { _array: ideas } });
    });

    const result = await getIdeas();
    expect(result).toEqual(ideas);
  });

  it('should get an idea by id', async () => {
    const idea = { id: 1, title: 'Test Idea', description: 'Test Description', category: 'tech' };
    mockDb.executeSql.mockImplementation((sql, params, success) => {
      success(null, { rows: { _array: [idea] } });
    });

    const result = await getIdeaById(1);
    expect(result).toEqual(idea);
  });
});
