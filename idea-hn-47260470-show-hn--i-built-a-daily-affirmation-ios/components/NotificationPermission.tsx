import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

const NotificationPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  if (hasPermission) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Enable notifications to get daily affirmations</Text>
      <Button title="Enable Notifications" onPress={requestPermission} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  text: {
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default NotificationPermission;
