import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { MotionDetector } from '@/components/MotionDetector';
import { postureDetector } from '@/lib/motion';
import { Audio } from 'expo-av';

export default function ActiveRoutineScreen() {
  const { exercises, completeExercise, incrementStreak } = useStore();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [hasCalibratedForSession, setHasCalibratedForSession] = useState(false);
  const [holdTimer, setHoldTimer] = useState(0);
  const [isHoldingCorrectly, setIsHoldingCorrectly] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isDetectorLoading, setIsDetectorLoading] = useState(true);

  const currentExercise = exercises[currentExerciseIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playSound = async (type: 'start' | 'complete' | 'error') => {
    try {
      const soundObject = new Audio.Sound();
      let source;

      switch (type) {
        case 'start':
          source = require('../../assets/sounds/start.mp3');
          break;
        case 'complete':
          source = require('../../assets/sounds/complete.mp3');
          break;
        case 'error':
          source = require('../../assets/sounds/error.mp3');
          break;
        default:
          return;
      }

      await soundObject.loadAsync(source);
      await soundObject.playAsync();
      setSound(soundObject);
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleNextExercise = useCallback(() => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prevIndex => prevIndex + 1);
      setHoldTimer(0);
      setIsHoldingCorrectly(false);
      playSound('start');
    } else {
      setIsComplete(true);
      completeExercise(currentExercise.id);
      incrementStreak();
      playSound('complete');
    }
  }, [currentExerciseIndex, exercises, completeExercise, incrementStreak, playSound, currentExercise]);

  const handlePostureCorrect = useCallback(() => {
    if (!isHoldingCorrectly) {
      setIsHoldingCorrectly(true);
      playSound('start');

      timerRef.current = setInterval(() => {
        setHoldTimer(prev => {
          const newTime = prev + 1;
          const isExerciseComplete = postureDetector.isHoldingCorrectly(
            newTime * 1000,
            currentExercise.duration * 1000,
            currentExercise.id
          );

          if (isExerciseComplete) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            playSound('complete');
            return currentExercise.duration;
          }

          return newTime;
        });
      }, 1000);
    }
  }, [isHoldingCorrectly, playSound, currentExercise]);

  const handleCalibrationComplete = useCallback(() => {
    setShowCalibrationModal(false);
    setHasCalibratedForSession(true);
    playSound('start');
  }, [playSound]);

  const handleInitialCalibrationStatusLoaded = useCallback((calibrated: boolean) => {
    setIsDetectorLoading(false);
    if (!calibrated) {
      setShowCalibrationModal(true);
    } else {
      setHasCalibratedForSession(true);
    }
  }, []);

  if (isComplete) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Routine Complete!</Text>
        <Text style={styles.subtitle}>You've completed your daily routine.</Text>
        <Text style={styles.streakText}>Streak: +1 day</Text>
        <TouchableOpacity style={styles.button} onPress={() => setIsComplete(false)}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isDetectorLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.title}>Preparing Motion Detector...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentExercise.name}</Text>
      <Text style={styles.instructions}>{currentExercise.instructions}</Text>

      <MotionDetector
        exerciseId={currentExercise.id}
        onCalibrationComplete={handleCalibrationComplete}
        onPostureCorrect={handlePostureCorrect}
        onInitialCalibrationStatusLoaded={handleInitialCalibrationStatusLoaded}
      />

      {hasCalibratedForSession && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {isHoldingCorrectly ? `Hold: ${holdTimer}s / ${currentExercise.duration}s` : "Adjust your posture"}
          </Text>
          {isHoldingCorrectly && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(holdTimer / currentExercise.duration) * 100}%` }
                ]}
              />
            </View>
          )}
        </View>
      )}

      {isHoldingCorrectly && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNextExercise}
          disabled={holdTimer < currentExercise.duration}
        >
          <Text style={styles.nextButtonText}>
            {currentExerciseIndex < exercises.length - 1 ? "Next Exercise" : "Complete Routine"}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showCalibrationModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Calibration Required</Text>
            <Text style={styles.modalText}>
              Please hold your phone steady in your ideal posture for the current exercise.
            </Text>
            <Text style={styles.modalText}>
              This helps the app understand your correct posture for this exercise.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCalibrationModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  timerContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 18,
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    width: '80%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  streakText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
