import { initializeDatabase, addNote, getNotes, updateNote, deleteNote } from '../app/services/database';

// Mock the SQLite database
jest.mock('expo-sqlite', () => {
  const mockDb = {
    transaction: jest.fn((callback) => {
      const mockTx = {
        executeSql: jest.fn((sql, params, success, error) => {
          if (sql.includes('CREATE TABLE')) {
            success();
          } else if (sql.includes('INSERT INTO')) {
            success(null, { insertId: 1 });
          } else if (sql.includes('SELECT * FROM')) {
            success(null, { rows: { _array: [{ id: 1, title: 'Test', content: 'Content', date: '2023-01-01', audioUri: null }] } });
          } else if (sql.includes('UPDATE')) {
            success();
          } else if (sql.includes('DELETE')) {
            success();
          } else {
            error(new Error('Unknown SQL command'));
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

describe('Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializeDatabase creates the notes table', async () => {
    await initializeDatabase();
    expect(require('expo-sqlite').openDatabase().transaction).toHaveBeenCalled();
  });

  test('addNote inserts a new note into the database', async () => {
    const noteId = await addNote('Test Note', 'Test Content', null);
    expect(noteId).toBe(1);
  });

  test('getNotes retrieves all notes from the database', async () => {
    const notes = await getNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('Test');
  });

  test('updateNote updates an existing note', async () => {
    await expect(updateNote(1, 'Updated Title', 'Updated Content')).resolves.not.toThrow();
  });

  test('deleteNote removes a note from the database', async () => {
    await expect(deleteNote(1)).resolves.not.toThrow();
  });
});
