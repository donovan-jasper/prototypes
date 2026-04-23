import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types/navigation';
import { completeChallenge } from '../utils/challenges';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function getChallengeType(id: string): string {
    if (id === '1') return 'typing';
    if (id === '2') return 'memory';
    if (id === '3') return 'math';
    return 'typing';
  }

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
    if (timerRef.current) clearTimeout(timerRef.current);

    // Calculate accuracy
    const totalChars = TYPING_TARGET_TEXT.length;
    const correctChars = totalChars - typingErrors.length;
    const accuracy = Math.round((correctChars / totalChars) * 100);

    // Calculate XP based on accuracy
    let xp = 0;
    if (accuracy >= 90) xp = 50;
    else if (accuracy >= 80) xp = 30;
    else if (accuracy >= 70) xp = 20;
    else xp = 10;

    setEarnedXP(xp);
    setFinalScore(accuracy);

    if (user) {
      try {
        setIsSaving(true);
        const challengeRef = doc(db, 'users', user.uid, 'challenges', challengeData.id);

        await setDoc(challengeRef, {
          type: challengeType,
          title: challengeData.title,
          score: accuracy,
          xpEarned: xp,
          completedAt: serverTimestamp(),
          duration: 60 - typingTimer
        }, { merge: true });

        setIsSaving(false);
        setShowResults(true);
      } catch (error) {
        console.error('Error saving challenge:', error);
        setIsSaving(false);
        // Show error to user
      }
    } else {
      setShowResults(true);
    }
  };

  const handleMathTimeout = () => {
    if (currentProblemIndex < MATH_PROBLEMS.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setMathTimer(30);
      setSelectedAnswer(null);
      setAnswerFeedback(null);
    } else {
      handleMathComplete();
    }
  };

  const handleMathComplete = () => {
    setIsCompleted(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    const accuracy = Math.round((mathScore / MATH_PROBLEMS.length) * 100);
    let xp = 0;
    if (accuracy >= 90) xp = 50;
    else if (accuracy >= 80) xp = 30;
    else if (accuracy >= 70) xp = 20;
    else xp = 10;

    setEarnedXP(xp);
    setFinalScore(accuracy);
    setShowResults(true);
  };

  const handleMemoryComplete = () => {
    setIsCompleted(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    const userSequence = memoryInput.split(' ').filter(item => item !== '');
    let correctCount = 0;

    for (let i = 0; i < Math.min(userSequence.length, MEMORY_SEQUENCE.length); i++) {
      if (userSequence[i] === MEMORY_SEQUENCE[i]) {
        correctCount++;
      }
    }

    const accuracy = Math.round((correctCount / MEMORY_SEQUENCE.length) * 100);
    let xp = 0;
    if (accuracy >= 90) xp = 50;
    else if (accuracy >= 80) xp = 30;
    else if (accuracy >= 70) xp = 20;
    else xp = 10;

    setEarnedXP(xp);
    setFinalScore(accuracy);
    setShowResults(true);
  };

  const renderTypingChallenge = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{challengeData.title}</Text>
        <Text style={styles.description}>{challengeData.description}</Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Time: {typingTimer}s</Text>
        </View>

        <ScrollView style={styles.targetTextContainer}>
          <Text style={styles.targetText}>
            {TYPING_TARGET_TEXT.split('').map((char, index) => (
              <Text
                key={index}
                style={[
                  styles.targetChar,
                  typedText[index] !== char && typedText[index] !== undefined && styles.errorChar
                ]}
              >
                {char}
              </Text>
            ))}
          </Text>
        </ScrollView>

        <TextInput
          style={styles.input}
          value={typedText}
          onChangeText={handleTypingChange}
          multiline
          placeholder="Start typing here..."
          editable={!isCompleted}
        />

        {isCompleted && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowResults(true)}
          >
            <Text style={styles.buttonText}>View Results</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderResultsModal = () => {
    return (
      <Modal
        visible={showResults}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowResults(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Challenge Complete!</Text>

            {isSaving ? (
              <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
              <>
                <Text style={styles.modalScore}>Score: {finalScore}%</Text>
                <Text style={styles.modalXP}>XP Earned: {earnedXP}</Text>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setShowResults(false);
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.modalButtonText}>Continue</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {challengeType === 'typing' && renderTypingChallenge()}
      {renderResultsModal()}
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
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  targetTextContainer: {
    maxHeight: 150,
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  targetText: {
    fontSize: 16,
    lineHeight: 24,
  },
  targetChar: {
    color: '#333',
  },
  errorChar: {
    color: '#f44336',
    textDecorationLine: 'underline',
  },
  input: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  modalScore: {
    fontSize: 18,
    marginBottom: 10,
    color: '#4CAF50',
  },
  modalXP: {
    fontSize: 18,
    marginBottom: 20,
    color: '#FF9800',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChallengeScreen;
