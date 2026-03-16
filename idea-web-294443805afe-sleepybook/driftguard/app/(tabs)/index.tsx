import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DriftGuard</Text>
      <Text style={styles.subtitle}>Your sleep safety net</Text>
      <Link href="/monitor" style={styles.link}>Start Monitoring</Link>
      <Link href="/history" style={styles.link}>View History</Link>
      <Link href="/settings" style={styles.link}>Settings</Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
  },
  link: {
    fontSize: 18,
    color: 'blue',
    marginVertical: 10,
  },
});

export default HomeScreen;
