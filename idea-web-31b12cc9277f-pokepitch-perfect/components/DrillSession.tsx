import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Drill, DrillResult } from '../lib/types';
import { calculateScore, generateAimTargets, Target, UserInput } from '../lib/drills';

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

  return (
    <View style={styles.container}>
      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Drill Complete!</Text>
          <Text style={styles.resultScore}>Score: {result.score}</Text>
          <Text style={styles.resultDetail}>Accuracy: {result.accuracy}%</Text>
          <Text style={styles.resultDetail}>Reaction Time: {result.reactionTime}ms</Text>
          <Text style={styles.resultDetail}>Consistency: {result.consistency}%</Text>
          <Text style={styles.resultDetail}>Difficulty: {Math.round(difficultyLevel * 100)}%</Text>
          <TouchableOpacity style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.drillName}>{drill.name}</Text>
            <Text style={styles.difficulty}>Difficulty: {Math.round(difficultyLevel * 100)}%</Text>
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
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.targetWrapper,
        {
          left: target.x,
          top: target.y,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        style={styles.target}
        onPress={() => onPress(target.id)}
        activeOpacity={0.7}
      >
        <View style={styles.targetInner} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
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
    marginBottom: 4,
  },
  difficulty: {
    fontSize: 16,
    color: '#666',
  },
  timerContainer: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stats: {
    fontSize: 16,
    color: '#666',
  },
  targetsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  targetWrapper: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  target: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetInner: {
    width: TARGET_SIZE * 0.7,
    height: TARGET_SIZE * 0.7,
    borderRadius: TARGET_SIZE * 0.35,
    backgroundColor: '#fff',
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
    marginBottom: 15,
  },
  resultDetail: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
