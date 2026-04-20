import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as tf from '@tensorflow/tfjs';
import { loadLayersModel } from '@tensorflow/tfjs-react-native';

const InstantPasteAnalysisScreen = () => {
  const [text, setText] = useState('');
  const [authenticityScore, setAuthenticityScore] = useState(0);
  const navigation = useNavigation();

  const analyzeText = async () => {
    try {
      const model = await loadLayersModel('https://example.com/model.json');
      const input = tf.tensor2d([text], [1, 1], 'string');
      const output = model.predict(input);
      const score = await output.data();
      setAuthenticityScore(score[0]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Instant Paste Analysis</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Paste text here"
        multiline
        numberOfLines={10}
        value={text}
        onChangeText={setText}
      />
      <TouchableOpacity style={styles.analyzeButton} onPress={analyzeText}>
        <Text style={styles.analyzeButtonText}>Analyze</Text>
      </TouchableOpacity>
      {authenticityScore > 0 && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Authenticity Score:</Text>
          <Text style={styles.scoreValue}>{authenticityScore.toFixed(2)}</Text>
          {authenticityScore > 80 && (
            <Text style={styles.statusBadgeGreen}>Human</Text>
          )}
          {authenticityScore >= 50 && authenticityScore <= 80 && (
            <Text style={styles.statusBadgeYellow}>Mixed</Text>
          )}
          {authenticityScore < 50 && (
            <Text style={styles.statusBadgeRed}>AI-Generated</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  analyzeButton: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 5,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
  },
  scoreContainer: {
    marginTop: 10,
  },
  scoreLabel: {
    fontSize: 18,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBadgeGreen: {
    backgroundColor: 'green',
    color: 'white',
    padding: 5,
    borderRadius: 5,
  },
  statusBadgeYellow: {
    backgroundColor: 'yellow',
    color: 'black',
    padding: 5,
    borderRadius: 5,
  },
  statusBadgeRed: {
    backgroundColor: 'red',
    color: 'white',
    padding: 5,
    borderRadius: 5,
  },
});

export default InstantPasteAnalysisScreen;
