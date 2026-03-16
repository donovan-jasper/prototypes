import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CloudBadge = ({ service, style }) => {
  const getIcon = () => {
    switch (service) {
      case 'dropbox':
        return 'logo-dropbox';
      case 'google':
        return 'logo-google';
      case 'icloud':
        return 'logo-apple';
      default:
        return 'cloud';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Ionicons name={getIcon()} size={16} color="#fff" />
      <Text style={styles.text}>{service}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 5,
  },
  text: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 12,
  },
});

export default CloudBadge;
