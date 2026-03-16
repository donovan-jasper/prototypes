import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

export default function DatabaseCard({ database }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{database.name}</Title>
        <Paragraph>Rows: {database.rows || 0}</Paragraph>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
});
