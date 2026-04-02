import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ToolIntegration from '../components/ToolIntegration';

const ToolIntegrationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tool Integrations</Text>
      <ToolIntegration />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});

export default ToolIntegrationScreen;
