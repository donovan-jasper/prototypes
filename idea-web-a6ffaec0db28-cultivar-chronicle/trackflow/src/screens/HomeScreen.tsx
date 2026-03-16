import React from 'react';
import { View, StyleSheet } from 'react-native';
import TimelineView from '../components/TimelineView';
import CategoryPicker from '../components/CategoryPicker';
import { useEntries } from '../hooks/useEntries';
import { useCategories } from '../hooks/useCategories';

const HomeScreen: React.FC = () => {
  const { categories, selectedCategoryId, setSelectedCategoryId } = useCategories();
  const { entries } = useEntries(selectedCategoryId);

  return (
    <View style={styles.container}>
      <CategoryPicker
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <TimelineView entries={entries} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default HomeScreen;
