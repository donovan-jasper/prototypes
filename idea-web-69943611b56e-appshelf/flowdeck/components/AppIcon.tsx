import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';

const AppIcon = ({ app }) => {
  const handlePress = () => {
    Linking.openURL(`intent://${app.packageName}#Intent;package=${app.packageName};end`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: app.icon }} style={styles.icon} />
      <Text style={styles.label}>{app.label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 8,
    width: 80,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  label: {
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AppIcon;
