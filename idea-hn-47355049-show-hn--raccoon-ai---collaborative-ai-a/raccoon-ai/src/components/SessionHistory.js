import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { openDatabase } from '../utils/sqlite';

const db = openDatabase();

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM sessions ORDER BY created_at DESC',
        [],
        (_, { rows }) => setSessions(rows._array),
        (_, error) => console.log(error)
      );
    });
  }, []);

  return (
    <View>
      <Text>Session History</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Text>{item.created_at}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default SessionHistory;
