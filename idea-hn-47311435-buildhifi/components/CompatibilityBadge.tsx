import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const CompatibilityBadge = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case 'compatible':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'incompatible':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'compatible':
        return 'check-circle';
      case 'warning':
        return 'warning';
      case 'incompatible':
        return 'cancel';
      default:
        return 'help';
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() }]}>
      <MaterialIcons name={getIcon()} size={16} color="white" />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  text: {
    color: 'white',
    marginLeft: 4,
  },
});

export default CompatibilityBadge;
