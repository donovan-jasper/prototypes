import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuickAccessBar = ({ items, onItemPress }) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <TouchableOpacity key={index} style={styles.item} onPress={() => onItemPress(item)}>
          {item.icon && <Ionicons name={item.icon} size={24} color="#4285f4" />}
          <Text style={styles.itemText}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  item: {
    alignItems: 'center',
    padding: 8,
  },
  itemText: {
    marginTop: 4,
    fontSize: 12,
    color: '#4285f4',
    fontWeight: '500',
  },
});

export default QuickAccessBar;
