import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { queryTemplates } from '../constants/query-templates';

const TemplateLibrary = () => {
  const navigation = useNavigation();

  const handleTemplatePress = (template) => {
    navigation.navigate('Query', { sql: template.sql });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={queryTemplates}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.templateItem}>
            <Text>{item.name}</Text>
            <Text>{item.description}</Text>
            <Button title="Use Template" onPress={() => handleTemplatePress(item)} />
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
  templateItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default TemplateLibrary;
