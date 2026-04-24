import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { submitPaper, initNetworkMonitoring, checkNetworkStatus, processPendingSubmissions } from '../services/network';
import { generateProof, verifyProof } from '../utils/crypto';

const PaperSubmissionScreen = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [proof, setProof] = useState(null);

  useEffect(() => {
    initNetworkMonitoring(setIsOnline);
    processPendingSubmissions();
  }, []);

  const handleGenerateProof = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in all fields before generating proof');
      return;
    }

    const paperData = `${title}\n${content}`;
    const generatedProof = generateProof(paperData);
    setProof(generatedProof);
    Alert.alert('Proof Generated', 'Cryptographic proof has been generated for your paper');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!proof) {
      Alert.alert('Error', 'Please generate a cryptographic proof first');
      return;
    }

    setIsSubmitting(true);

    const paperData = {
      title,
      content,
      proof,
      timestamp: new Date().toISOString()
    };

    const result = await submitPaper(paperData);

    if (result.offline) {
      Alert.alert(
        'Offline Submission',
        'Your paper has been queued for submission when you come back online',
        [{ text: 'OK' }]
      );
    } else if (!result.success) {
      Alert.alert('Error', 'Failed to submit paper. Please try again.');
    } else {
      Alert.alert('Success', 'Paper submitted successfully!');
      setTitle('');
      setContent('');
      setProof(null);
    }

    setIsSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit Research Paper</Text>

      <TextInput
        style={styles.input}
        placeholder="Paper Title"
        value={title}
        onChangeText={setTitle}
        editable={!isSubmitting}
      />

      <TextInput
        style={[styles.input, styles.contentInput]}
        placeholder="Paper Content"
        value={content}
        onChangeText={setContent}
        multiline
        editable={!isSubmitting}
      />

      <TouchableOpacity
        style={styles.proofButton}
        onPress={handleGenerateProof}
        disabled={isSubmitting}
      >
        <Text style={styles.proofButtonText}>Generate Cryptographic Proof</Text>
      </TouchableOpacity>

      {proof && (
        <View style={styles.proofContainer}>
          <Text style={styles.proofLabel}>Proof:</Text>
          <Text style={styles.proofText} numberOfLines={1} ellipsizeMode="middle">
            {proof}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, !isOnline && styles.offlineButton]}
        onPress={handleSubmit}
        disabled={isSubmitting || !proof}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isOnline ? 'Submit Paper' : 'Queue for Offline Submission'}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.statusText, { color: isOnline ? 'green' : 'red' }]}>
        {isOnline ? 'Online' : 'Offline (submissions will be queued)'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contentInput: {
    height: 200,
    textAlignVertical: 'top',
  },
  proofButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  proofButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  proofContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  proofLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  proofText: {
    fontFamily: 'monospace',
    color: '#666',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  offlineButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default PaperSubmissionScreen;
