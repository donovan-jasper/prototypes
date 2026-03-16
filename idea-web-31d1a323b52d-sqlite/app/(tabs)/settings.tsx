import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Subscription Status: Free</Text>
      <Button mode="contained" style={styles.button}>
        Upgrade to Pro
      </Button>
      <Button mode="outlined" style={styles.button}>
        Export All Databases
      </Button>
      <Button mode="outlined" style={styles.button}>
        Delete All Data
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  text: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
});
