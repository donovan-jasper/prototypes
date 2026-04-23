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
    const accuracy = typedText.length > 0
      ? ((typedText.length - typingErrors.length) / typedText.length) * 100
      : 0;
    const wpm = Math.floor((typedText.length / 5) / ((60 - typingTimer) / 60));
    const score = Math.min(Math.floor((accuracy + wpm) / 2), 100);

    setFinalScore(score);
    setIsCompleted(true);

    if (user) {
      setIsSaving(true);
      try {
        const result = await completeChallenge(challengeData.id, challengeType, challengeData.title, score);
        setEarnedXP(result.xp);

        // Save to Firebase
        const challengeRef = doc(db, 'users', user.uid, 'challenges', Date.now().toString());
        await setDoc(challengeRef, {
          type: challengeType,
          title: challengeData.title,
          score,
          xp: result.xp,
          timestamp: serverTimestamp(),
        });

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
    const userInput = memoryInput.split(',').map(item => item.trim());
    let correctCount = 0;

    for (let i = 0; i < Math.min(userInput.length, MEMORY_SEQUENCE.length); i++) {
      if (userInput[i] === MEMORY_SEQUENCE[i]) {
        correctCount++;
      }
    }

    const score = Math.floor((correctCount / MEMORY_SEQUENCE.length) * 100);
    setMemoryScore(score);
    setMemoryPhase('result');
    setFinalScore(score);
    setIsCompleted(true);

    if (user) {
      setIsSaving(true);
      try {
        const result = await completeChallenge(challengeData.id, challengeType, challengeData.title, score);
        setEarnedXP(result.xp);

        // Save to Firebase
        const challengeRef = doc(db, 'users', user.uid, 'challenges', Date.now().toString());
        await setDoc(challengeRef, {
          type: challengeType,
          title: challengeData.title,
          score,
          xp: result.xp,
          timestamp: serverTimestamp(),
        });

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

    if (isCorrect) {
      setMathScore(prev => prev + 25);
      setAnswerFeedback('correct');
    } else {
      setAnswerFeedback('incorrect');
    }

    setTimeout(() => {
      setAnswerFeedback(null);
      setSelectedAnswer(null);

      if (currentProblemIndex < MATH_PROBLEMS.length - 1) {
        setCurrentProblemIndex(prev => prev + 1);
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
        setCurrentProblemIndex(prev => prev + 1);
        setMathTimer(30);
      } else {
        handleMathComplete();
      }
    }, 1000);
  };

  const handleMathComplete = async () => {
    const score = mathScore;
    setFinalScore(score);
    setIsCompleted(true);

    if (user) {
      setIsSaving(true);
      try {
        const result = await completeChallenge(challengeData.id, challengeType, challengeData.title, score);
        setEarnedXP(result.xp);

        // Save to Firebase
        const challengeRef = doc(db, 'users', user.uid, 'challenges', Date.now().toString());
        await setDoc(challengeRef, {
          type: challengeType,
          title: challengeData.title,
          score,
          xp: result.xp,
          timestamp: serverTimestamp(),
        });

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
      <View style={styles.challengeContainer}>
        <Text style={styles.challengeTitle}>{challengeData.title}</Text>
        <Text style={styles.challengeDescription}>{challengeData.description}</Text>

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
          editable={!isCompleted}
        />

        {isCompleted && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>Score: {finalScore}/100</Text>
            <Text style={styles.resultsText}>XP Earned: {earnedXP}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderMemoryChallenge = () => {
    return (
      <View style={styles.challengeContainer}>
        <Text style={styles.challengeTitle}>{challengeData.title}</Text>
        <Text style={styles.challengeDescription}>{challengeData.description}</Text>

        {memoryPhase === 'show' && (
          <>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>Memorize: {memoryTimer}s</Text>
            </View>
            <View style={styles.memorySequenceContainer}>
              {MEMORY_SEQUENCE.map((num, index) => (
                <Text key={index} style={styles.memoryNumber}>{num}</Text>
              ))}
            </View>
          </>
        )}

        {memoryPhase === 'recall' && (
          <>
            <Text style={styles.memoryPrompt}>Enter the numbers in order, separated by commas:</Text>
            <TextInput
              style={styles.memoryInput}
              value={memoryInput}
              onChangeText={setMemoryInput}
              placeholder="e.g., 7, 3, 9, ..."
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleMemorySubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </>
        )}

        {memoryPhase === 'result' && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>Score: {memoryScore}/100</Text>
            <Text style={styles.resultsText}>XP Earned: {earnedXP}</Text>
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
        <Text style={styles.challengeDescription}>{challengeData.description}</Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Time: {mathTimer}s</Text>
        </View>

        <View style={styles.mathProblemContainer}>
          <Text style={styles.mathQuestion}>{currentProblem.question}</Text>
          <View style={styles.mathOptionsContainer}>
            {currentProblem.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.mathOption,
                  selectedAnswer === option && answerFeedback === 'correct' && styles.correctOption,
                  selectedAnswer === option && answerFeedback === 'incorrect' && styles.incorrectOption
                ]}
                onPress={() => handleMathAnswer(option)}
                disabled={selectedAnswer !== null}
              >
                <Text style={styles.mathOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isCompleted && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>Score: {finalScore}/100</Text>
            <Text style={styles.resultsText}>XP Earned: {earnedXP}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderResultsModal = () => {
    return (
      <Modal
        visible={showResults}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowResults(false);
          navigation.navigate('Home');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Challenge Complete!</Text>

            <View style={styles.modalStatsContainer}>
              <Text style={styles.modalStat}>Score: {finalScore}/100</Text>
              <Text style={styles.modalStat}>XP Earned: {earnedXP}</Text>
            </View>

            <Text style={styles.modalFeedback}>
              {finalScore >= 80 ? 'Great job!' :
               finalScore >= 50 ? 'Good effort!' :
               'Keep practicing!'}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowResults(false);
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {challengeType === 'typing' && renderTypingChallenge()}
      {challengeType === 'memory' && renderMemoryChallenge()}
      {challengeType === 'math' && renderMathChallenge()}

      {isSaving && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.savingText}>Saving your results...</Text>
        </View>
      )}

      {renderResultsModal()}
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
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  challengeDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
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
    textAlignVertical: 'top',
  },
  memorySequenceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  memoryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#4CAF50',
  },
  memoryPrompt: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  memoryInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mathProblemContainer: {
    marginBottom: 20,
  },
  mathQuestion: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  mathOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  mathOption: {
    width: '45%',
    backgroundColor: '#f0f0f0',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  mathOptionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#f44336',
  },
  resultsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 18,
    marginBottom: 10,
  },
  savingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4CAF50',
  },
  modalStatsContainer: {
    marginBottom: 20,
    width: '100%',
  },
  modalStat: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalFeedback: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
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
