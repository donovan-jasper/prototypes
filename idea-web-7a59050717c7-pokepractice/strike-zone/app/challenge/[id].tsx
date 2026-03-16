import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import TimerDisplay from '../../components/TimerDisplay';
import { startChallenge, validateHit } from '../../lib/challenges';
import { calculateScore } from '../../lib/scoring';
import { savePerformance } from '../../lib/database';

const ChallengeScreen = () => {
  const { id } = useLocalSearchParams();
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(null);
  const [targets, setTargets] = useState([]);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    const challenge = startChallenge(id);
    setTargets(challenge.targets);

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          const result = calculateScore({ hits, total: challenge.targets.length, timeMs: 30000 });
          setScore(result);
          savePerformance({
            challengeId: id,
            score: result.score,
            accuracy: result.accuracy,
            timestamp: Date.now(),
          });
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [id]);

  const handleTap = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const tap = { x: locationX, y: locationY };

    targets.forEach((target, index) => {
      if (validateHit(tap, target)) {
        setHits((prevHits) => prevHits + 1);
        setTargets((prevTargets) => prevTargets.filter((_, i) => i !== index));
      }
    });
  };

  return (
    <View style={styles.container} onTouchStart={handleTap}>
      <TimerDisplay timeLeft={timeLeft} />
      {score && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {score.score}</Text>
          <Text style={styles.accuracyText}>Accuracy: {score.accuracy}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scoreContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  accuracyText: {
    fontSize: 18,
  },
});

export default ChallengeScreen;
