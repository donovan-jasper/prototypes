import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTaskStore } from '../store/taskStore';

export default function NotificationPermissionBanner() {
  const { checkNotificationPermissions, requestNotificationPermissions } = useTaskStore();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermission = await checkNotificationPermissions();
      setShowBanner(!hasPermission);
    };

    checkPermissions();
  }, []);

  const handleRequestPermission = async () => {
    await requestNotificationPermissions();
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.message}>
        Enable notifications to get alerts when your tasks complete!
      </Text>
      <Pressable style={styles.button} onPress={handleRequestPermission}>
        <Text style={styles.buttonText}>Allow Notifications</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
