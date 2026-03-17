import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';

export default function PaymentSplitView({ split }) {
  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <Text variant="titleLarge">Total:</Text>
        <Text variant="titleLarge">${split.total.toFixed(2)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text variant="titleLarge">Per Person:</Text>
        <Text variant="titleLarge">${split.perPerson.toFixed(2)}</Text>
      </View>
      <Divider style={styles.divider} />
      {split.participants.map((participant, index) => (
        <View key={index} style={styles.participantRow}>
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  divider: {
    marginVertical: 16,
  },
});
