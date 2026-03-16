import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider as PaperProvider, Text } from 'react-native-paper';
import ConnectionForm from '../../components/ConnectionForm';

export default function SettingsScreen() {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text variant="headlineMedium">Database Connections</Text>
        <ConnectionForm />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
