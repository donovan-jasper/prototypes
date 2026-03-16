import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Library from '../components/Library';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PageTurner Pro</Text>
      <Library />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
  },
});

export default HomeScreen;
