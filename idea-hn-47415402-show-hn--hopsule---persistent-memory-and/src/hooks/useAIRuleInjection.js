import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('rules.db');

export const validateRule = (code, rule) => {
  const regex = new RegExp(rule.pattern);
  return !regex.test(code);
};

const useAIRuleInjection = () => {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS rules (id TEXT PRIMARY KEY, name TEXT, pattern TEXT);',
        [],
        () => {
          tx.executeSql(
            'SELECT * FROM rules;',
            [],
            (_, { rows: { _array } }) => setRules(_array),
            (_, error) => console.log(error)
          );
        },
        (_, error) => console.log(error)
      );
    });
  }, []);

  const addRule = (rule) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO rules (id, name, pattern) VALUES (?, ?, ?);',
        [Date.now().toString(), rule.name, rule.pattern],
        () => {
          setRules([...rules, rule]);
        },
        (_, error) => console.log(error)
      );
    });
  };

  const checkCode = (code) => {
    return rules.every(rule => validateRule(code, rule));
  };

  return { rules, addRule, checkCode };
};

export default useAIRuleInjection;
