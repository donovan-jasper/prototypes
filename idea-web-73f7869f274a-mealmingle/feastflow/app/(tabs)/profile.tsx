import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../contexts/AuthContext';
import { SubscriptionContext } from '../../contexts/SubscriptionContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { subscription, fetchSubscription } = useContext(SubscriptionContext);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    setIsPro(subscription?.isPro || false);
  }, [subscription]);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Profile</Text>
      <Text variant="bodyLarge" style={styles.info}>Name: {user?.name || 'Guest'}</Text>
      <Text variant="bodyLarge" style={styles.info}>Phone: {user?.phone || 'Not provided'}</Text>
      <Text variant="bodyLarge" style={styles.info}>Subscription: {isPro ? 'Pro' : 'Free'}</Text>
      <Button
        mode="contained"
        onPress={() => router.push('/payment/setup')}
        style={styles.button}
      >
        Add Payment Method
      </Button>
      {!isPro && (
        <Button
          mode="outlined"
          onPress={() => router.push('/subscription/upgrade')}
          style={styles.button}
        >
          Upgrade to Pro
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  info: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
});
