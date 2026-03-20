import React, { useState, useEffect } from 'react';
import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('callguard.db');

const storage = {
  saveCallData: (callData) => {
    // Save the call data to the database
    db.transaction((tx) => {
      tx.executeSql(`
        INSERT INTO calls (caller_id, call_time, transcript, summary)
        VALUES (?, ?, ?, ?);
      `, [callData.callerId, callData.callTime, callData.transcript, callData.summary]);
    });
  },
};

export default storage;
