import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFileStore } from '../../store/files';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { files, deleteFile } = useFileStore();

  const handleImport = () => {
    navigation.navigate('Import');
  };

  const handleFilePress = (id) => {
    navigation.navigate('Query', { id });
  };

  const handleDelete = (id) => {
    deleteFile(id);
  };

  return (
    <View style={styles.container}>
      <Button title="Import CSV" onPress={handleImport} />
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.fileItem}>
            <Text>{item.name}</Text>
            <Text>{item.size} bytes</Text>
            <Text>{item.rowCount} rows</Text>
            <Button title="Open" onPress={() => handleFilePress(item.id)} />
            <Button title="Delete" onPress={() => handleDelete(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  fileItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default HomeScreen;
