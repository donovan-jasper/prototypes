import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SchemaViewer from '../../components/SchemaViewer';
import { useDatabase } from '../../hooks/useDatabase';

const DatabaseScreen = ({ route }) => {
  const { id } = route.params;
  const { getDatabase } = useDatabase();
  const database = getDatabase(id);

  if (!database) {
    return <Text>Database not found</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{database.name}</Text>
      <SchemaViewer schema={database.schema} />
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
