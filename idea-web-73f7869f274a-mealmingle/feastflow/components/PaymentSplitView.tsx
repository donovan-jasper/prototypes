import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';

export default function PaymentSplitView({ split }) {
  return (
    <View style={styles.container}>
      <Text variant="titleLarge">Total: ${split.total.toFixed(2)}</Text>
      <Text variant="titleLarge">Per Person: ${split.perPerson.toFixed(2)}</Text>
      <Divider style={styles.divider} />
      {split.participants.map((participant, index) => (
        <View key={index} style={styles.participant}>
          <Text variant="bodyLarge">{participant.name}</Text>
          <Text variant="bodyLarge">${participant.amount.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  participant: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
});
