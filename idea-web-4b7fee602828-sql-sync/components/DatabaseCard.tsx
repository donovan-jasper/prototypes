import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

const DatabaseCard = ({ database }) => {
  return (
    <Link href={`/database/${database.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <Text style={styles.title}>{database.name}</Text>
        <Text style={styles.count}>{database.rowCount} rows</Text>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
});

export default DatabaseCard;
