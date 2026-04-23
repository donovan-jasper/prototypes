import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, ProgressBarAndroid, ProgressViewIOS } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { MotionDetector } from '@/components/MotionDetector';
import { postureDetector } from '@/lib/motion';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ActiveRoutineScreen() {
  const { exercises, completeExercise, incrementStreak, updateActiveRoutine } = useStore();
  const router = useRouter();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [hasCalibratedForSession, setHasCalibratedForSession] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isDetectorLoading, setIsDetectorLoading] = useState(true);

  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playSound = async (type: 'start' | 'complete' | 'error' | 'next') => {
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
        case 'next':
          source = require('../../assets/sounds/next.mp3');
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

  const handleExerciseComplete = useCallback(() => {
    playSound('complete');
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prevIndex => prevIndex + 1);
      playSound('next');
    } else {
      setIsComplete(true);
      completeExercise(currentExercise.id);
      incrementStreak();
      playSound('complete');
    }
  }, [currentExerciseIndex, exercises, completeExercise, incrementStreak, playSound, currentExercise]);

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
        <View style={styles.completionContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.title}>Routine Complete!</Text>
          <Text style={styles.subtitle}>You've completed your daily routine.</Text>
          <Text style={styles.streakText}>Streak: +1 day</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isDetectorLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading exercise detector...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
        <Text style={styles.exerciseSubtitle}>
          Exercise {currentExerciseIndex + 1} of {exercises.length}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionsText}>{currentExercise.instructions}</Text>
      </View>

      <View style={styles.detectorContainer}>
        <MotionDetector
          exerciseId={currentExercise.id}
          requiredDuration={currentExercise.duration * 1000}
          onExerciseComplete={handleExerciseComplete}
          onCalibrationComplete={handleCalibrationComplete}
          onInitialCalibrationStatusLoaded={handleInitialCalibrationStatusLoaded}
        />
      </View>

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
              This helps the app understand your correct posture.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCalibrationModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it!</Text>
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
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  exerciseSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  instructionsContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  instructionsText: {
    fontSize: 16,
    lineHeight: 22,
  },
  detectorContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  streakText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
