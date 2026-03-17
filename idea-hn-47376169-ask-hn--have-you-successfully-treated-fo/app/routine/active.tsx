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
  const [showCalibrationModal, setShowCalibrationModal] = useState(false); // Initially false
  const [hasCalibratedForSession, setHasCalibratedForSession] = useState(false); // New state to track calibration for current routine session
  const [holdTimer, setHoldTimer] = useState(0);
  const [isHoldingCorrectly, setIsHoldingCorrectly] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isDetectorLoading, setIsDetectorLoading] = useState(true); // To wait for MotionDetector to load calibration

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
      // Calibration modal logic is now handled by initial check and hasCalibratedForSession
      playSound('start');
    } else {
      setIsComplete(true);
      completeExercise(currentExercise.id); // Assuming currentExercise is still valid here
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
    setHasCalibratedForSession(true); // Calibration is done for this session
    playSound('start');
  }, [playSound]);

  const handleInitialCalibrationStatusLoaded = useCallback((calibrated: boolean) => {
    setIsDetectorLoading(false);
    if (!calibrated) {
      setShowCalibrationModal(true); // Show modal if not calibrated initially
    } else {
      setHasCalibratedForSession(true); // Already calibrated from previous session, no need to show modal
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

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          {isHoldingCorrectly
            ? `Hold: ${holdTimer}/${currentExercise.duration}s`
            : 'Adjust your posture'}
        </Text>
      </View>

      <MotionDetector
        exerciseId={currentExercise.id}
        onCalibrationComplete={handleCalibrationComplete}
        onPostureCorrect={handlePostureCorrect}
        onInitialCalibrationStatusLoaded={handleInitialCalibrationStatusLoaded}
      />

      {isHoldingCorrectly && (
        <TouchableOpacity
          style={[styles.nextButton, holdTimer >= currentExercise.duration ? styles.nextButtonActive : {}]}
          onPress={handleNextExercise}
          disabled={holdTimer < currentExercise.duration}
        >
          <Text style={styles.nextButtonText}>Next Exercise</Text>
        </TouchableOpacity>
      )}

      {/* Only show modal if calibration is required AND not yet calibrated for this session */}
      <Modal
        visible={showCalibrationModal && !hasCalibratedForSession}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Calibration Required</Text>
            <Text style={styles.modalText}>
              To ensure accurate posture detection, please calibrate your device.
            </Text>
            <Text style={styles.modalText}>
              Hold your phone in your ideal posture for the {currentExercise.name} exercise and tap "Start Calibration" below.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCalibrationModal(false)} // Allow dismissing the modal, but calibration still needed
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
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  instructions: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#444',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#007AFF',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
    textAlign: 'center',
    marginVertical: 20,
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
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
