import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const NewQuestion = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Anonymous');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'questions'), {
        title: title.trim(),
        content: content.trim(),
        author: author.trim() || 'Anonymous',
        upvotes: 0,
        isAnswered: false,
        createdAt: serverTimestamp(),
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting question:', error);
      Alert.alert('Error', 'Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ask a Question</Text>

      <TextInput
        style={styles.input}
        placeholder="Question Title"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />

      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Question Details"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
        maxLength={500}
      />

      <TextInput
        style={styles.input}
        placeholder="Your Name (optional)"
        value={author}
        onChangeText={setAuthor}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Submitting...' : 'Submit Question'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  multilineInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewQuestion;
