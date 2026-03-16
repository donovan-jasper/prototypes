import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useStore } from '../../store/useStore';

const SettingsScreen = () => {
  const { user, isOnline } = useStore();

  return (
    <View style={styles.container}>
      <Text>User: {user?.email || 'Guest'}</Text>
      <Text>Status: {isOnline ? 'Online' : 'Offline'}</Text>
      <Button title="Sync Now" onPress={() => {}} />
      <Button title="Manage Subscription" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default SettingsScreen;
