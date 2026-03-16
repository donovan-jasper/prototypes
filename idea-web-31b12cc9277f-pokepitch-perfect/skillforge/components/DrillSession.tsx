import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Drill, DrillResult } from '../lib/types';
import { calculateScore, validateDrillCompletion } from '../lib/drills';

interface DrillSessionProps {
  drill: Drill;
  onComplete: (result: DrillResult) => void;
  result: DrillResult | null;
}

export default function DrillSession({ drill, onComplete, result }: DrillSessionProps) {
  const [targets, setTargets] = useState<number[]>([]);
  const [userInputs, setUserInputs] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(drill.duration);
  const [isActive, setIsActive] = useState(true);

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

  const handleInput = (input: number) => {
    if (isActive) {
      setUserInputs([...userInputs, input]);
    }
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
          <TouchableOpacity style={styles.button} onPress={() => setResult(null)}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{timeLeft}</Text>
          </View>
          <View style={styles.targetsContainer}>
            {targets.map((target, index) => (
              <View key={index} style={styles.target} />
            ))}
          </View>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.inputButton} onPress={() => handleInput(1)}>
              <Text style={styles.inputButtonText}>Tap</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#673ab7',
  },
  targetsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  target: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#673ab7',
    marginBottom: 16,
  },
  inputContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  inputButton: {
    backgroundColor: '#673ab7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  inputButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  resultScore: {
    fontSize: 20,
    marginBottom: 16,
  },
  resultDetail: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#673ab7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
