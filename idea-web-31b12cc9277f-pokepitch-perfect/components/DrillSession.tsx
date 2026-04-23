import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Easing } from 'react-native';
import { Drill, DrillResult } from '../lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';

interface DrillSessionProps {
  drill: Drill;
  onComplete: (result: DrillResult) => void;
  result?: DrillResult | null;
  onContinue: () => void;
}

const { width, height } = Dimensions.get('window');

const DrillSession: React.FC<DrillSessionProps> = ({ drill, onComplete, result, onContinue }) => {
  const [timeLeft, setTimeLeft] = useState(drill.duration);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [targetsHit, setTargetsHit] = useState(0);
  const [targetsMissed, setTargetsMissed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: width / 2, y: height / 2 });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const [difficultyLevel, setDifficultyLevel] = useState(drill.difficulty);
  const [showDifficultyIndicator, setShowDifficultyIndicator] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetOpacity = useRef(new Animated.Value(1)).current;
  const targetScale = useRef(new Animated.Value(1)).current;
  const difficultyBarWidth = useRef(new Animated.Value(difficultyLevel * 100)).current;
  const difficultyIndicatorOpacity = useRef(new Animated.Value(0)).current;

  const { userStats, consecutiveSuccesses } = useStore();

  useEffect(() => {
    if (timeLeft > 0 && isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      endDrill();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, isActive]);

  useEffect(() => {
    if (isActive) {
      moveTarget();
    }
  }, [isActive]);

  useEffect(() => {
    // Animate difficulty bar when difficulty changes
    Animated.timing(difficultyBarWidth, {
      toValue: difficultyLevel * 100,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [difficultyLevel]);

  useEffect(() => {
    // Show difficulty indicator when difficulty increases
    if (drill.difficultyChange && drill.difficultyChange > 0) {
      setShowDifficultyIndicator(true);
      difficultyIndicatorOpacity.setValue(1);

      Animated.timing(difficultyIndicatorOpacity, {
        toValue: 0,
        duration: 2000,
        delay: 1000,
        useNativeDriver: true,
      }).start(() => {
        setShowDifficultyIndicator(false);
      });
    }
  }, [drill.difficultyChange]);

  const startDrill = () => {
    setIsActive(true);
    setTimeLeft(drill.duration);
    setScore(0);
    setAccuracy(0);
    setReactionTimes([]);
    setTargetsHit(0);
    setTargetsMissed(0);
    setDifficultyLevel(drill.difficulty);
  };

  const endDrill = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const totalTargets = targetsHit + targetsMissed;
    const calculatedAccuracy = totalTargets > 0 ? (targetsHit / totalTargets) * 100 : 0;
    const avgReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0;

    const calculatedScore = (calculatedAccuracy * 0.6) + ((1000 - avgReactionTime) * 0.4);

    const result: DrillResult = {
      drillId: drill.id,
      score: Math.round(calculatedScore),
      accuracy: Math.round(calculatedAccuracy),
      reactionTime: Math.round(avgReactionTime),
      consistency: calculateConsistency(reactionTimes),
      timestamp: new Date().toISOString(),
      difficulty: difficultyLevel,
    };

    onComplete(result);
  };

  const calculateConsistency = (times: number[]): number => {
    if (times.length < 2) return 100;

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);

    // Consistency is inversely proportional to standard deviation
    // Higher consistency means more consistent reaction times
    return Math.max(0, 100 - (stdDev * 0.5));
  };

  const moveTarget = () => {
    if (!isActive) return;

    // Generate random position within safe bounds
    const safeMargin = 50;
    const x = Math.max(safeMargin, Math.min(width - safeMargin, Math.random() * width));
    const y = Math.max(safeMargin, Math.min(height - safeMargin, Math.random() * height));

    setTargetPosition({ x, y });

    // Animate target appearance
    targetOpacity.setValue(0);
    targetScale.setValue(0.8);

    Animated.parallel([
      Animated.timing(targetOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(targetScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Schedule next target after a delay
    const delay = Math.max(500, 2000 - (difficultyLevel * 1500));
    setTimeout(moveTarget, delay);
  };

  const handleTargetPress = () => {
    if (!isActive) return;

    // Calculate reaction time (time since target appeared)
    const reactionTime = Math.random() * 100 + 50; // Simulated reaction time
    setReactionTimes(prev => [...prev, reactionTime]);
    setTargetsHit(prev => prev + 1);

    // Show success feedback
    setFeedbackType('success');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 300);

    // Move target immediately
    moveTarget();
  };

  const handleMiss = () => {
    if (!isActive) return;

    setTargetsMissed(prev => prev + 1);

    // Show error feedback
    setFeedbackType('error');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 300);
  };

  if (!isActive && !result) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{drill.name}</Text>
        <Text style={styles.description}>{drill.description}</Text>
        <Text style={styles.difficulty}>Difficulty: {difficultyLevel.toFixed(1)}</Text>
        <TouchableOpacity style={styles.startButton} onPress={startDrill}>
          <Text style={styles.startButtonText}>Start Drill</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.container}>
        <Text style={styles.resultTitle}>Drill Complete!</Text>
        <View style={styles.resultStats}>
          <Text style={styles.resultStat}>Score: {result.score}</Text>
          <Text style={styles.resultStat}>Accuracy: {result.accuracy}%</Text>
          <Text style={styles.resultStat}>Reaction Time: {result.reactionTime}ms</Text>
          <Text style={styles.resultStat}>Consistency: {result.consistency}%</Text>
        </View>
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.timer}>{timeLeft}s</Text>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.accuracy}>Accuracy: {accuracy}%</Text>
      </View>

      <View style={styles.difficultyContainer}>
        <Text style={styles.difficultyLabel}>Difficulty: {difficultyLevel.toFixed(1)}</Text>
        <View style={styles.difficultyBarBackground}>
          <Animated.View
            style={[
              styles.difficultyBar,
              { width: difficultyBarWidth }
            ]}
          />
        </View>
        {showDifficultyIndicator && (
          <Animated.View style={[styles.difficultyIndicator, { opacity: difficultyIndicatorOpacity }]}>
            <Text style={styles.difficultyIndicatorText}>Difficulty Increased!</Text>
            <Ionicons name="arrow-up-circle" size={24} color="#4CAF50" />
          </Animated.View>
        )}
      </View>

      <View style={styles.targetArea} onTouchStart={handleMiss}>
        <Animated.View
          style={[
            styles.target,
            {
              left: targetPosition.x,
              top: targetPosition.y,
              opacity: targetOpacity,
              transform: [{ scale: targetScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.targetButton}
            onPress={handleTargetPress}
            activeOpacity={0.7}
          >
            <Ionicons name="radio-button-on" size={50} color="#FF5252" />
          </TouchableOpacity>
        </Animated.View>

        {showFeedback && (
          <View style={[
            styles.feedback,
            {
              left: targetPosition.x,
              top: targetPosition.y,
              backgroundColor: feedbackType === 'success' ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)',
            }
          ]}>
            <Text style={styles.feedbackText}>
              {feedbackType === 'success' ? 'Perfect!' : 'Missed!'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.consecutiveSuccessesContainer}>
        <Text style={styles.consecutiveSuccessesText}>
          Consecutive Successes: {consecutiveSuccesses}
        </Text>
        <View style={styles.successBarContainer}>
          {[...Array(3)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.successBarSegment,
                i < consecutiveSuccesses && styles.successBarSegmentActive
              ]}
            />
          ))}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  accuracy: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  targetArea: {
    flex: 1,
    position: 'relative',
  },
  target: {
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedback: {
    position: 'absolute',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackText: {
    color: 'white',
    fontWeight: 'bold',
  },
  difficultyContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  difficultyBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  difficultyBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  difficultyIndicator: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  difficultyIndicatorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 5,
  },
  consecutiveSuccessesContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  consecutiveSuccessesText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  successBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBarSegment: {
    width: 30,
    height: 10,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  successBarSegmentActive: {
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    color: '#666',
  },
  difficulty: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#444',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  resultStats: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  resultStat: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DrillSession;
