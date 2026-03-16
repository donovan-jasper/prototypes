import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Entry } from '../types';

interface EntryCardProps {
  entry: Entry;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry }) => {
  return (
    <View style={styles.card}>
      {entry.photoUri && <Image source={{ uri: entry.photoUri }} style={styles.photo} />}
      <Text style={styles.note}>{entry.note}</Text>
      <Text style={styles.timestamp}>{new Date(entry.timestamp).toLocaleString()}</Text>
      {entry.weather && (
        <View style={styles.weatherBadge}>
          <Text>{entry.weather}</Text>
          {entry.temperature && <Text>{entry.temperature}°C</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  note: {
    fontSize: 16,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  weatherBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
});

export default EntryCard;
