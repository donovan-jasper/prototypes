import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SleepCue</Text>
      <Text style={styles.subtitle}>Never lose your place or drain your battery</Text>
      <Button title="Start Sleep Detection" onPress={() => {}} />
      <Link href="/timer" style={styles.link}>Go to Timer</Link>
      <Link href="/insights" style={styles.link}>Sleep Insights</Link>
      <Link href="/settings" style={styles.link}>Settings</Link>
    </View>
  );
}

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
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    fontSize: 16,
    color: 'blue',
  },
});
