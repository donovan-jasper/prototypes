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
const MEMORY_SEQUENCE = ['7', '3', '9', '2', '8', '1', '5', '4', '6'];
const MATH_PROBLEMS = [
  { question: '47 + 23', answer: 70, options: [68, 70, 72, 65] },
  { question: '89 - 34', answer: 55, options: [55, 53, 57, 51] },
  { question: '12 × 8', answer: 96, options: [94, 96, 98, 92] },
  { question: '144 ÷ 12', answer: 12, options: [10, 11, 12, 13] },
];

const ChallengeScreen: React.FC = () => {
  const route = useRoute<ChallengeScreenRouteProp>();
  const navigation = useNavigation<ChallengeScreenNavigationProp>();
  const { user } = useAuth();

  const challengeData = route.params || {
    id: '1',
    title: 'Typing Challenge',
    description: 'Improve your typing speed and accuracy',
  };

  const challengeType = getChallengeType(challengeData.id);

  // Typing Challenge State
  const [typedText, setTypedText] = useState('');
  const [typingTimer, setTypingTimer] = useState(60);
  const [typingStarted, setTypingStarted] = useState(false);
  const [typingErrors, setTypingErrors] = useState<number[]>([]);

  // Memory Challenge State
  const [memoryPhase, setMemoryPhase] = useState<'show' | 'recall' | 'result'>('show');
  const [memoryTimer, setMemoryTimer] = useState(10);
  const [memoryInput, setMemoryInput] = useState('');
  const [memoryScore, setMemoryScore] = useState(0);
  const [memorySequence, setMemorySequence] = useState<string[]>([]);
  const [memoryInputSequence, setMemoryInputSequence] = useState<string[]>([]);

  // Math Challenge State
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [mathTimer, setMathTimer] = useState(30);
  const [mathScore, setMathScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Common State
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreakNotification, setShowStreakNotification] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  function getChallengeType(id: string): string {
    if (id === '1') return 'typing';
    if (id === '2') return 'memory';
    if (id === '3') return 'math';
    return 'typing';
  }

  // Load streak on mount
  useEffect(() => {
    const loadStreak = async () => {
      try {
        const storedStreak = await AsyncStorage.getItem('userStreak');
        if (storedStreak) {
          setStreak(parseInt(streak, 10));
        }
      } catch (error) {
        console.error('Failed to load streak', error);
      }
    };
    loadStreak();
  }, []);

  // Typing Challenge Timer
  useEffect(() => {
    if (challengeType === 'typing' && typingStarted && typingTimer > 0 && !isCompleted) {
      timerRef.current = setTimeout(() => {
        setTypingTimer(typingTimer - 1);
      }, 1000);
    } else if (challengeType === 'typing' && typingTimer === 0 && !isCompleted) {
      handleTypingComplete();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [typingTimer, typingStarted, isCompleted, challengeType]);

  // Memory Challenge Timer
  useEffect(() => {
    if (challengeType === 'memory' && memoryPhase === 'show' && memoryTimer > 0) {
      timerRef.current = setTimeout(() => {
        setMemoryTimer(memoryTimer - 1);
      }, 1000);
    } else if (challengeType === 'memory' && memoryPhase === 'show' && memoryTimer === 0) {
      setMemoryPhase('recall');
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [memoryTimer, memoryPhase, challengeType]);

  // Math Challenge Timer
  useEffect(() => {
    if (challengeType === 'math' && mathTimer > 0 && !isCompleted && selectedAnswer === null) {
      timerRef.current = setTimeout(() => {
        setMathTimer(mathTimer - 1);
      }, 1000);
    } else if (challengeType === 'math' && mathTimer === 0 && selectedAnswer === null) {
      handleMathTimeout();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mathTimer, isCompleted, challengeType, selectedAnswer]);

  // Initialize memory sequence
  useEffect(() => {
    if (challengeType === 'memory') {
      setMemorySequence(MEMORY_SEQUENCE);
    }
  }, [challengeType]);

  const handleTypingChange = (text: string) => {
    if (!typingStarted) {
      setTypingStarted(true);
    }
    setTypedText(text);

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

    setFinalScore(score);

    try {
      setIsSaving(true);
      const result = await completeChallenge(
        challengeData.id,
        challengeType,
        challengeData.title,
        score
      );
      setEarnedXP(result.xp);
      setShowResults(true);
      checkStreak();
    } catch (error) {
      console.error('Error completing challenge:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMemoryInput = (text: string) => {
    if (memoryPhase === 'recall') {
      setMemoryInput(text);
      const sequence = text.split('').filter(item => item.trim() !== '');
      setMemoryInputSequence(sequence);
    }
  };

  const handleMemorySubmit = async () => {
    if (memoryPhase === 'recall') {
      let correctCount = 0;
      for (let i = 0; i < memoryInputSequence.length; i++) {
        if (memoryInputSequence[i] === memorySequence[i]) {
          correctCount++;
        }
      }

      const score = Math.round((correctCount / memorySequence.length) * 100);
      setMemoryScore(score);
      setMemoryPhase('result');

      try {
        setIsSaving(true);
        const result = await completeChallenge(
          challengeData.id,
          challengeType,
          challengeData.title,
          score
        );
        setEarnedXP(result.xp);
        setFinalScore(score);
        setShowResults(true);
        checkStreak();
      } catch (error) {
        console.error('Error completing challenge:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleMathAnswer = (answer: number) => {
    if (selectedAnswer !== null) return;

    const currentProblem = MATH_PROBLEMS[currentProblemIndex];
    const isCorrect = answer === currentProblem.answer;

    setSelectedAnswer(answer);
    setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setMathScore(mathScore + 1);
    }

    // Show feedback for 1 second before moving to next question
    setTimeout(() => {
      setAnswerFeedback(null);
      setSelectedAnswer(null);

      if (currentProblemIndex < MATH_PROBLEMS.length - 1) {
        setCurrentProblemIndex(currentProblemIndex + 1);
        setMathTimer(30);
      } else {
        handleMathComplete();
      }
    }, 1000);
  };

  const handleMathTimeout = () => {
    setAnswerFeedback('incorrect');
    setTimeout(() => {
      setAnswerFeedback(null);
      setSelectedAnswer(null);

      if (currentProblemIndex < MATH_PROBLEMS.length - 1) {
        setCurrentProblemIndex(currentProblemIndex + 1);
        setMathTimer(30);
      } else {
        handleMathComplete();
      }
    }, 1000);
  };

  const handleMathComplete = async () => {
    setIsCompleted(true);
    const score = mathScore;

    try {
      setIsSaving(true);
      const result = await completeChallenge(
        challengeData.id,
        challengeType,
        challengeData.title,
        score
      );
      setEarnedXP(result.xp);
      setFinalScore(score);
      setShowResults(true);
      checkStreak();
    } catch (error) {
      console.error('Error completing challenge:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const checkStreak = async () => {
    try {
      const lastLogin = await AsyncStorage.getItem('lastLoginDate');
      const today = new Date().toDateString();

      if (lastLogin !== today) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        await AsyncStorage.setItem('userStreak', newStreak.toString());
        await AsyncStorage.setItem('lastLoginDate', today);

        if (newStreak > 1) {
          setShowStreakNotification(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();

          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }).start(() => {
              setShowStreakNotification(false);
            });
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error checking streak:', error);
    }
  };

  const renderTypingChallenge = () => {
    return (
      <View style={styles.challengeContainer}>
        <Text style={styles.challengeTitle}>{challengeData.title}</Text>
        <Text style={styles.timer}>Time: {typingTimer}s</Text>

        <ScrollView style={styles.typingTargetContainer}>
          <Text style={styles.typingTargetText}>
            {TYPING_TARGET_TEXT.split('').map((char, index) => (
              <Text
                key={index}
                style={[
                  styles.typingChar,
                  typedText[index] !== undefined && typedText[index] !== char && styles.errorChar,
                  typedText[index] === char && styles.correctChar
                ]}
              >
                {char}
              </Text>
            ))}
          </Text>
        </ScrollView>

        <TextInput
          style={styles.typingInput}
          multiline
          value={typedText}
          onChangeText={handleTypingChange}
          placeholder="Start typing here..."
          autoFocus
        />

        {isCompleted && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Challenge Complete!</Text>
            <Text style={styles.resultsText}>Score: {finalScore}</Text>
            <Text style={styles.resultsText}>XP Earned: {earnedXP}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderMemoryChallenge = () => {
    return (
      <View style={styles.challengeContainer}>
        <Text style={styles.challengeTitle}>{challengeData.title}</Text>

        {memoryPhase === 'show' && (
          <>
            <Text style={styles.memoryInstructions}>Memorize these numbers:</Text>
            <Text style={styles.memorySequence}>
              {memorySequence.join(' ')}
            </Text>
            <Text style={styles.memoryTimer}>Time remaining: {memoryTimer}s</Text>
          </>
        )}

        {memoryPhase === 'recall' && (
          <>
            <Text style={styles.memoryInstructions}>Enter the numbers in order:</Text>
            <TextInput
              style={styles.memoryInput}
              value={memoryInput}
              onChangeText={handleMemoryInput}
              keyboardType="numeric"
              placeholder="1 2 3 4 5 6 7 8 9"
              autoFocus
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleMemorySubmit}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </>
        )}

        {memoryPhase === 'result' && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Challenge Complete!</Text>
            <Text style={styles.resultsText}>Score: {memoryScore}%</Text>
            <Text style={styles.resultsText}>XP Earned: {earnedXP}</Text>
            <Text style={styles.memoryResultText}>
              You remembered {memoryScore}% of the sequence
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderMathChallenge = () => {
    const currentProblem = MATH_PROBLEMS[currentProblemIndex];

    return (
      <View style={styles.challengeContainer}>
        <Text style={styles.challengeTitle}>{challengeData.title}</Text>
        <Text style={styles.timer}>Time: {mathTimer}s</Text>

        <View style={styles.mathProblemContainer}>
          <Text style={styles.mathQuestion}>{currentProblem.question}</Text>

          <View style={styles.mathOptionsContainer}>
            {currentProblem.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.mathOption,
                  selectedAnswer === option && answerFeedback === 'correct' && styles.correctOption,
                  selectedAnswer === option && answerFeedback === 'incorrect' && styles.incorrectOption,
                  selectedAnswer !== null && option === currentProblem.answer && styles.correctOption
                ]}
                onPress={() => handleMathAnswer(option)}
                disabled={selectedAnswer !== null}
              >
                <Text style={styles.mathOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {answerFeedback && (
            <Text style={[
              styles.feedbackText,
              answerFeedback === 'correct' ? styles.correctFeedback : styles.incorrectFeedback
            ]}>
              {answerFeedback === 'correct' ? 'Correct!' : 'Incorrect!'}
            </Text>
          )}
        </View>

        {isCompleted && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Challenge Complete!</Text>
            <Text style={styles.resultsText}>Score: {mathScore}/{MATH_PROBLEMS.length}</Text>
            <Text style={styles.resultsText}>XP Earned: {earnedXP}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {challengeType === 'typing' && renderTypingChallenge()}
      {challengeType === 'memory' && renderMemoryChallenge()}
      {challengeType === 'math' && renderMathChallenge()}

      {isSaving && (
        <Modal transparent={true} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.modalText}>Saving your progress...</Text>
            </View>
          </View>
        </Modal>
      )}

      {showStreakNotification && (
        <Animated.View style={[styles.streakNotification, { opacity: fadeAnim }]}>
          <Text style={styles.streakText}>🔥 {streak}-day streak!</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  challengeContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  timer: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  typingTargetContainer: {
    maxHeight: 150,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  typingTargetText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  typingChar: {
    color: '#333',
  },
  errorChar: {
    color: '#ff4444',
    textDecorationLine: 'underline',
  },
  correctChar: {
    color: '#4CAF50',
  },
  typingInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultsText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  memoryInstructions: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  memorySequence: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#4CAF50',
  },
  memoryTimer: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  memoryInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  memoryResultText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
  mathProblemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mathQuestion: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  mathOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mathOption: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 10,
  },
  mathOptionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#ff4444',
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  correctFeedback: {
    color: '#4CAF50',
  },
  incorrectFeedback: {
    color: '#ff4444',
  },
  streakNotification: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: 5,
    marginHorizontal: 20,
  },
  streakText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChallengeScreen;
