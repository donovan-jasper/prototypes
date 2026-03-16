import React from 'react';
import { View, StyleSheet, Switch, Text } from 'react-native';
import { useAppStore } from '../../store/useAppStore';

const SettingsScreen = () => {
  const { notificationsEnabled, toggleNotifications } = useAppStore();

  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
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
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default SettingsScreen;
