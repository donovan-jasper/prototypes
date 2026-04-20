import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
      const input = tf.tensor2d([text], [1, 1], 'string');
      const output = model.predict(input);
      const score = await output.data();
      const finalScore = score[0] * 100;
      setAuthenticityScore(finalScore);

      // Save to database
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO analyses (text, score) VALUES (?, ?)',
          [text, finalScore],
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
    if (authenticityScore > 80) return 'green';
    if (authenticityScore >= 50) return 'gold';
    return 'red';
  };

  const getStatusText = () => {
    if (authenticityScore === null) return '';
    if (authenticityScore > 80) return 'Human';
    if (authenticityScore >= 50) return 'Mixed';
    return 'AI-Generated';
  };

  return (
    <View style={styles.container}>
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
        </View>
      )}
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
    textAlign: 'center',
  },
  clipboardButtonContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  clipboardButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  clipboardButtonText: {
    color: 'white',
    fontSize: 16,
  },
  textInput: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    backgroundColor: 'white',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scoreBarContainer: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 5,
  },
});

export default InstantPasteAnalysisScreen;
