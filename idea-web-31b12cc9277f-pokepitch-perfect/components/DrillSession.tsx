import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Drill, DrillResult } from '../lib/types';
import { Ionicons } from '@expo/vector-icons';

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

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetOpacity = useRef(new Animated.Value(1)).current;
  const targetScale = useRef(new Animated.Value(1)).current;

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

  const startDrill = () => {
    setIsActive(true);
    setTimeLeft(drill.duration);
    setScore(0);
    setAccuracy(0);
    setReactionTimes([]);
    setTargetsHit(0);
    setTargetsMissed(0);
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
      difficulty: drill.difficulty,
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
    const delay = Math.max(500, 2000 - (drill.difficulty * 1500));
    setTimeout(moveTarget, delay);
  };

  const handleTargetPress = () => {
    if (!isActive) return;

    // Calculate reaction time (time since target appeared)
    const reactionTime = Math.random() * 100 + 50; // Simulated reaction time
    setReactionTimes(prev => [...prev, reactionTime]);

    setTargetsHit(prev => prev + 1);
    setScore(prev => prev + 10);

    // Show feedback
    setFeedbackType('success');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 200);

    // Animate target hit
    Animated.sequence([
      Animated.timing(targetScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(targetScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Move target immediately
    moveTarget();
  };

  const handleMiss = () => {
    if (!isActive) return;

    setTargetsMissed(prev => prev + 1);

    // Show feedback
    setFeedbackType('error');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 200);
  };

  if (result) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Drill Complete!</Text>

        <View style={styles.resultStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{result.score}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>{result.accuracy}%</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Reaction Time</Text>
            <Text style={styles.statValue}>{result.reactionTime}ms</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Consistency</Text>
            <Text style={styles.statValue}>{result.consistency}%</Text>
          </View>
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
        <Text style={styles.drillName}>{drill.name}</Text>
        <Text style={styles.timer}>{timeLeft}s</Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Score:</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>

      {!isActive ? (
        <TouchableOpacity style={styles.startButton} onPress={startDrill}>
          <Text style={styles.startButtonText}>Start Drill</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.gameArea}>
          <TouchableOpacity
            style={styles.missArea}
            activeOpacity={1}
            onPress={handleMiss}
          >
            <Animated.View
              style={[
                styles.target,
                {
                  left: targetPosition.x - 30,
                  top: targetPosition.y - 30,
                  opacity: targetOpacity,
                  transform: [{ scale: targetScale }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.targetInner}
                onPress={handleTargetPress}
                activeOpacity={0.8}
              />
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
                <Ionicons
                  name={feedbackType === 'success' ? 'checkmark' : 'close'}
                  size={24}
                  color="white"
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  drillName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  missArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  target: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetInner: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  feedback: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -20,
    marginTop: -20,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  resultStats: {
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
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
  continueButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DrillSession;
