import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStore } from '../../store/useStore';
import { queryRows } from '../../lib/db';

const DatabaseScreen = () => {
  const { id } = useLocalSearchParams();
  const { databases } = useStore();
  const [rows, setRows] = useState([]);
  const database = databases.find(db => db.id === id);

  useEffect(() => {
    const fetchRows = async () => {
      const results = await queryRows(id, 'SELECT * FROM rows');
      setRows(results);
    };
    fetchRows();
  }, [id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{database?.name}</Text>
      <FlatList
        data={rows}
        renderItem={({ item }) => <Text>{JSON.stringify(item)}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default DatabaseScreen;
