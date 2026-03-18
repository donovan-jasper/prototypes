import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

const Library = () => {
  const [content, setContent] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  const loadContent = useCallback(async () => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadContent();
    }, [loadContent])
  );

  const handlePress = (id: number) => {
    navigation.navigate('Reader', { contentId: id });
  };

  return (
    <View style={styles.container}>
      {content.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No content yet</Text>
          <Text style={styles.emptySubtext}>Download content from the Discover tab</Text>
        </View>
      ) : (
        <FlatList
          data={content}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePress(item.id)}>
              <Text style={styles.item}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default Library;
