import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useSubscription } from '../../hooks/useSubscription';

const SettingsScreen = () => {
  const { isPremium, usage, upgrade } = useSubscription();

  return (
    <View style={styles.container}>
      <Text>Subscription Status: {isPremium ? 'Premium' : 'Free'}</Text>
      <Text>Queries used: {usage.queries}/{usage.limit}</Text>
      {!isPremium && (
        <Button mode="contained" onPress={upgrade}>
          Upgrade to Premium
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default SettingsScreen;
