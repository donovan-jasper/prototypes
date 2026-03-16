import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const categoryColors = {
  tech: '#4285F4',
  food: '#34A853',
  service: '#EA4335',
  product: '#FBBC05',
};

export default function CategoryBadge({ category }) {
  return (
    <View style={[styles.badge, { backgroundColor: categoryColors[category] }]}>
      <Text style={styles.text}>{category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    padding: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 12,
  },
});
