import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const handleLogout = () => {
    // Implement actual logout logic here (clear tokens, state, etc.)
    console.log('Logging out...');
    router.replace('/login'); // Redirect to login screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>User Profile</Text>
        <Text style={styles.settingValue}>current-user@example.com</Text>
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>App Version</Text>
        <Text style={styles.settingValue}>1.0.0</Text>
      </View>
      <Button title="Logout" onPress={handleLogout} color="#FF3B30" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
});
