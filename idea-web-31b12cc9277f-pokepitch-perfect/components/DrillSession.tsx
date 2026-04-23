import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Drill, DrillResult } from '../lib/types';
import { calculateScore, generateAimTargets, Target, UserInput } from '../lib/drills';
import { Ionicons } from '@expo/vector-icons';

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

  const handleComplete = () => {
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

            {difficultyChange !== null && (
              <View style={[
                styles.difficultyChangeIndicator,
                difficultyChange > 0 ? styles.increase : styles.decrease
              ]}>
                <Ionicons
                  name={difficultyChange > 0 ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={difficultyChange > 0 ? '#4CAF50' : '#F44336'}
                />
                <Text style={styles.difficultyChangeText}>
                  {Math.abs(difficultyChange)}%
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.resultScore}>Score: {result.score}</Text>
          <Text style={styles.resultDetail}>Accuracy: {result.accuracy}%</Text>
          <Text style={styles.resultDetail}>Reaction Time: {result.reactionTime}ms</Text>
          <Text style={styles.resultDetail}>Consistency: {result.consistency}%</Text>

          <TouchableOpacity style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.drillName}>{drill.name}</Text>
            <View style={styles.difficultyContainer}>
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
            </View>
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{timeLeft}</Text>
            <Text style={styles.stats}>Hits: {userInputs.filter(i => i.isHit).length} | Misses: {userInputs.filter(i => !i.isHit).length}</Text>
          </View>

          <TouchableOpacity
            style={styles.targetsContainer}
            activeOpacity={1}
            onPress={handleMissPress}
          >
            {targets.map((target) => (
              <AnimatedTarget
                key={target.id}
                target={target}
                onPress={handleTargetPress}
              />
            ))}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

interface AnimatedTargetProps {
  target: Target;
  onPress: (targetId: string) => void;
}

function AnimatedTarget({ target, onPress }: AnimatedTargetProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: target.x - TARGET_SIZE / 2,
    top: target.y - TARGET_SIZE / 2,
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.targetButton}
        onPress={() => onPress(target.id)}
      >
        <Text style={styles.targetText}>Tap</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  drillName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  difficultyBar: {
    height: 8,
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  difficultyFill: {
    height: '100%',
    borderRadius: 4,
  },
  difficultyValue: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    minWidth: 30,
    textAlign: 'right',
  },
  timerContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stats: {
    fontSize: 14,
    color: '#666',
  },
  targetsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  targetButton: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetText: {
    color: 'white',
    fontWeight: 'bold',
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
    marginBottom: 20,
  },
  resultScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resultDetail: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  difficultySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 300,
  },
  difficultyChangeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  increase: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  decrease: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  difficultyChangeText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
