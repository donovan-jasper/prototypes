import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to RaccoonAI!</Text>
      <Text style={styles.subtitle}>Your collaborative AI agent for anything.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ToolIntegration')}
      >
        <Text style={styles.buttonText}>Manage Tool Integrations</Text>
      </TouchableOpacity>

      {/* Placeholder for other features */}
      <View style={styles.featureSection}>
        <Text style={styles.featureText}>Conversational Interface (Coming Soon)</Text>
        <Text style={styles.featureText}>Task Chaining (Coming Soon)</Text>
        <Text style={styles.featureText}>Contextual Understanding (Coming Soon)</Text>
        <Text style={styles.featureText}>Session History (Coming Soon)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  featureSection: {
    marginTop: 30,
    alignItems: 'flex-start',
    width: '80%',
  },
  featureText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    fontStyle: 'italic',
  },
});

export default HomeScreen;
