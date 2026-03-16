import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSubscription } from '../hooks/useSubscription';

const SubscriptionGate = ({ children, feature }) => {
  const { isSubscribed, canAccessFeature } = useSubscription();

  if (isSubscribed || canAccessFeature(feature)) {
    return children;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>This feature requires a subscription</Text>
      <TouchableOpacity style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: 'white' }}>Upgrade Now</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SubscriptionGate;
