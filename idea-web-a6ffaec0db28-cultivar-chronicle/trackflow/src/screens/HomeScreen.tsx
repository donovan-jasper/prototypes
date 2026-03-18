import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TimelineView from '../components/TimelineView';
import CategoryPicker from '../components/CategoryPicker';
import { useEntries } from '../hooks/useEntries';
import { useCategories } from '../hooks/useCategories';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { categories, selectedCategoryId, setSelectedCategoryId } = useCategories();
  const { entries, refreshEntries } = useEntries(selectedCategoryId);

  const handleAddEntry = () => {
    navigation.navigate('AddEntry');
  };

  return (
    <View style={styles.container}>
      <CategoryPicker
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <TimelineView entries={entries} onRefresh={refreshEntries} />
      <TouchableOpacity style={styles.fab} onPress={handleAddEntry}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
