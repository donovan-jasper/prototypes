import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Vibration } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { useStore } from '../lib/store/useStore';

interface WakeSequenceProps {
  onDismiss: () => void;
  sessionId: string;
}

const WakeSequence: React.FC<WakeSequenceProps> = ({ onDismiss, sessionId }) => {
  const [stage, setStage] = useState(0);
  const [shakeDetected, setShakeDetected] = useState(false);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [energyRating, setEnergyRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [mathProblem, setMathProblem] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const soundObject = useRef<Audio.Sound | null>(null);

  const { updateSessionEnergyRating } = useStore();

  // Generate a simple math problem
  useEffect(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setMathProblem({
      question: `${num1} + ${num2} = ?`,
      answer: num1 + num2
    });
  }, []);

  // Shake detection
  useEffect(() => {
    let subscription: any;

    if (stage >= 2) {
      subscription = Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;
        const acceleration = Math.sqrt(x * x + y * y + z * z);

        if (acceleration > 2.5 && !isShaking) {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 1000);

          if (stage === 2) {
            setShakeDetected(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }
      });

      Accelerometer.setUpdateInterval(100);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [stage, isShaking]);

  // Wake sequence progression
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (stage === 0) {
      // Fade in audio
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start();

      timer = setTimeout(() => {
        setStage(1);
      }, 3000);
    } else if (stage === 1) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      timer = setTimeout(() => {
        setStage(2);
      }, 5000);
    } else if (stage === 2) {
      // Haptic pulses
      const hapticInterval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 1500);

      timer = setTimeout(() => {
        clearInterval(hapticInterval);
        setStage(3);
      }, 8000);
    } else if (stage === 3) {
      // Final alarm
      playAlarmSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      timer = setTimeout(() => {
        // If user hasn't dismissed by now, auto-dismiss
        if (!shakeDetected && !puzzleSolved) {
          setShowRating(true);
        }
      }, 5000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [stage, shakeDetected, puzzleSolved]);

  const playAlarmSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/alarm.mp3'),
        { shouldPlay: true, volume: 1.0 }
      );
      soundObject.current = sound;
    } catch (error) {
      console.log('Error playing alarm sound', error);
    }
  };

  const handleShakeDismiss = () => {
    if (stage >= 2) {
      setShakeDetected(true);
      setShowRating(true);
    }
  };

  const handlePuzzleSubmit = () => {
    if (parseInt(userAnswer) === mathProblem.answer) {
      setPuzzleSolved(true);
      setShowRating(true);
    } else {
      alert('Incorrect answer. Try again!');
    }
  };

  const handleRatingSubmit = async () => {
    if (energyRating > 0) {
      await updateSessionEnergyRating(sessionId, energyRating);
      onDismiss();
    }
  };

  const renderStageContent = () => {
    if (showRating) {
      return (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>How do you feel?</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setEnergyRating(star)}
                style={styles.starButton}
              >
                <Text style={[
                  styles.starText,
                  energyRating >= star && styles.selectedStar
                ]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleRatingSubmit}
            disabled={energyRating === 0}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (stage) {
      case 0:
        return (
          <Animated.View style={[styles.stageContainer, { opacity: fadeAnim }]}>
            <Text style={styles.stageText}>Waking up gently...</Text>
          </Animated.View>
        );
      case 1:
        return (
          <Animated.View style={[styles.stageContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.stageText}>Getting your attention...</Text>
          </Animated.View>
        );
      case 2:
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.stageText}>Shake your phone to wake up</Text>
            <Text style={styles.instructionText}>
              {isShaking ? 'Shaking detected!' : 'Shake gently to dismiss'}
            </Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.stageText}>ALARM!</Text>
            <Text style={styles.instructionText}>Solve the puzzle or shake to dismiss</Text>
            <View style={styles.puzzleContainer}>
              <Text style={styles.puzzleText}>{mathProblem.question}</Text>
              <TextInput
                style={styles.puzzleInput}
                keyboardType="numeric"
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="Your answer"
              />
              <TouchableOpacity
                style={styles.puzzleButton}
                onPress={handlePuzzleSubmit}
              >
                <Text style={styles.puzzleButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderStageContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stageContainer: {
    alignItems: 'center',
  },
  stageText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionText: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
  },
  ratingTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    padding: 10,
  },
  starText: {
    fontSize: 30,
    color: '#555',
  },
  selectedStar: {
    color: '#FFD700',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
  },
  puzzleContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    marginTop: 20,
  },
  puzzleText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  puzzleInput: {
    backgroundColor: '#333',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
  puzzleButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  puzzleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WakeSequence;
