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
    const timeInMinutes = (60 - typingTimer) / 60;
    const wpm = Math.round(wordsTyped / timeInMinutes);

    // Calculate accuracy
    const correctChars = TYPING_TARGET_TEXT.split('').filter((char, i) =>
      typedText[i] === char && i < typedText.length
    ).length;
    const accuracy = Math.round((correctChars / TYPING_TARGET_TEXT.length) * 100);

    // Calculate final score (weighted average of WPM and accuracy)
    const score = Math.round((wpm * 0.7) + (accuracy * 0.3));

    // Get XP and completion result
    const result = completeChallenge('typing', score);
    setEarnedXP(result.xp);
    setFinalScore(score);

    // Show results modal
    setShowResults(true);

    // Save to Firebase if user is logged in
    if (user) {
      try {
        setIsSaving(true);
        await setDoc(doc(db, 'users', user.uid, 'challenges', challengeData.id), {
          type: challengeType,
          score: score,
          xp: result.xp,
          completedAt: serverTimestamp(),
          accuracy: accuracy,
          wpm: wpm
        }, { merge: true });
      } catch (error) {
        console.error('Error saving challenge:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleMathTimeout = () => {
    if (currentProblemIndex < MATH_PROBLEMS.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setMathTimer(30);
      setSelectedAnswer(null);
      setAnswerFeedback(null);
    } else {
      setIsCompleted(true);
      const score = mathScore;
      const result = completeChallenge('math', score);
      setEarnedXP(result.xp);
      setFinalScore(score);
      setShowResults(true);
    }
  };

  const handleMemorySubmit = () => {
    const userSequence = memoryInput.split('').filter(n => n.trim() !== '');
    const correctCount = userSequence.filter((num, i) => num === MEMORY_SEQUENCE[i]).length;
    const score = Math.round((correctCount / MEMORY_SEQUENCE.length) * 100);

    setMemoryScore(score);
    setMemoryPhase('result');

    const result = completeChallenge('memory', score);
    setEarnedXP(result.xp);
    setFinalScore(score);
    setShowResults(true);
  };

  const handleSaveProgress = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      await setDoc(doc(db, 'users', user.uid, 'challenges', challengeData.id), {
        type: challengeType,
        score: finalScore,
        xp: earnedXP,
        completedAt: serverTimestamp(),
        accuracy: challengeType === 'typing' ? Math.round((typedText.split('').filter((char, i) =>
          char === TYPING_TARGET_TEXT[i] && i < typedText.length).length / TYPING_TARGET_TEXT.length) * 100) : undefined,
        wpm: challengeType === 'typing' ? Math.round(typedText.trim().split(/\s+/).length / ((60 - typingTimer) / 60)) : undefined,
        sequenceScore: challengeType === 'memory' ? memoryScore : undefined,
        mathScore: challengeType === 'math' ? mathScore : undefined
      }, { merge: true });
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTypingChallenge = () => {
    return (
      <View style={styles.challengeContainer}>
        <Text style={styles.timerText}>{typingTimer}s</Text>
        <ScrollView style={styles.textContainer}>
          <Text style={styles.targetText}>
            {TYPING_TARGET_TEXT.split('').map((char, index) => (
              <Text
                key={index}
                style={[
                  styles.targetChar,
                  typedText[index] !== char && typedText[index] !== undefined ? styles.errorChar : null,
                  typedText[index] === char ? styles.correctChar : null
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
          autoFocus
          editable={!isCompleted}
        />
      </View>
    );
  };

  const renderMemoryChallenge = () => {
    if (memoryPhase === 'show') {
      return (
        <View style={styles.challengeContainer}>
          <Text style={styles.memoryTitle}>Memorize this sequence:</Text>
          <Text style={styles.memorySequence}>{MEMORY_SEQUENCE.join(' ')}</Text>
          <Text style={styles.memoryTimer}>{memoryTimer}s remaining</Text>
        </View>
      );
    } else if (memoryPhase === 'recall') {
      return (
        <View style={styles.challengeContainer}>
          <Text style={styles.memoryTitle}>Enter the sequence:</Text>
          <TextInput
            style={styles.memoryInput}
            value={memoryInput}
            onChangeText={setMemoryInput}
            keyboardType="numeric"
            maxLength={MEMORY_SEQUENCE.length}
          />
          <TouchableOpacity style={styles.button} onPress={handleMemorySubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.challengeContainer}>
          <Text style={styles.memoryTitle}>Your score: {memoryScore}%</Text>
          <Text style={styles.memorySequence}>Correct sequence: {MEMORY_SEQUENCE.join(' ')}</Text>
        </View>
      );
    }
  };

  const renderMathChallenge = () => {
    const currentProblem = MATH_PROBLEMS[currentProblemIndex];
    return (
      <View style={styles.challengeContainer}>
        <Text style={styles.mathQuestion}>{currentProblem.question}</Text>
        <Text style={styles.mathTimer}>{mathTimer}s remaining</Text>
        <View style={styles.optionsContainer}>
          {currentProblem.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === option ? styles.selectedOption : null,
                answerFeedback === 'correct' && selectedAnswer === option ? styles.correctOption : null,
                answerFeedback === 'incorrect' && selectedAnswer === option ? styles.incorrectOption : null
              ]}
              onPress={() => handleMathAnswer(option)}
              disabled={selectedAnswer !== null}
            >
              <Text style={styles.optionText}>{option}</Text>
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
    );
  };

  const handleMathAnswer = (answer: number) => {
    const currentProblem = MATH_PROBLEMS[currentProblemIndex];
    const isCorrect = answer === currentProblem.answer;

    setSelectedAnswer(answer);
    setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setMathScore(mathScore + 1);
    }

    setTimeout(() => {
      if (currentProblemIndex < MATH_PROBLEMS.length - 1) {
        setCurrentProblemIndex(currentProblemIndex + 1);
        setMathTimer(30);
        setSelectedAnswer(null);
        setAnswerFeedback(null);
      } else {
        setIsCompleted(true);
        const score = mathScore;
        const result = completeChallenge('math', score);
        setEarnedXP(result.xp);
        setFinalScore(score);
        setShowResults(true);
      }
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{challengeData.title}</Text>
      <Text style={styles.description}>{challengeData.description}</Text>

      {challengeType === 'typing' && renderTypingChallenge()}
      {challengeType === 'memory' && renderMemoryChallenge()}
      {challengeType === 'math' && renderMathChallenge()}

      <Modal
        visible={showResults}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResults(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Challenge Complete!</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Score:</Text>
                <Text style={styles.statValue}>{finalScore}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>XP Earned:</Text>
                <Text style={styles.statValue}>{earnedXP}</Text>
              </View>
              {challengeType === 'typing' && (
                <>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>WPM:</Text>
                    <Text style={styles.statValue}>
                      {Math.round(typedText.trim().split(/\s+/).length / ((60 - typingTimer) / 60))}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Accuracy:</Text>
                    <Text style={styles.statValue}>
                      {Math.round((typedText.split('').filter((char, i) =>
                        char === TYPING_TARGET_TEXT[i] && i < typedText.length).length / TYPING_TARGET_TEXT.length) * 100)}%
                    </Text>
                  </View>
                </>
              )}
              {challengeType === 'memory' && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Memory Score:</Text>
                  <Text style={styles.statValue}>{memoryScore}%</Text>
                </View>
              )}
              {challengeType === 'math' && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Math Score:</Text>
                  <Text style={styles.statValue}>{mathScore}/{MATH_PROBLEMS.length}</Text>
                </View>
              )}
            </View>

            {user && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProgress}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Progress</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowResults(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.closeButtonText}>Continue</Text>
            </TouchableOpacity>
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
  challengeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#e74c3c',
  },
  textContainer: {
    maxHeight: 150,
    marginBottom: 20,
  },
  targetText: {
    fontSize: 18,
    lineHeight: 24,
  },
  targetChar: {
    color: '#333',
  },
  correctChar: {
    color: '#2ecc71',
  },
  errorChar: {
    color: '#e74c3c',
    textDecorationLine: 'underline',
  },
  input: {
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  memoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  memorySequence: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#3498db',
  },
  memoryTimer: {
    fontSize: 18,
    textAlign: 'center',
    color: '#e74c3c',
  },
  memoryInput: {
    fontSize: 24,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mathQuestion: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#3498db',
  },
  mathTimer: {
    fontSize: 18,
    textAlign: 'center',
    color: '#e74c3c',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    margin: 5,
    width: '45%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#3498db',
  },
  correctOption: {
    backgroundColor: '#2ecc71',
  },
  incorrectOption: {
    backgroundColor: '#e74c3c',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  correctFeedback: {
    color: '#2ecc71',
  },
  incorrectFeedback: {
    color: '#e74c3c',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChallengeScreen;
