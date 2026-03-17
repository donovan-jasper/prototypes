import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';

interface SymptomLoggerProps {
  onSave: (data: {
    painLevel: number;
    location: string;
    type: string[];
    mood: string;
    energy: number;
    notes: string;
  }) => void;
  isLoading?: boolean;
}

const LOCATIONS = [
  'Lower Abdomen',
  'Back',
  'Head',
  'Breasts',
  'Legs',
];

const SYMPTOM_TYPES = [
  'Cramping',
  'Sharp',
  'Dull',
  'Aching',
];

const MOODS = [
  { label: 'Happy', emoji: '😊' },
  { label: 'Sad', emoji: '😢' },
  { label: 'Irritable', emoji: '😠' },
  { label: 'Anxious', emoji: '😰' },
];

export default function SymptomLogger({ onSave, isLoading = false }: SymptomLoggerProps) {
  const [painLevel, setPainLevel] = useState(5);
  const [location, setLocation] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const toggleSymptomType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSave = () => {
    const newErrors: string[] = [];

    if (!location) {
      newErrors.push('Please select a pain location');
    }

    if (selectedTypes.length === 0) {
      newErrors.push('Please select at least one symptom type');
    }

    if (!mood) {
      newErrors.push('Please select your mood');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    onSave({
      painLevel,
      location,
      type: selectedTypes,
      mood,
      energy,
      notes,
    });

    setPainLevel(5);
    setLocation('');
    setSelectedTypes([]);
    setMood('');
    setEnergy(3);
    setNotes('');
  };

  return (
    <View style={styles.container}>
      {errors.length > 0 && (
        <View style={styles.errorContainer}>
          {errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>• {error}</Text>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Pain Intensity</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderValue}>{painLevel}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={painLevel}
            onValueChange={setPainLevel}
            minimumTrackTintColor="#8B5CF6"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#8B5CF6"
            testID="pain-slider"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>0 - No pain</Text>
            <Text style={styles.sliderLabelText}>10 - Worst pain</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Pain Location</Text>
        <View style={styles.buttonGrid}>
          {LOCATIONS.map((loc) => (
            <TouchableOpacity
              key={loc}
              style={[
                styles.optionButton,
                location === loc && styles.optionButtonSelected,
              ]}
              onPress={() => setLocation(loc)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  location === loc && styles.optionButtonTextSelected,
                ]}
              >
                {loc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Symptom Type</Text>
        <View style={styles.buttonGrid}>
          {SYMPTOM_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                selectedTypes.includes(type) && styles.optionButtonSelected,
              ]}
              onPress={() => toggleSymptomType(type)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  selectedTypes.includes(type) && styles.optionButtonTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Mood</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m.label}
              style={[
                styles.moodButton,
                mood === m.label && styles.moodButtonSelected,
              ]}
              onPress={() => setMood(m.label)}
            >
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  mood === m.label && styles.moodLabelSelected,
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Energy Level</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderValue}>{energy}</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={energy}
            onValueChange={setEnergy}
            minimumTrackTintColor="#8B5CF6"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#8B5CF6"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>1 - Very low</Text>
            <Text style={styles.sliderLabelText}>5 - Very high</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={4}
          placeholder="Add any additional details..."
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>
          {isLoading ? 'Saving...' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sliderContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sliderValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#6B7280',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionButtonSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  moodButtonSelected: {
    backgroundColor: '#F3E8FF',
    borderColor: '#8B5CF6',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  moodLabelSelected: {
    color: '#8B5CF6',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    marginBottom: 4,
  },
});
