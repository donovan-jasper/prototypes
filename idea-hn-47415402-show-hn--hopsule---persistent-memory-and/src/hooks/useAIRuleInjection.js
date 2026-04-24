import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('rules.db');

export const validateRule = (code, rule) => {
  const regex = new RegExp(rule.pattern);
  return !regex.test(code);
};

const useAIRuleInjection = () => {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS rules (id TEXT PRIMARY KEY, name TEXT, pattern TEXT, severity TEXT);',
        [],
        () => {
          loadRules();
        },
        (_, error) => {
          console.log('Database error:', error);
          setIsLoading(false);
        }
      );
    });
  };

  const loadRules = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM rules;',
        [],
        (_, { rows: { _array } }) => {
          setRules(_array);
          setIsLoading(false);
        },
        (_, error) => {
          console.log('Error loading rules:', error);
          setIsLoading(false);
        }
      );
    });
  };

  const addRule = (rule) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO rules (id, name, pattern, severity) VALUES (?, ?, ?, ?);',
        [Date.now().toString(), rule.name, rule.pattern, rule.severity || 'warning'],
        () => {
          loadRules();
        },
        (_, error) => console.log('Error adding rule:', error)
      );
    });
  };

  const removeRule = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM rules WHERE id = ?;',
        [id],
        () => {
          loadRules();
        },
        (_, error) => console.log('Error removing rule:', error)
      );
    });
  };

  const checkCode = (code, rule) => {
    return validateRule(code, rule);
  };

  return { rules, isLoading, addRule, removeRule, checkCode };
};

export default useAIRuleInjection;
