import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Divider, List } from 'react-native-paper';

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

      <List.Section>
        {split.participants.map((participant, index) => (
          <List.Item
            key={index}
            title={participant.name}
            description={`Status: ${participant.paymentStatus || 'Pending'}`}
            right={() => <Text variant="bodyLarge">${participant.amount.toFixed(2)}</Text>}
            style={styles.participantItem}
          />
        ))}
      </List.Section>
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
  participantItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  divider: {
    marginVertical: 16,
  },
});
