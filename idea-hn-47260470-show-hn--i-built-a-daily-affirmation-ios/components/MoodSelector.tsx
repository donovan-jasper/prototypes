import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import * as Haptics from 'expo-haptics';

const MoodSelector = () => {
  const setMoodRating = useStore((state) => state.setMoodRating);

  const moods = [
    { emoji: '😔', rating: 1, label: 'Low' },
    { emoji: '😐', rating: 2, label: 'Neutral' },
    { emoji: '😊', rating: 3, label: 'Good' },
    { emoji: '🔥', rating: 4, label: 'Great' },
  ];

  const handleMoodSelect = async (rating: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMoodRating(rating);
  };

  return (
    <View style={styles.container}>
      {moods.map((mood) => (
        <TouchableOpacity
          key={mood.rating}
          style={styles.moodButton}
          onPress={() => handleMoodSelect(mood.rating)}
        >
          <Text style={styles.emoji}>{mood.emoji}</Text>
          <Text style={styles.label}>{mood.label}</Text>
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
  moodButton: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default MoodSelector;
