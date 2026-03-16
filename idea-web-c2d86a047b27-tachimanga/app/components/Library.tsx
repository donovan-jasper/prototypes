import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

const Library = () => {
  const [content, setContent] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadContent = async () => {
      const db = await SQLite.openDatabaseAsync('pageturner.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS content (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          title TEXT, 
          text TEXT
        );
      `);
      const result = await db.getAllAsync('SELECT * FROM content;');
      setContent(result);
    };
    loadContent();
  }, []);

  const handlePress = (id: number) => {
    navigation.navigate('Reader', { contentId: id });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={content}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item.id)}>
            <Text style={styles.item}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  item: {
    padding: 20,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Library;
