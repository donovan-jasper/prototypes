import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { Drill, DrillResult } from '../lib/types';
import { calculateScore, generateAimTargets, Target, UserInput } from '../lib/drills';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';

interface DrillSessionProps {
  drill: Drill;
  onComplete: (result: DrillResult) => void;
  result: DrillResult | null;
  onContinue: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TARGET_SIZE = 60;

export default function DrillSession({ drill, onComplete, result, onContinue }: DrillSessionProps) {
  const [targets, setTargets] = useState<Target[]>([]);
  const [userInputs, setUserInputs] = useState<UserInput[]>([]);
  const [timeLeft, setTimeLeft] = useState(drill.duration);
  const [isActive, setIsActive] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState(drill.difficulty);
  const [difficultyChange, setDifficultyChange] = useState<number | null>(null);
  const [showDifficultyAnimation, setShowDifficultyAnimation] = useState(false);
  const difficultyAnimation = useRef(new Animated.Value(0)).current;

  const { submitResult } = useStore();

  useEffect(() => {
    if (drill.type === 'aim') {
      const initialTargets = generateAimTargets(5, {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT - 200,
      }, difficultyLevel);
      setTargets(initialTargets);
    }
  }, [drill, difficultyLevel]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleComplete();
    }
  }, [isActive, timeLeft]);

  const handleComplete = async () => {
    setIsActive(false);
    const score = calculateScore(targets, userInputs, timeLeft);
    const drillResult: DrillResult = {
      drillId: drill.id,
      score: score.total,
      accuracy: score.accuracy,
      reactionTime: score.reactionTime,
      consistency: score.consistency,
      timestamp: new Date().toISOString(),
      difficulty: difficultyLevel,
    };

    // Submit result to store which will handle difficulty adjustment
    await submitResult(drillResult);

    // Get the updated difficulty from the store
    const updatedDifficulty = useStore.getState().drills.find(d => d.id === drill.id)?.difficulty || difficultyLevel;

    // Calculate difficulty change
    const change = updatedDifficulty - difficultyLevel;
    setDifficultyChange(change);
    setDifficultyLevel(updatedDifficulty);

    if (change !== 0) {
      setShowDifficultyAnimation(true);
      Animated.sequence([
        Animated.timing(difficultyAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(difficultyAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowDifficultyAnimation(false);
      });
    }

    onComplete(drillResult);
  };

  const handleTargetPress = (targetId: string) => {
    if (!isActive) return;

    const target = targets.find(t => t.id === targetId);
    if (!target) return;

    const reactionTime = Date.now() - target.timestamp;

    const input: UserInput = {
      targetId,
      timestamp: Date.now(),
      isHit: true,
      reactionTime,
    };

    setUserInputs([...userInputs, input]);
    setTargets(prevTargets => prevTargets.filter(t => t.id !== targetId));

    const newTarget = generateAimTargets(1, {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT - 200,
    }, difficultyLevel)[0];
    setTargets(prevTargets => [...prevTargets, newTarget]);
  };

  const handleMissPress = () => {
    if (!isActive) return;

    const input: UserInput = {
      targetId: null,
      timestamp: Date.now(),
      isHit: false,
    };

    setUserInputs([...userInputs, input]);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 0.3) return '#4CAF50'; // Green for easy
    if (difficulty < 0.7) return '#FFC107'; // Yellow for medium
    return '#F44336'; // Red for hard
  };

  const difficultyAnimationStyle = {
    transform: [
      {
        translateY: difficultyAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
      {
        scale: difficultyAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
    opacity: difficultyAnimation,
  };

  return (
    <View style={styles.container}>
      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Drill Complete!</Text>

          <View style={styles.difficultySummary}>
            <Text style={styles.difficultyLabel}>Difficulty:</Text>
            <View style={styles.difficultyBar}>
              <View
                style={[
                  styles.difficultyFill,
                  {
                    width: `${Math.round(difficultyLevel * 100)}%`,
                    backgroundColor: getDifficultyColor(difficultyLevel)
                  }
                ]}
              />
            </View>
            <Text style={styles.difficultyValue}>{Math.round(difficultyLevel * 100)}%</Text>

            {showDifficultyAnimation && (
              <Animated.View style={[styles.difficultyChangeIndicator, difficultyAnimationStyle]}>
                <Ionicons
                  name={difficultyChange && difficultyChange > 0 ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={difficultyChange && difficultyChange > 0 ? '#4CAF50' : '#F44336'}
                />
                <Text style={[
                  styles.difficultyChangeText,
                  { color: difficultyChange && difficultyChange > 0 ? '#4CAF50' : '#F44336' }
                ]}>
                  {difficultyChange && Math.abs(Math.round(difficultyChange * 100))}%
                </Text>
              </Animated.View>
            )}
          </View>

          <Text style={styles.resultScore}>Score: {result.score}</Text>
          <Text style={styles.resultDetail}>Accuracy: {result.accuracy}%</Text>
          <Text style={styles.resultDetail}>Reaction Time: {result.reactionTime}ms</Text>
          <Text style={styles.resultDetail}>Consistency: {result.consistency}%</Text>

          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeLeft}s</Text>
          </View>

          <TouchableOpacity
            style={styles.missArea}
            activeOpacity={1}
            onPress={handleMissPress}
          >
            {targets.map((target) => (
              <TouchableOpacity
                key={target.id}
                style={[
                  styles.target,
                  {
                    left: target.position.x - TARGET_SIZE / 2,
                    top: target.position.y - TARGET_SIZE / 2,
                    backgroundColor: target.color,
                  }
                ]}
                onPress={() => handleTargetPress(target.id)}
              />
            ))}
          </TouchableOpacity>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {calculateScore(targets, userInputs, timeLeft).total}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  timerContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  missArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  target: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scoreContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 10,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
  },
  resultScore: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  resultDetail: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  continueButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  difficultySummary: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  difficultyLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  difficultyBar: {
    width: '80%',
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  difficultyFill: {
    height: '100%',
    borderRadius: 5,
  },
  difficultyValue: {
    color: 'white',
    fontSize: 14,
  },
  difficultyChangeIndicator: {
    position: 'absolute',
    top: -30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 15,
  },
  difficultyChangeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  increase: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  decrease: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
});
