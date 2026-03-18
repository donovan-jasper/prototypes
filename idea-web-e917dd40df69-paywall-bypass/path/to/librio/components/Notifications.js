import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { fetchNotifications } from '../services/Api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications().then(data => setNotifications(data));
  }, []);

  return (
    <View>
      {notifications.map(notification => (
        <View key={notification.id}>
          <Text>{notification.title}</Text>
          <Text>{notification.message}</Text>
        </View>
      ))}
    </View>
  );
};

export default Notifications;
