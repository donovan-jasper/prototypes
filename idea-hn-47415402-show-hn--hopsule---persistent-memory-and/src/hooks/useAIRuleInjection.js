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
  const [error, setError] = useState(null);

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
          console.error('Database error:', error);
          setError('Failed to initialize database');
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
          setError(null);
        },
        (_, error) => {
          console.error('Error loading rules:', error);
          setError('Failed to load rules');
          setIsLoading(false);
        }
      );
    });
  };

  const addRule = (rule) => {
    if (!rule.name || !rule.pattern) {
      setError('Rule name and pattern are required');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO rules (id, name, pattern, severity) VALUES (?, ?, ?, ?);',
        [
          Date.now().toString(),
          rule.name,
          rule.pattern,
          rule.severity || 'warning'
        ],
        () => {
          loadRules();
          setError(null);
        },
        (_, error) => {
          console.error('Error adding rule:', error);
          setError('Failed to add rule');
        }
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
          setError(null);
        },
        (_, error) => {
          console.error('Error removing rule:', error);
          setError('Failed to remove rule');
        }
      );
    });
  };

  const checkCode = (code, rule) => {
    return validateRule(code, rule);
  };

  const injectRulesIntoAISuggestion = (codeSuggestion) => {
    if (!codeSuggestion || !rules.length) return codeSuggestion;

    let modifiedSuggestion = codeSuggestion;

    rules.forEach(rule => {
      try {
        const regex = new RegExp(rule.pattern, 'g');
        const matches = modifiedSuggestion.match(regex);

        if (matches) {
          modifiedSuggestion = modifiedSuggestion.replace(
            regex,
            match => `/* RULE VIOLATION: ${rule.name} (${rule.severity}) */ ${match}`
          );
        }
      } catch (error) {
        console.error(`Error processing rule ${rule.name}:`, error);
      }
    });

    return modifiedSuggestion;
  };

  return {
    rules,
    isLoading,
    error,
    addRule,
    removeRule,
    checkCode,
    injectRulesIntoAISuggestion
  };
};

export default useAIRuleInjection;
