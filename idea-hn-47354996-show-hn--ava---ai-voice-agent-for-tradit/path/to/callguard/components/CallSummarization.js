import React, { useState, useEffect } from 'react';
import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('callguard.db');

const CallSummarization = {
  getCallSummary: () => {
    // Get the call summary from the database
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(`
          SELECT * FROM calls;
        `), [], (tx, results) => {
          const calls = [];
          for (let i = 0; i < results.rows.length; i++) {
            calls.push(results.rows.item(i));
          }
          resolve(calls);
        };
      });
    });
  },
};

export default CallSummarization;
