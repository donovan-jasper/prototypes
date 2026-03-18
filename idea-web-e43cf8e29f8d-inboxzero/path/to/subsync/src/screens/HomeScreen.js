import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import SubscriptionList from '../components/SubscriptionList';
import { getSubscriptions } from '../services/SubscriptionService';

const HomeScreen = () => {
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    getSubscriptions().then((subscriptions) => setSubscriptions(subscriptions));
  }, []);

  const unsubscribe = (id) => {
    // Call unsubscribe API
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Subsync</Text>
      <SubscriptionList subscriptions={subscriptions} unsubscribe={unsubscribe} />
    </View>
  );
};

export default HomeScreen;
