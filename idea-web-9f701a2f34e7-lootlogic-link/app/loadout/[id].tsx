import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LoadoutEditor = () => {
  return (
    <View style={styles.container}>
      <Text>Loadout Editor</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default LoadoutEditor;
