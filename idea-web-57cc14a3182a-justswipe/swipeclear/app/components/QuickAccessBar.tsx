import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuickAccessBar = ({ items, onPress }) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.item}
          onPress={() => onPress(item)}
        >
          <Ionicons name={item.icon} size={24} color="#333" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

export default QuickAccessBar;
