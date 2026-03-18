import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types/navigation';
import { completeChallenge } from '../utils/challenges';

type ChallengeScreenRouteProp = RouteProp<RootTabParamList, 'Challenge'>;
type ChallengeScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Challenge'>;

const ChallengeScreen: React.FC = () => {
  const route = useRoute<ChallengeScreenRouteProp>();
  const navigation = useNavigation<ChallengeScreenNavigationProp>();
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const challengeData = route.params || {
    id: '1',
    title: 'Typing Challenge',
    description: 'Improve your typing speed and accuracy',
  };

  const getChallengeType = (id: string): string => {
    if (id === '1') return 'typing';
    if (id === '2') return 'memory';
    if (id === '3') return 'math';
    return 'typing';
  };

  const handleSubmit = async () => {
    const wordCount = text.trim().split(/\s+/).length;
    const calculatedScore = Math.min(wordCount * 10, 100);
    setScore(calculatedScore);

    const challengeType = getChallengeType(challengeData.id);
    const result = await completeChallenge(
      challengeData.id,
      challengeType,
      challengeData.title,
      calculatedScore
    );

    setEarnedXP(result.xp);
    setFeedback(`Great job! You typed ${wordCount} words. Score: ${calculatedScore}/100. You earned ${result.xp} XP!`);
    setIsCompleted(true);
  };

  const handleReset = () => {
    setText('');
    setFeedback('');
    setScore(0);
    setEarnedXP(0);
    setIsCompleted(false);
  };

  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToHome} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{challengeData.title}</Text>
        <Text style={styles.description}>{challengeData.description}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>Type as much as you can in the box below:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setText}
          value={text}
          placeholder="Start typing here..."
          multiline
          editable={!isCompleted}
        />

        {!isCompleted ? (
          <TouchableOpacity 
            style={[styles.button, styles.submitButton]} 
            onPress={handleSubmit}
            disabled={text.trim().length === 0}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.resultContainer}>
            <Text style={styles.feedback}>{feedback}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.resetButton]} 
                onPress={handleReset}
              >
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.homeButton]} 
                onPress={handleBackToHome}
              >
                <Text style={styles.buttonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instruction: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  input: {
    height: 200,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  resetButton: {
    backgroundColor: '#FF9500',
    flex: 1,
    marginRight: 8,
  },
  homeButton: {
    backgroundColor: '#34C759',
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 16,
  },
  feedback: {
    fontSize: 18,
    color: '#34C759',
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
  },
});

export default ChallengeScreen;
