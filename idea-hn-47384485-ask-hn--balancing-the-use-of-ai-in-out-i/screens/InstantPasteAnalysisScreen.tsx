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
  const [isSaved, setIsSaved] = useState(false);
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
      setIsSaved(false);
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
    setIsSaved(false);
    try {
      // Simulate model prediction for demo purposes
      // In a real app, you would use the actual model
      const simulatedScore = Math.random() * 100;
      setAuthenticityScore(simulatedScore);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Failed', 'There was an error analyzing the text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalysis = () => {
    if (authenticityScore === null) {
      Alert.alert('No Analysis', 'Please analyze text before saving');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO analyses (text, score) VALUES (?, ?)',
        [text, authenticityScore],
        (_, result) => {
          setIsSaved(true);
          Alert.alert('Saved', 'Analysis saved to your conversation history');
        },
        (_, error) => {
          console.error('Database error:', error);
          Alert.alert('Save Failed', 'There was an error saving the analysis');
        }
      );
    });
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

      <View style={styles.buttonContainer}>
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
          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.saveButtonDisabled]}
            onPress={saveAnalysis}
            disabled={isSaved}
          >
            <Text style={styles.saveButtonText}>
              {isSaved ? 'Saved' : 'Save Analysis'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
            {authenticityScore > 80 && "This text appears to be written by a human with high confidence."}
            {authenticityScore >= 50 && authenticityScore <= 80 && "This text shows characteristics of both human and AI writing."}
            {authenticityScore < 50 && "This text appears to be AI-generated with high confidence."}
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
    marginBottom: 15,
    alignItems: 'center',
  },
  clipboardButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  clipboardButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    minHeight: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#FFCC80',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    padding: 8,
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
    backgroundColor: '#e0e0e0',
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
