import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('codepilot.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS issues (id TEXT PRIMARY KEY, title TEXT, state TEXT);',
      [],
      () => console.log('Table created successfully'),
      (_, error) => console.error('Error creating table:', error)
    );
  });
};

export const saveIssues = (issues: any[]) => {
  db.transaction(tx => {
    issues.forEach(issue => {
      tx.executeSql(
        'INSERT OR REPLACE INTO issues (id, title, state) VALUES (?, ?, ?);',
        [issue.id, issue.title, issue.state],
        () => console.log('Issue saved successfully'),
        (_, error) => console.error('Error saving issue:', error)
      );
    });
  });
};

export const getIssues = (callback: (issues: any[]) => void) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM issues;',
      [],
      (_, { rows }) => callback(rows._array),
      (_, error) => console.error('Error fetching issues:', error)
    );
  });
};
