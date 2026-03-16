import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<'struggling' | 'neutral' | 'crushing'>('neutral');

  const handleMoodSelect = (mood: 'struggling' | 'neutral' | 'crushing') => {
    setSelectedMood(mood);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            selectedMood === 'struggling' && styles.selectedButton,
          ]}
          onPress={() => handleMoodSelect('struggling')}
        >
          <Ionicons
            name="sad-outline"
            size={24}
            color={selectedMood === 'struggling' ? '#fff' : '#673ab7'}
          />
          <Text
            style={[
              styles.buttonText,
              selectedMood === 'struggling' && styles.selectedButtonText,
            ]}
          >
            Struggling
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            selectedMood === 'neutral' && styles.selectedButton,
          ]}
          onPress={() => handleMoodSelect('neutral')}
        >
          <Ionicons
            name="happy-outline"
            size={24}
            color={selectedMood === 'neutral' ? '#fff' : '#673ab7'}
          />
          <Text
            style={[
              styles.buttonText,
              selectedMood === 'neutral' && styles.selectedButtonText,
            ]}
          >
            Neutral
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            selectedMood === 'crushing' && styles.selectedButton,
          ]}
          onPress={() => handleMoodSelect('crushing')}
        >
          <Ionicons
            name="flame-outline"
            size={24}
            color={selectedMood === 'crushing' ? '#fff' : '#673ab7'}
          />
          <Text
            style={[
              styles.buttonText,
              selectedMood === 'crushing' && styles.selectedButtonText,
            ]}
          >
            Crushing it!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  selectedButton: {
    backgroundColor: '#673ab7',
  },
  buttonText: {
    marginLeft: 4,
    color: '#673ab7',
  },
  selectedButtonText: {
    color: '#fff',
  },
});
