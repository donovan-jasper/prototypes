import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTaskStore } from '../store/taskStore';
import * as Notifications from 'expo-notifications';

export default function NotificationPermissionBanner() {
  const { checkNotificationPermissions, requestNotificationPermissions } = useTaskStore();
  const [showBanner, setShowBanner] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus>('undetermined');

  useEffect(() => {
    const checkPermissions = async () => {
      const status = await checkNotificationPermissions();
      setPermissionStatus(status ? 'granted' : 'denied');
      setShowBanner(!status);
    };

    checkPermissions();
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionStatus(granted ? 'granted' : 'denied');
    setShowBanner(!granted);
  };

  if (!showBanner) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.message}>
        Enable notifications to get alerts when your tasks complete!
      </Text>
      <Pressable
        style={styles.button}
        onPress={handleRequestPermission}
      >
        <Text style={styles.buttonText}>Enable Notifications</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
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
