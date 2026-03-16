import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Category } from '../types';

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId: number;
  onSelectCategory: (categoryId: number) => void;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({ categories, selectedCategoryId, onSelectCategory }) => {
  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.category,
            selectedCategoryId === category.id && styles.selectedCategory,
          ]}
          onPress={() => onSelectCategory(category.id)}
        >
          <Text style={styles.categoryText}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
  },
  category: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#333',
  },
});

export default CategoryPicker;
