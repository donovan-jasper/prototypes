import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { useSubscription } from '../../hooks/useSubscription';

const SettingsScreen = () => {
  const { isDarkMode, toggleDarkMode, subscriptionTier, isSubscribed } = useSubscription();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Settings</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 18 }}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18 }}>Subscription Tier: {subscriptionTier}</Text>
        {!isSubscribed && (
          <TouchableOpacity style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginTop: 8 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Upgrade Subscription</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SettingsScreen;
