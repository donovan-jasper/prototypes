import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Title } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';

const LibraryScreen = () => {
  const [builds, setBuilds] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadBuilds = async () => {
      const db = await SQLite.openDatabaseAsync('audiochain.db');
      const result = await db.getAllAsync('SELECT * FROM builds');
      setBuilds(result);
    };
    loadBuilds();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => router.push(`/build/${item.id}`)}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.name}</Title>
          <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={builds}
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
  card: {
    marginBottom: 16,
  },
});

export default LibraryScreen;
