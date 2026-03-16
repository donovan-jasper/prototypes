import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function SnapshotCard({ snapshot }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{snapshot.name}</Text>
        <Text variant="bodyMedium">Source: {snapshot.source_connection}</Text>
        <Text variant="bodyMedium">Rows: {snapshot.row_count}</Text>
        <Text variant="bodyMedium">
          Created: {new Date(snapshot.created_at).toLocaleString()}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
});
