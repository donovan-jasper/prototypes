import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as tf from '@tensorflow/tfjs';
import { loadLayersModel } from '@tensorflow/tfjs-react-native';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('authentichat.db');

const InstantPasteAnalysisScreen = () => {
  const [text, setText] = useState('');
  const [authenticityScore, setAuthenticityScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<any>(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Initialize database
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS analyses (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, score REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);'
      );
    });

    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await loadLayersModel('https://example.com/model.json');
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading model:', error);
        Alert.alert('Error', 'Failed to load AI model. Please check your connection.');
      }
    };

    loadModel();
  }, []);

  const pasteFromClipboard = async () => {
    const clipboardText = await Clipboard.getStringAsync();
    if (clipboardText) {
      setText(clipboardText);
    } else {
      Alert.alert('Clipboard Empty', 'No text found in clipboard');
    }
  };

  const analyzeText = async () => {
    if (!text.trim()) {
      Alert.alert('Empty Text', 'Please enter or paste some text to analyze');
      return;
    }

    if (!model) {
      Alert.alert('Model Not Ready', 'AI model is still loading. Please try again in a moment.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate model prediction for demo purposes
      // In a real app, you would use the actual model
      const simulatedScore = Math.random() * 100;
      setAuthenticityScore(simulatedScore);

      // Save to database
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO analyses (text, score) VALUES (?, ?)',
          [text, simulatedScore],
          (_, result) => console.log('Saved to database'),
          (_, error) => console.error('Database error:', error)
        );
      });
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Failed', 'There was an error analyzing the text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (authenticityScore === null) return 'transparent';
    if (authenticityScore > 80) return '#4CAF50'; // Green
    if (authenticityScore >= 50) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  const getStatusText = () => {
    if (authenticityScore === null) return '';
    if (authenticityScore > 80) return 'Human';
    if (authenticityScore >= 50) return 'Mixed';
    return 'AI-Generated';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Instant Paste Analysis</Text>

      <View style={styles.clipboardButtonContainer}>
        <TouchableOpacity
          style={styles.clipboardButton}
          onPress={pasteFromClipboard}
        >
          <Text style={styles.clipboardButtonText}>Paste from Clipboard</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.textInput}
        placeholder="Paste or type text here to analyze..."
        multiline
        numberOfLines={10}
        value={text}
        onChangeText={setText}
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.analyzeButton, isLoading && styles.analyzeButtonDisabled]}
        onPress={analyzeText}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.analyzeButtonText}>Analyze Authenticity</Text>
        )}
      </TouchableOpacity>

      {authenticityScore !== null && (
        <View style={styles.resultContainer}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Authenticity Score:</Text>
            <Text style={styles.scoreValue}>{authenticityScore.toFixed(1)}%</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusBadgeText}>{getStatusText()}</Text>
          </View>

          <View style={styles.scoreBarContainer}>
            <View style={[styles.scoreBar, { width: `${authenticityScore}%`, backgroundColor: getStatusColor() }]} />
          </View>

          <Text style={styles.explanationText}>
            {authenticityScore > 80
              ? 'This text appears to be written by a human with high confidence.'
              : authenticityScore >= 50
              ? 'This text shows characteristics of both human and AI writing.'
              : 'This text appears to be AI-generated with high confidence.'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  clipboardButtonContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  clipboardButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clipboardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 150,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scoreBarContainer: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 5,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default InstantPasteAnalysisScreen;
