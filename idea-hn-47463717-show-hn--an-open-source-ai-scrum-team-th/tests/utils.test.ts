import { initDB, saveIssues, getIssues } from '../src/utils/sqliteHelper';

jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn().mockReturnValue({
    transaction: jest.fn((callback) => callback({
      executeSql: jest.fn((sql, params, success, error) => {
        if (sql.includes('CREATE TABLE')) {
          success();
        } else if (sql.includes('INSERT OR REPLACE')) {
          success();
        } else if (sql.includes('SELECT *')) {
          success(null, { rows: { _array: [{ id: '1', title: 'Issue 1', state: 'open' }] } });
        }
      })),
    })),
  }),
}));

test('initializes database', () => {
  initDB();
});

test('saves issues to database', () => {
  const issues = [{ id: '1', title: 'Issue 1', state: 'open' }];
  saveIssues(issues);
});

test('fetches issues from database', () => {
  const callback = jest.fn();
  getIssues(callback);
  expect(callback).toHaveBeenCalledWith([{ id: '1', title: 'Issue 1', state: 'open' }]);
});
