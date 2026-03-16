import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Aurora AI</Text>
        <Text style={styles.subtitle}>Build, evolve, and optimize your applications with AI</Text>
      </View>
      
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Core Features</Text>
        
        <Button 
          title="Application Builder" 
          onPress={() => navigation.navigate('Application')} 
        />
        
        <Button 
          title="Schema Evolution" 
          onPress={() => navigation.navigate('SchemaEvolution')} 
        />
        
        <Button 
          title="Deterministic Execution" 
          onPress={() => navigation.navigate('DeterministicExecution')} 
        />
        
        <Button 
          title="Collaboration" 
          onPress={() => navigation.navigate('Collaboration')} 
        />
        
        <Button 
          title="Analytics" 
          onPress={() => navigation.navigate('Analytics')} 
        />
        
        <Button 
          title="Settings" 
          onPress={() => navigation.navigate('Settings')} 
        />
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Aurora AI helps you revolutionize your workflow with AI-native SaaS architecture, 
          stabilizing long-lived applications and streamlining schema changes.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  featuresSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoSection: {
    padding: 20,
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#333',
  },
});

export default HomeScreen;
