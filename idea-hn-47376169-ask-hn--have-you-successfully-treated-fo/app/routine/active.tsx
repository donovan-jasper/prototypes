import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, ProgressBarAndroid, ProgressViewIOS } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { MotionDetector } from '@/components/MotionDetector';
import { postureDetector } from '@/lib/motion';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ActiveRoutineScreen() {
  const { exercises, completeExercise, incrementStreak } = useStore();
  const router = useRouter();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [hasCalibratedForSession, setHasCalibratedForSession] = useState(false);
  const [holdTimer, setHoldTimer] = useState(0);
  const [isHoldingCorrectly, setIsHoldingCorrectly] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isDetectorLoading, setIsDetectorLoading] = useState(true);
  const [isExerciseComplete, setIsExerciseComplete] = useState(false);

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

  const handleNextExercise = useCallback(() => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prevIndex => prevIndex + 1);
      setHoldTimer(0);
      setIsHoldingCorrectly(false);
      setIsExerciseComplete(false);
      playSound('next');
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
          const isComplete = postureDetector.isHoldingCorrectly(
            newTime * 1000,
            currentExercise.duration * 1000,
            currentExercise.id
          );

          if (isComplete) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            playSound('complete');
            setIsExerciseComplete(true);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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
        <Text style={styles.title}>Preparing Motion Detector...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>
          Exercise {currentExerciseIndex + 1} of {exercises.length}
        </Text>
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={(currentExerciseIndex + 1) / exercises.length}
          style={styles.progressBar}
          color="#007AFF"
        />
      </View>

      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
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
              {formatTime(holdTimer)} / {formatTime(currentExercise.duration)}
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[
                styles.progressBarFill,
                { width: `${(holdTimer / currentExercise.duration) * 100}%` }
              ]} />
            </View>
          </View>
        )}

        {isExerciseComplete && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextExercise}
          >
            <Text style={styles.nextButtonText}>
              {currentExerciseIndex < exercises.length - 1 ? 'Next Exercise' : 'Complete Routine'}
            </Text>
          </TouchableOpacity>
        )}
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
              Please hold your phone steady in your ideal posture for 5 seconds to calibrate the motion detector.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowCalibrationModal(false);
                setHasCalibratedForSession(true);
              }}
            >
              <Text style={styles.modalButtonText}>Start Calibration</Text>
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
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  exerciseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  timerContainer: {
    marginVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 10,
    width: '80%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  streakText: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
