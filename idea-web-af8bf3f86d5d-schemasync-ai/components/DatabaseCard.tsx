import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';

interface DatabaseCardProps {
  database: {
    id: string;
    name: string;
    type: string;
    lastSync?: Date;
  };
  onPress: (id: string) => void;
}

export default function DatabaseCard({ database, onPress }: DatabaseCardProps) {
  return (
    <TouchableOpacity onPress={() => onPress(database.id)} testID="database-card">
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.name}>{database.name}</Text>
            <Text style={styles.type}>{database.type}</Text>
          </View>
          {database.lastSync && (
            <Text style={styles.lastSync}>
              Last synced: {formatDistanceToNow(database.lastSync, { addSuffix: true })}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  type: {
    fontSize: 14,
    color: '#666',
  },
  lastSync: {
    fontSize: 12,
    color: '#666',
  },
});
