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

    // Calculate WPM
    const wordsTyped = typedText.trim().split(/\s+/).length;
    const wpm = Math.round((wordsTyped / 1) * 60);

    // Calculate accuracy
    const totalChars = TYPING_TARGET_TEXT.length;
    const correctChars = totalChars - typingErrors.length;
    const accuracy = Math.round((correctChars / totalChars) * 100);

    // Calculate final score (weighted average of WPM and accuracy)
    const finalScore = Math.round((wpm * 0.7) + (accuracy * 0.3));

    setFinalScore(finalScore);

    if (user) {
      try {
        setIsSaving(true);

        // Save to Firestore
        const challengeRef = doc(db, 'users', user.uid, 'challenges', challengeData.id);
        await setDoc(challengeRef, {
          type: 'typing',
          title: challengeData.title,
          wpm,
          accuracy,
          score: finalScore,
          timestamp: serverTimestamp(),
        }, { merge: true });

        // Calculate XP and update user stats
        const result = await completeChallenge(
          challengeData.id,
          'typing',
          challengeData.title,
          finalScore
        );

        setEarnedXP(result.xp);
        setShowResults(true);
      } catch (error) {
        console.error('Error saving challenge:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      setShowResults(true);
    }
  };

  const handleMemorySubmit = async () => {
    setMemoryPhase('result');

    // Calculate score (number of correct digits in correct order)
    const userSequence = memoryInput.split('').filter(d => MEMORY_SEQUENCE.includes(d));
    let score = 0;

    for (let i = 0; i < userSequence.length; i++) {
      if (userSequence[i] === MEMORY_SEQUENCE[i]) {
        score++;
      } else {
        break;
      }
    }

    setMemoryScore(score);

    if (user) {
      try {
        setIsSaving(true);

        // Save to Firestore
        const challengeRef = doc(db, 'users', user.uid, 'challenges', challengeData.id);
        await setDoc(challengeRef, {
          type: 'memory',
          title: challengeData.title,
          score,
          timestamp: serverTimestamp(),
        }, { merge: true });

        // Calculate XP and update user stats
        const result = await completeChallenge(
          challengeData.id,
          'memory',
          challengeData.title,
          score
        );

        setEarnedXP(result.xp);
        setShowResults(true);
      } catch (error) {
        console.error('Error saving challenge:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      setShowResults(true);
    }
  };

  const handleMathAnswer = (answer: number) => {
    setSelectedAnswer(answer);

    const isCorrect = answer === MATH_PROBLEMS[currentProblemIndex].answer;
    setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setMathScore(mathScore + 1);
    }

    // Move to next problem or complete challenge
    if (currentProblemIndex < MATH_PROBLEMS.length - 1) {
      setTimeout(() => {
        setCurrentProblemIndex(currentProblemIndex + 1);
        setSelectedAnswer(null);
        setAnswerFeedback(null);
        setMathTimer(30);
      }, 1000);
    } else {
      setIsCompleted(true);
      handleMathComplete();
    }
  };

  const handleMathTimeout = () => {
    setAnswerFeedback('incorrect');

    // Move to next problem or complete challenge
    if (currentProblemIndex < MATH_PROBLEMS.length - 1) {
      setTimeout(() => {
        setCurrentProblemIndex(currentProblemIndex + 1);
        setSelectedAnswer(null);
        setAnswerFeedback(null);
        setMathTimer(30);
      }, 1000);
    } else {
      setIsCompleted(true);
      handleMathComplete();
    }
  };

  const handleMathComplete = async () => {
    const finalScore = mathScore;

    if (user) {
      try {
        setIsSaving(true);

        // Save to Firestore
        const challengeRef = doc(db, 'users', user.uid, 'challenges', challengeData.id);
        await setDoc(challengeRef, {
          type: 'math',
          title: challengeData.title,
          score: finalScore,
          timestamp: serverTimestamp(),
        }, { merge: true });

        // Calculate XP and update user stats
        const result = await completeChallenge(
          challengeData.id,
          'math',
          challengeData.title,
          finalScore
        );

        setEarnedXP(result.xp);
        setShowResults(true);
      } catch (error) {
        console.error('Error saving challenge:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      setShowResults(true);
    }
  };

  const renderTypingChallenge = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{challengeData.title}</Text>
        <Text style={styles.description}>{challengeData.description}</Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{typingTimer}s</Text>
        </View>

        <ScrollView style={styles.textContainer}>
          <Text style={styles.targetText}>
            {TYPING_TARGET_TEXT.split('').map((char, index) => (
              <Text
                key={index}
                style={[
                  styles.char,
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
          style={styles.input}
          value={typedText}
          onChangeText={handleTypingChange}
          autoFocus
          multiline
          placeholder="Start typing here..."
          editable={!isCompleted}
        />

        {isCompleted && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Challenge Complete!</Text>
            <Text style={styles.resultsText}>WPM: {Math.round((typedText.trim().split(/\s+/).length / 1) * 60)}</Text>
            <Text style={styles.resultsText}>Accuracy: {Math.round(((TYPING_TARGET_TEXT.length - typingErrors.length) / TYPING_TARGET_TEXT.length) * 100)}%</Text>
            <Text style={styles.resultsText}>Final Score: {finalScore}</Text>
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
      <View style={styles.container}>
        <Text style={styles.title}>{challengeData.title}</Text>
        <Text style={styles.description}>{challengeData.description}</Text>

        {memoryPhase === 'show' && (
          <>
            <Text style={styles.memorySequence}>
              {MEMORY_SEQUENCE.join(' ')}
            </Text>
            <Text style={styles.memoryTimer}>{memoryTimer}s</Text>
          </>
        )}

        {memoryPhase === 'recall' && (
          <>
            <Text style={styles.memoryPrompt}>Enter the sequence you remember:</Text>
            <TextInput
              style={styles.memoryInput}
              value={memoryInput}
              onChangeText={setMemoryInput}
              keyboardType="numeric"
              maxLength={MEMORY_SEQUENCE.length}
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
            <Text style={styles.resultsText}>Correct Digits: {memoryScore}/{MEMORY_SEQUENCE.length}</Text>
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

  const renderMathChallenge = () => {
    const currentProblem = MATH_PROBLEMS[currentProblemIndex];

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{challengeData.title}</Text>
        <Text style={styles.description}>{challengeData.description}</Text>

        <View style={styles.mathProgress}>
          <Text style={styles.mathProgressText}>
            Problem {currentProblemIndex + 1} of {MATH_PROBLEMS.length}
          </Text>
          <Text style={styles.mathTimer}>{mathTimer}s</Text>
        </View>

        <Text style={styles.mathQuestion}>{currentProblem.question}</Text>

        <View style={styles.mathOptions}>
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

      <Modal visible={isSaving} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.modalText}>Saving your results...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  textContainer: {
    maxHeight: 200,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  targetText: {
    fontSize: 16,
    lineHeight: 24,
  },
  char: {
    color: '#333',
  },
  errorChar: {
    color: '#FF3B30',
    textDecorationLine: 'underline',
  },
  correctChar: {
    color: '#34C759',
  },
  input: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  memorySequence: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 30,
  },
  memoryTimer: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#007AFF',
  },
  memoryPrompt: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  memoryInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  mathProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mathProgressText: {
    fontSize: 16,
    color: '#666',
  },
  mathTimer: {
    fontSize: 18,
    color: '#007AFF',
  },
  mathQuestion: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  mathOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mathOption: {
    width: '45%',
    padding: 15,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center',
  },
  mathOptionText: {
    fontSize: 18,
  },
  correctOption: {
    backgroundColor: '#E5F7E5',
    borderColor: '#34C759',
  },
  incorrectOption: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF3B30',
  },
  resultsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultsText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default ChallengeScreen;
