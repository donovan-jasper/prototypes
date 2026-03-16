import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';

const DiscoverScreen = () => {
  const [components, setComponents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadComponents = async () => {
      const db = await SQLite.openDatabaseAsync('audiochain.db');
      const result = await db.getAllAsync(
        'SELECT * FROM components WHERE name LIKE ?',
        [`%${searchQuery}%`]
      );
      setComponents(result);
    };
    loadComponents();
  }, [searchQuery]);

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.brand}</Paragraph>
        <Paragraph>${item.price}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => console.log('Add to build')}>Add to Build</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for components..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={components}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  card: {
    marginBottom: 16,
  },
});

export default DiscoverScreen;
