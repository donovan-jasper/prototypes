import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import SchemaTree from '@/components/SchemaTree';
import { useDatabaseStore } from '@/store/database-store';

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { currentDatabase, fetchSchema } = useDatabaseStore();

  useEffect(() => {
    if (currentDatabase) {
      fetchSchema(currentDatabase.id);
    }
  }, [currentDatabase]);

  if (!currentDatabase) {
    return (
      <View style={styles.container}>
        <Text>No database selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search tables..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <SchemaTree
        schema={currentDatabase.schema}
        searchQuery={searchQuery}
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
    marginBottom: 16,
  },
});

export default ExploreScreen;
