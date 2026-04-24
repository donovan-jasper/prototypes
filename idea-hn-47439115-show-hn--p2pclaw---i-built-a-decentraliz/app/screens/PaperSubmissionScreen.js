import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { submitPaper, initNetworkMonitoring, checkNetworkStatus, processPendingSubmissions, addNetworkListener } from '../services/network';
import { generateProof, verifyProof } from '../utils/crypto';

const PaperSubmissionScreen = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [proof, setProof] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = initNetworkMonitoring(setIsOnline);
    processPendingSubmissions();

    const networkListener = (online) => {
      setIsOnline(online);
      if (online) {
        setSyncStatus('syncing');
        processPendingSubmissions().then(() => {
          setSyncStatus('idle');
          updatePendingCount();
        });
      }
    };

    addNetworkListener(networkListener);
    updatePendingCount();

    return () => {
      unsubscribe();
      networkListener();
    };
  }, []);

  const updatePendingCount = async () => {
    const pending = await getPendingSubmissions();
    setPendingCount(pending.length);
  };

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
      updatePendingCount();
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

      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: isOnline ? 'green' : 'red' }]}>
          {isOnline ? 'Online' : 'Offline (submissions will be queued)'}
        </Text>
        {pendingCount > 0 && (
          <Text style={styles.pendingText}>
            {pendingCount} pending submission{pendingCount !== 1 ? 's' : ''}
          </Text>
        )}
        {syncStatus === 'syncing' && (
          <View style={styles.syncIndicator}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.syncText}>Syncing pending submissions...</Text>
          </View>
        )}
      </View>
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
  },
  proofContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  proofLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  proofText: {
    color: '#1976d2',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  offlineButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pendingText: {
    color: '#FF9800',
    marginBottom: 5,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  syncText: {
    marginLeft: 10,
    color: '#4CAF50',
  },
});

export default PaperSubmissionScreen;
