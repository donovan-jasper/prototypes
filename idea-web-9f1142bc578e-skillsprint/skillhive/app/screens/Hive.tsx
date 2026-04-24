import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Hive: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hive</Text>
      <Text>Join or create skill groups here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Hive;
