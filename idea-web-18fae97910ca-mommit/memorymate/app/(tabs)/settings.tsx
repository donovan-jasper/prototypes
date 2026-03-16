import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useMemoryStore } from '../../store/memoryStore';

const SettingsScreen = () => {
  const { notificationEnabled, toggleNotification, locationEnabled, toggleLocation } = useMemoryStore();

  return (
    <View style={styles.container}>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Notifications</Text>
        <Switch
          value={notificationEnabled}
          onValueChange={toggleNotification}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Location Services</Text>
        <Switch
          value={locationEnabled}
          onValueChange={toggleLocation}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    fontSize: 16,
  },
});

export default SettingsScreen;
