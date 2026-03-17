import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../src/context/AppContext';
import { useDatabase } from '../../src/hooks/useDatabase';

export default function CreateMomentScreen() {
  const router = useRouter();
  const { isPremium } = useAppContext();
  const db = useDatabase();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [script, setScript] = useState('');
  const [category, setCategory] = useState('Calm');
  const [isRecording, setIsRecording] = useState(false);
  const [audioPath, setAudioPath] = useState('');

  const handleCreateMoment = async () => {
    if (!title || !script) {
      Alert.alert('Error', 'Please provide at least a title and script');
      return;
    }

    try {
      const newMoment = {
        id: Date.now().toString(),
        title,
        description,
        script,
        category,
        duration: Math.ceil(script.split(' ').length / 200 * 60), // Estimate duration
        audioPath: isRecording ? audioPath : undefined,
        isPremium: true, // Custom moments are always premium
        isCustom: true,
      };

      await db.createCustomMoment(newMoment);
      Alert.alert('Success', 'Your custom moment has been created!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create moment. Please try again.');
    }
  };

  const handleRecordAudio = () => {
    // In a real app, this would integrate with audio recording functionality
    Alert.alert('Recording', 'Audio recording would be implemented here');
    setIsRecording(true);
    setAudioPath(`custom_${Date.now()}.mp3`);
  };

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Create Your Own Moment</Text>
        <Text style={styles.message}>
          This feature is available to Premium members only.
        </Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => router.push('/premium')}
        >
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Your Own Moment</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Give your moment a title"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Briefly describe what this moment is about"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Script</Text>
        <TextInput
          style={[styles.input, styles.multilineInput, styles.scriptInput]}
          value={script}
          onChangeText={setScript}
          placeholder="Write the script for your moment. Keep it concise and engaging."
          multiline
          numberOfLines={10}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {['Calm', 'Focus', 'Energy', 'Perspective', 'Gratitude'].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.selectedCategory
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                category === cat && styles.selectedCategoryText
              ]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Audio Recording</Text>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={handleRecordAudio}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Recording...' : 'Record Audio'}
          </Text>
        </TouchableOpacity>
        {isRecording && (
          <Text style={styles.audioStatus}>Audio will be saved with your moment</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateMoment}
      >
        <Text style={styles.createButtonText}>Create Moment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  upgradeButton: {
    backgroundColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  scriptInput: {
    minHeight: 200,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  categoryText: {
    color: '#666',
  },
  selectedCategoryText: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  recordButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  audioStatus: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
