import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
    
    setFinalScore(score);
    const result = await completeChallenge(
      challengeData.id,
      challengeType,
      challengeData.title,
      score
    );
    setEarnedXP(result.xp);
    setIsCompleted(true);
  };

  const handleMemorySubmit = async () => {
    const userSequence = memoryInput.trim().split('').filter(c => c !== ' ');
    let correct = 0;
    for (let i = 0; i < Math.min(userSequence.length, MEMORY_SEQUENCE.length); i++) {
      if (userSequence[i] === MEMORY_SEQUENCE[i]) {
        correct++;
      }
    }
    const score = Math.floor((correct / MEMORY_SEQUENCE.length) * 100);
    setMemoryScore(score);
    setFinalScore(score);
    
    const result = await completeChallenge(
      challengeData.id,
      challengeType,
      challengeData.title,
      score
    );
    setEarnedXP(result.xp);
    setMemoryPhase('result');
    setIsCompleted(true);
  };

  const handleMathAnswer = (answer: number) => {
    setSelectedAnswer(answer);
    const currentProblem = MATH_PROBLEMS[currentProblemIndex];
    const isCorrect = answer === currentProblem.answer;
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
        handleMathComplete();
      }
    }, 1000);
  };

  const handleMathTimeout = () => {
    setAnswerFeedback('incorrect');
    setTimeout(() => {
      if (currentProblemIndex < MATH_PROBLEMS.length - 1) {
        setCurrentProblemIndex(currentProblemIndex + 1);
        setMathTimer(30);
        setSelectedAnswer(null);
        setAnswerFeedback(null);
      } else {
        handleMathComplete();
      }
    }, 1000);
  };

  const handleMathComplete = async () => {
    const score = Math.floor((mathScore / MATH_PROBLEMS.length) * 100);
    setFinalScore(score);
    
    const result = await completeChallenge(
      challengeData.id,
      challengeType,
      challengeData.title,
      score
    );
    setEarnedXP(result.xp);
    setIsCompleted(true);
  };

  const handleReset = () => {
    setTypedText('');
    setTypingTimer(60);
    setTypingStarted(false);
    setTypingErrors([]);
    setMemoryPhase('show');
    setMemoryTimer(10);
    setMemoryInput('');
    setMemoryScore(0);
    setCurrentProblemIndex(0);
    setMathTimer(30);
    setMathScore(0);
    setSelectedAnswer(null);
    setAnswerFeedback(null);
    setIsCompleted(false);
    setEarnedXP(0);
    setFinalScore(0);
  };

  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  const renderTypingChallenge = () => (
    <View style={styles.challengeContent}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Time Remaining</Text>
        <Text style={styles.timerText}>{typingTimer}s</Text>
      </View>

      <View style={styles.targetTextContainer}>
        <Text style={styles.targetTextLabel}>Type this text:</Text>
        <Text style={styles.targetText}>{TYPING_TARGET_TEXT}</Text>
      </View>

      <View style={styles.typingInputContainer}>
        <Text style={styles.inputLabel}>Your typing:</Text>
        <ScrollView style={styles.typingScrollView}>
          <Text style={styles.typedText}>
            {typedText.split('').map((char, index) => (
              <Text
                key={index}
                style={typingErrors.includes(index) ? styles.errorChar : styles.correctChar}
              >
                {char}
              </Text>
            ))}
          </Text>
        </ScrollView>
        <TextInput
          style={styles.hiddenInput}
          onChangeText={handleTypingChange}
          value={typedText}
          multiline
          autoFocus
          editable={!isCompleted}
        />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Characters: {typedText.length}</Text>
        <Text style={styles.statText}>Errors: {typingErrors.length}</Text>
      </View>

      {!isCompleted && (
        <TouchableOpacity 
          style={[styles.button, styles.submitButton]} 
          onPress={handleTypingComplete}
        >
          <Text style={styles.buttonText}>Finish Early</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMemoryChallenge = () => {
    if (memoryPhase === 'show') {
      return (
        <View style={styles.challengeContent}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Memorize in</Text>
            <Text style={styles.timerText}>{memoryTimer}s</Text>
          </View>

          <View style={styles.memorySequenceContainer}>
            <Text style={styles.memoryInstruction}>Remember this sequence:</Text>
            <View style={styles.sequenceRow}>
              {MEMORY_SEQUENCE.map((num, index) => (
                <View key={index} style={styles.sequenceBox}>
                  <Text style={styles.sequenceNumber}>{num}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    }

    if (memoryPhase === 'recall') {
      return (
        <View style={styles.challengeContent}>
          <Text style={styles.memoryInstruction}>Enter the sequence you saw:</Text>
          <TextInput
            style={styles.memoryInput}
            onChangeText={setMemoryInput}
            value={memoryInput}
            placeholder="e.g., 739281546"
            keyboardType="number-pad"
            autoFocus
          />
          <TouchableOpacity 
            style={[styles.button, styles.submitButton]} 
            onPress={handleMemorySubmit}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderMathChallenge = () => {
    const currentProblem = MATH_PROBLEMS[currentProblemIndex];

    return (
      <View style={styles.challengeContent}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Time Remaining</Text>
          <Text style={styles.timerText}>{mathTimer}s</Text>
        </View>

        <View style={styles.mathProblemContainer}>
          <Text style={styles.mathProblemLabel}>
            Problem {currentProblemIndex + 1} of {MATH_PROBLEMS.length}
          </Text>
          <Text style={styles.mathQuestion}>{currentProblem.question} = ?</Text>
        </View>

        <View style={styles.mathOptionsContainer}>
          {currentProblem.options.map((option, index) => {
            let buttonStyle = styles.mathOptionButton;
            if (selectedAnswer === option) {
              buttonStyle = answerFeedback === 'correct' 
                ? styles.mathOptionButtonCorrect 
                : styles.mathOptionButtonIncorrect;
            }

            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handleMathAnswer(option)}
                disabled={selectedAnswer !== null}
              >
                <Text style={styles.mathOptionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.mathScoreContainer}>
          <Text style={styles.mathScoreText}>
            Score: {mathScore} / {MATH_PROBLEMS.length}
          </Text>
        </View>
      </View>
    );
  };

  const renderResults = () => (
    <View style={styles.resultContainer}>
      <Text style={styles.resultTitle}>Challenge Complete!</Text>
      <Text style={styles.resultScore}>Score: {finalScore}/100</Text>
      <Text style={styles.resultXP}>+{earnedXP} XP</Text>
      
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToHome} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{challengeData.title}</Text>
        <Text style={styles.description}>{challengeData.description}</Text>
      </View>

      <ScrollView style={styles.content}>
        {!isCompleted && challengeType === 'typing' && renderTypingChallenge()}
        {!isCompleted && challengeType === 'memory' && renderMemoryChallenge()}
        {!isCompleted && challengeType === 'math' && renderMathChallenge()}
        {isCompleted && renderResults()}
      </ScrollView>
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
  },
  challengeContent: {
    padding: 16,
  },
  timerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  targetTextContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  targetTextLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  targetText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
  },
  typingInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  typingScrollView: {
    maxHeight: 120,
  },
  typedText: {
    fontSize: 18,
    lineHeight: 28,
  },
  correctChar: {
    color: '#34C759',
  },
  errorChar: {
    color: '#FF3B30',
    backgroundColor: '#FFE5E5',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statText: {
    fontSize: 16,
    color: '#666',
  },
  memorySequenceContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  memoryInstruction: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    color: '#000',
    textAlign: 'center',
  },
  sequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  sequenceBox: {
    width: 60,
    height: 60,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sequenceNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  memoryInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  mathProblemContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mathProblemLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  mathQuestion: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  mathOptionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  mathOptionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  mathOptionButtonCorrect: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#34C759',
  },
  mathOptionButtonIncorrect: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  mathOptionText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
  },
  mathScoreContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mathScoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
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
    padding: 16,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  resultXP: {
    fontSize: 24,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
});

export default ChallengeScreen;
