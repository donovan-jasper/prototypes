import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types/navigation';
import { completeChallenge } from '../utils/challenges';

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

    const result = await completeChallenge(challengeType, score);
    setEarnedXP(result.xp);
    setFinalScore(score);
    setIsCompleted(true);
  };

  const handleMathTimeout = () => {
    if (currentProblemIndex < MATH_PROBLEMS.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setMathTimer(30);
      setSelectedAnswer(null);
      setAnswerFeedback(null);
    } else {
      const score = Math.floor((mathScore / MATH_PROBLEMS.length) * 100);
      setFinalScore(score);
      setIsCompleted(true);
    }
  };

  const handleMemorySubmit = () => {
    const userSequence = memoryInput.split(',').map(item => item.trim());
    let correctCount = 0;

    for (let i = 0; i < Math.min(userSequence.length, MEMORY_SEQUENCE.length); i++) {
      if (userSequence[i] === MEMORY_SEQUENCE[i]) {
        correctCount++;
      }
    }

    const score = Math.floor((correctCount / MEMORY_SEQUENCE.length) * 100);
    setMemoryScore(score);
    setMemoryPhase('result');
  };

  const renderTypingChallenge = () => {
    return (
      <View style={styles.challengeContainer}>
        <Text style={styles.challengeTitle}>{challengeData.title}</Text>
        <Text style={styles.timer}>Time: {typingTimer}s</Text>
        <Text style={styles.targetText}>{TYPING_TARGET_TEXT}</Text>
        <TextInput
          style={styles.typingInput}
          multiline
          value={typedText}
          onChangeText={handleTypingChange}
          autoFocus
        />
        <Text style={styles.accuracyText}>
          Accuracy: {typedText.length > 0
            ? `${Math.floor(((typedText.length - typingErrors.length) / typedText.length) * 100)}%`
            : '0%'}
        </Text>
      </View>
    );
  };

  const renderMemoryChallenge = () => {
    if (memoryPhase === 'show') {
      return (
        <View style={styles.challengeContainer}>
          <Text style={styles.challengeTitle}>{challengeData.title}</Text>
          <Text style={styles.memorySequence}>
            Memorize: {MEMORY_SEQUENCE.join(', ')}
          </Text>
          <Text style={styles.timer}>Time: {memoryTimer}s</Text>
        </View>
      );
    } else if (memoryPhase === 'recall') {
      return (
        <View style={styles.challengeContainer}>
          <Text style={styles.challengeTitle}>{challengeData.title}</Text>
          <Text style={styles.memoryPrompt}>
            Enter the sequence you memorized (comma separated):
          </Text>
          <TextInput
            style={styles.memoryInput}
            value={memoryInput}
            onChangeText={setMemoryInput}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleMemorySubmit}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.challengeContainer}>
          <Text style={styles.challengeTitle}>{challengeData.title}</Text>
          <Text style={styles.resultText}>Your score: {memoryScore}%</Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => setIsCompleted(true)}
          >
            <Text style={styles.submitButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderMathChallenge = () => {
    const currentProblem = MATH_PROBLEMS[currentProblemIndex];

    return (
      <View style={styles.challengeContainer}>
        <Text style={styles.challengeTitle}>{challengeData.title}</Text>
        <Text style={styles.timer}>Time: {mathTimer}s</Text>
        <Text style={styles.mathQuestion}>{currentProblem.question}</Text>
        <View style={styles.optionsContainer}>
          {currentProblem.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === option && styles.selectedOption,
                answerFeedback === 'correct' && option === currentProblem.answer && styles.correctOption,
                answerFeedback === 'incorrect' && selectedAnswer === option && styles.incorrectOption
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
        const score = Math.floor((mathScore / MATH_PROBLEMS.length) * 100);
        setFinalScore(score);
        setIsCompleted(true);
      }
    }, 1000);
  };

  const renderCompletionScreen = () => {
    return (
      <Modal
        visible={isCompleted}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.completionContainer}>
          <Text style={styles.completionTitle}>Challenge Complete!</Text>
          <Text style={styles.completionScore}>Final Score: {finalScore}</Text>
          <Text style={styles.completionXP}>XP Earned: {earnedXP}</Text>
          <TouchableOpacity
            style={styles.completionButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.completionButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {challengeType === 'typing' && renderTypingChallenge()}
      {challengeType === 'memory' && renderMemoryChallenge()}
      {challengeType === 'math' && renderMathChallenge()}
      {isCompleted && renderCompletionScreen()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  challengeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  timer: {
    fontSize: 20,
    marginBottom: 20,
    color: '#666',
  },
  targetText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#444',
  },
  typingInput: {
    width: '100%',
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  accuracyText: {
    fontSize: 16,
    color: '#666',
  },
  memorySequence: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  memoryPrompt: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#444',
  },
  memoryInput: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultText: {
    fontSize: 20,
    marginBottom: 20,
    color: '#333',
  },
  mathQuestion: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#2196F3',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#F44336',
  },
  optionText: {
    fontSize: 18,
    color: 'white',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  correctFeedback: {
    color: '#4CAF50',
  },
  incorrectFeedback: {
    color: '#F44336',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  completionScore: {
    fontSize: 22,
    marginBottom: 15,
    color: '#4CAF50',
  },
  completionXP: {
    fontSize: 22,
    marginBottom: 30,
    color: '#FF9800',
  },
  completionButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  completionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChallengeScreen;
