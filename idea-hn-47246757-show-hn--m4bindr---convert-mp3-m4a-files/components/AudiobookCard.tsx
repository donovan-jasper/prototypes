import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const AudiobookCard = ({ audiobook, onPress }) => {
  const progress = audiobook.currentPosition
    ? (audiobook.currentPosition / audiobook.duration) * 100
    : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.coverContainer}>
        {audiobook.coverArt ? (
          <Image source={{ uri: audiobook.coverArt }} style={styles.cover} />
        ) : (
          <View style={styles.placeholderCover} />
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {audiobook.title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {audiobook.author}
      </Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coverContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginHorizontal: 10,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
    marginHorizontal: 10,
    marginBottom: 5,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 10,
    marginBottom: 10,
  },
});

export default AudiobookCard;
