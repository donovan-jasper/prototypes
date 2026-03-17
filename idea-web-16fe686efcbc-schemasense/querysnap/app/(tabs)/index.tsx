import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { FAB } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import DatabaseCard from '../../components/DatabaseCard';
import { useDatabase } from '../../hooks/useDatabase';

const IndexScreen = () => {
  const { databases, addDatabase } = useDatabase();

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.sqlite3', 'application/x-sqlite3'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      await addDatabase(file);
    } catch (error) {
      console.error('Error importing database:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={databases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DatabaseCard database={item} />}
        ListEmptyComponent={<Text>No databases imported yet</Text>}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleImport}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default IndexScreen;
