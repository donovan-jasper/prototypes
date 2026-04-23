import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CategoryFilterProps {
  selectedCategory?: string;
  onSelectCategory: (category: string | undefined) => void;
}

const categories = [
  { id: 'all', name: 'All', icon: 'category' },
  { id: 'sports', name: 'Sports', icon: 'sports-soccer' },
  { id: 'food', name: 'Food', icon: 'restaurant' },
  { id: 'games', name: 'Games', icon: 'games' },
  { id: 'walks', name: 'Walks', icon: 'directions-walk' },
  { id: 'creative', name: 'Creative', icon: 'palette' },
  { id: 'fitness', name: 'Fitness', icon: 'fitness-center' },
  { id: 'music', name: 'Music', icon: 'music-note' },
  { id: 'learning', name: 'Learning', icon: 'school' },
];

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <View className="bg-white py-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelectCategory(category.id === 'all' ? undefined : category.id)}
            className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
              selectedCategory === category.id || (category.id === 'all' && !selectedCategory)
                ? 'bg-blue-500'
                : 'bg-gray-100'
            }`}
          >
            <MaterialIcons
              name={category.icon}
              size={16}
              color={
                selectedCategory === category.id || (category.id === 'all' && !selectedCategory)
                  ? 'white'
                  : '#4b5563'
              }
              className="mr-1"
            />
            <Text
              className={`text-sm font-medium ${
                selectedCategory === category.id || (category.id === 'all' && !selectedCategory)
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
