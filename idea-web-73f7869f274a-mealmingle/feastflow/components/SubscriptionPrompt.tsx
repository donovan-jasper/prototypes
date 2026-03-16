import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function SubscriptionPrompt({ onDismiss }) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Upgrade to Pro</Text>
      <Text variant="bodyLarge">Unlock unlimited group orders, smart cost splitting, and more!</Text>
      <Button
        mode="contained"
        onPress={() => router.push('/subscription/upgrade')}
        style={styles.button}
      >
        Upgrade Now
      </Button>
      <Button
        mode="text"
        onPress={onDismiss}
      >
        Maybe Later
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
});
