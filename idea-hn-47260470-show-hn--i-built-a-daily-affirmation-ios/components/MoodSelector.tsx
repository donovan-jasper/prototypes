import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';

const MoodSelector = () => {
  const setMoodRating = useStore((state) => state.setMoodRating);

  const moods = [
    { emoji: '😔', rating: 1 },
    { emoji: '😐', rating: 2 },
    { emoji: '😊', rating: 3 },
    { emoji: '🔥', rating: 4 },
  ];

  return (
    <View style={styles.container}>
      {moods.map((mood) => (
        <TouchableOpacity key={mood.rating} onPress={() => setMoodRating(mood.rating)}>
          <Text style={styles.emoji}>{mood.emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 24,
  },
});

export default MoodSelector;
