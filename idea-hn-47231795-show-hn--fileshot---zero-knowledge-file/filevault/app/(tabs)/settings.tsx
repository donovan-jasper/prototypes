import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Switch, Card } from 'react-native-paper';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors } from '@/constants/Colors';

export default function SettingsScreen() {
  const { isPremium, upgradeToPremium, biometricLock, toggleBiometricLock } = useSubscription();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Account" />
        <Card.Content>
          <View style={styles.row}>
            <Text>Current Plan: {isPremium ? 'Premium' : 'Free'}</Text>
            {!isPremium && (
              <Button mode="contained" onPress={upgradeToPremium}>
                Upgrade to Premium
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Security" />
        <Card.Content>
          <View style={styles.row}>
            <Text>Biometric Lock</Text>
            <Switch
              value={biometricLock}
              onValueChange={toggleBiometricLock}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Storage" />
        <Card.Content>
          <Text>Clear Vault</Text>
          <Button mode="outlined" style={styles.button}>
            Clear All Files
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  card: {
    margin: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
  },
});
