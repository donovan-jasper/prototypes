import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTaskStore } from '../store/taskStore';

export default function NotificationPermissionBanner() {
  const { requestNotificationPermissions } = useTaskStore();

  const handleEnableNotifications = async () => {
    await requestNotificationPermissions();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        Enable notifications to get alerts when your tasks complete!
      </Text>
      <Pressable
        style={styles.button}
        onPress={handleEnableNotifications}
      >
        <Text style={styles.buttonText}>Enable Notifications</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2196F3',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    color: 'white',
    fontSize: 14,
    flex: 1,
    marginRight: 16,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
});
