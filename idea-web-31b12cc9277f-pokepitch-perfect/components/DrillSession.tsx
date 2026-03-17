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

  useEffect(() => {
    if (drill.type === 'aim') {
      const initialTargets = generateAimTargets(5, {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT - 200,
      });
      setTargets(initialTargets);
    }
  }, [drill]);

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
      score,
      accuracy: score.accuracy,
      reactionTime: score.reactionTime,
      consistency: score.consistency,
      timestamp: new Date().toISOString(),
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
    })[0];
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
          <Text style={styles.resultScore}>Score: {result.score.total}</Text>
          <Text style={styles.resultDetail}>Accuracy: {result.score.accuracy}%</Text>
          <Text style={styles.resultDetail}>Reaction Time: {result.score.reactionTime}ms</Text>
          <Text style={styles.resultDetail}>Consistency: {result.score.consistency}%</Text>
          <TouchableOpacity style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
    backgroundColor: '#f5f5f5',
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#673ab7',
  },
  stats: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  targetsContainer: {
    flex: 1,
    position: 'relative',
  },
  targetWrapper: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
  },
  target: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: '#673ab7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  targetInner: {
    width: TARGET_SIZE / 3,
    height: TARGET_SIZE / 3,
    borderRadius: TARGET_SIZE / 6,
    backgroundColor: '#fff',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#673ab7',
  },
  resultScore: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  resultDetail: {
    fontSize: 18,
    marginBottom: 12,
    color: '#666',
  },
  button: {
    backgroundColor: '#673ab7',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginTop: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
