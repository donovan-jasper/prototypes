import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Entry } from '../types';

interface PhotoComparisonProps {
  beforeEntry: Entry;
  afterEntry: Entry;
}

const PhotoComparison: React.FC<PhotoComparisonProps> = ({ beforeEntry, afterEntry }) => {
  return (
    <View style={styles.container}>
      <View style={styles.photoContainer}>
        <Image source={{ uri: beforeEntry.photoUri || '' }} style={styles.photo} />
        <Text style={styles.date}>{new Date(beforeEntry.timestamp).toLocaleDateString()}</Text>
      </View>
      <View style={styles.photoContainer}>
        <Image source={{ uri: afterEntry.photoUri || '' }} style={styles.photo} />
        <Text style={styles.date}>{new Date(afterEntry.timestamp).toLocaleDateString()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  photoContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  date: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
});

export default PhotoComparison;
