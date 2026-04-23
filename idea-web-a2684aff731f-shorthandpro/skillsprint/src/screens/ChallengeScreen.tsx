import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, ActivityIndicator, Animated } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types/navigation';
import { completeChallenge, calculateTypingStats } from '../utils/challenges';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ChallengeScreenRouteProp = RouteProp<RootTabParamList, 'Challenge'>;
type ChallengeScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Challenge'>;

const TYPING_TARGET_TEXT = "The quick brown fox jumps over the lazy dog. Practice makes perfect when it comes to typing speed and accuracy.";

const ChallengeScreen: React.FC = () => {
  const route = useRoute<ChallengeScreenRouteProp>();
  const navigation = useNavigation<ChallengeScreenNavigationProp>();
  const { user } = useAuth();

  const challengeData = route.params || {
    id: '1',
    title: 'Typing Challenge',
    description: 'Improve your typing speed and accuracy',
  };

  // Typing Challenge State
  const [typedText, setTypedText] = useState('');
  const [typingTimer, setTypingTimer] = useState(60);
  const [typingStarted, setTypingStarted] = useState(false);
  const [typingErrors, setTypingErrors] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreakNotification, setShowStreakNotification] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Load streak on mount
  useEffect(() => {
    const loadStreak = async () => {
      try {
        const storedStreak = await AsyncStorage.getItem('userStreak');
        if (storedStreak) {
          setStreak(parseInt(storedStreak, 10));
        }
      } catch (error) {
        console.error('Failed to load streak', error);
      }
    };
    loadStreak();
  }, []);

  // Typing Challenge Timer
  useEffect(() => {
    if (typingStarted && typingTimer > 0 && !isCompleted) {
      timerRef.current = setTimeout(() => {
        setTypingTimer(typingTimer - 1);
      }, 1000);
    } else if (typingTimer === 0 && !isCompleted) {
      handleTypingComplete();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [typingTimer, typingStarted, isCompleted]);

  const handleTypingStart = () => {
    setTypingStarted(true);
    inputRef.current?.focus();
  };

  const handleTypingChange = (text: string) => {
    if (!typingStarted) return;

    setTypedText(text);

    // Track errors
    const errors: number[] = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== TYPING_TARGET_TEXT[i]) {
        errors.push(i);
      }
    }
    setTypingErrors(errors);
  };

  const handleTypingComplete = async () => {
    setIsCompleted(true);
    const { wpm, accuracy } = calculateTypingStats(typedText, TYPING_TARGET_TEXT);
    const score = Math.round((wpm * accuracy) / 100);

    const result = await completeChallenge(
      challengeData.id,
      'typing',
      challengeData.title,
      score
    );

    setEarnedXP(result.xp);
    setFinalScore(score);
    setShowResults(true);

    // Update streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    await AsyncStorage.setItem('userStreak', newStreak.toString());
    setShowStreakNotification(true);

    // Hide streak notification after 3 seconds
    setTimeout(() => {
      setShowStreakNotification(false);
    }, 3000);
  };

  const renderTypingChallenge = () => {
    if (isCompleted) {
      return (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Challenge Complete!</Text>
          <Text style={styles.resultsText}>Score: {finalScore}</Text>
          <Text style={styles.resultsText}>XP Earned: {earnedXP}</Text>
          <Text style={styles.resultsText}>Accuracy: {calculateTypingStats(typedText, TYPING_TARGET_TEXT).accuracy}%</Text>
          <Text style={styles.resultsText}>WPM: {calculateTypingStats(typedText, TYPING_TARGET_TEXT).wpm}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Back to Challenges</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.challengeContainer}>
        <Text style={styles.timerText}>{typingTimer}s</Text>

        <View style={styles.targetTextContainer}>
          <Text style={styles.targetText}>
            {TYPING_TARGET_TEXT.split('').map((char, index) => (
              <Text
                key={index}
                style={[
                  styles.targetChar,
                  typedText[index] !== char && typedText[index] !== undefined
                    ? styles.errorChar
                    : null,
                  typedText[index] === char
                    ? styles.correctChar
                    : null
                ]}
              >
                {char}
              </Text>
            ))}
          </Text>
        </View>

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={typedText}
          onChangeText={handleTypingChange}
          autoFocus={false}
          multiline
          placeholder="Start typing here..."
          editable={!isCompleted}
        />

        {!typingStarted && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleTypingStart}
          >
            <Text style={styles.startButtonText}>Start Challenge</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{challengeData.title}</Text>
        <Text style={styles.description}>{challengeData.description}</Text>
      </View>

      {renderTypingChallenge()}

      <Modal
        visible={showStreakNotification}
        transparent
        animationType="fade"
      >
        <View style={styles.streakModal}>
          <View style={styles.streakContent}>
            <Text style={styles.streakText}>Daily Streak: {streak} days!</Text>
            <Text style={styles.streakSubtext}>Keep it up!</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4a6fa5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: 'white',
  },
  challengeContainer: {
    padding: 20,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#4a6fa5',
  },
  targetTextContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  targetText: {
    fontSize: 18,
    lineHeight: 28,
  },
  targetChar: {
    color: '#333',
  },
  errorChar: {
    color: 'red',
    backgroundColor: '#ffebee',
    borderRadius: 2,
  },
  correctChar: {
    color: 'green',
  },
  input: {
    fontSize: 18,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 100,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#4a6fa5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4a6fa5',
  },
  resultsText: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4a6fa5',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  streakContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4a6fa5',
  },
  streakSubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default ChallengeScreen;
