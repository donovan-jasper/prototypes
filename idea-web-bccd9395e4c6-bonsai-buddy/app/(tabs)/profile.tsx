import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useStreak } from '../../hooks/useStreak';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { currentStreak } = useStreak();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">{user.name}</Text>
      <Text variant="bodyLarge">{user.email}</Text>
      <Text variant="bodyMedium" style={styles.stat}>
        Current Streak: {currentStreak} days
      </Text>
      <Button mode="contained" onPress={logout} style={styles.button}>
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  stat: {
    marginTop: 16,
  },
  button: {
    marginTop: 24,
  },
});
