import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categories } from '../constants/Categories';

const CategoryPicker = ({ selectedCategory, onSelectCategory }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.name}
          style={[
            styles.categoryButton,
            selectedCategory === category.name && styles.selectedCategory,
          ]}
          onPress={() => onSelectCategory(category.name)}
        >
          <Ionicons name={category.icon} size={24} color={selectedCategory === category.name ? '#FFFFFF' : category.color} />
          <Text style={[styles.categoryText, selectedCategory === category.name && styles.selectedCategoryText]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  categoryButton: {
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    marginTop: 4,
    color: '#000000',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
});

export default CategoryPicker;
