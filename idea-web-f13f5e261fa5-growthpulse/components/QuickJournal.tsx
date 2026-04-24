import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const QuickJournal = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Journal</Text>
      <Text style={styles.subtitle}>Record your mood and reflections</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default QuickJournal;
