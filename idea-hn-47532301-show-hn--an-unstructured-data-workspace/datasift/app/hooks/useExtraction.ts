import { useState } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('datasift.db');

const useExtraction = () => {
  const [data, setData] = useState(null);

  const extractData = async (text) => {
    // Call LLM API here
    const result = { entities: [{ type: 'email', value: 'john@example.com' }] };
    setData(result);

    // Save to SQLite
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO extractions (text, result) VALUES (?, ?)',
        [text, JSON.stringify(result)],
        (_, result) => console.log('Data saved', result),
        (_, error) => console.log('Error saving data', error)
      );
    });
  };

  return { data, extractData };
};

export default useExtraction;
