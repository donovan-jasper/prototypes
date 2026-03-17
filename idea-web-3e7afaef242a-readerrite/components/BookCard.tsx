import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Book } from '../lib/database';

interface BookCardProps {
  book: Book;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function BookCard({ book, onPress, onLongPress }: BookCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.cover}>
        <Text style={styles.coverText}>{book.title.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author}
        </Text>
        <Text style={styles.format}>{book.format.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cover: {
    width: '100%',
    height: 200,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  format: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  }
});
