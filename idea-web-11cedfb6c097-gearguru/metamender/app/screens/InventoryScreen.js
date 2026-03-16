import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import InventoryItem from '../components/InventoryItem';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('metamender.db');

const InventoryScreen = () => {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, attack INTEGER, defense INTEGER);'
      );
      tx.executeSql(
        'SELECT * FROM inventory;',
        [],
        (_, { rows: { _array } }) => setInventory(_array)
      );
    });
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <InventoryItem item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default InventoryScreen;
