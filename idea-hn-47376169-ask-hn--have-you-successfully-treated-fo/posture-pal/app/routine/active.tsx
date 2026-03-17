import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { MotionDetector } from '@/components/MotionDetector';
import { postureDetector } from '@/lib/motion';
import { Audio } from 'expo-av';

export default function ActiveRoutineScreen() {
  const { exercises, completeExercise, incrementStreak } = useStore();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(true);
  const [holdTimer, setHoldTimer] = useState(0);
  const [isHoldingCorrectly, setIsHoldingCorrectly] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

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
  }, []);

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
      }

      await soundObject.loadAsync(source);
      await soundObject.playAsync();
      setSound(soundObject);
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setShowCalibrationModal(true);
      setHoldTimer(0);
      setIsHoldingCorrectly(false);
      playSound('start');
    } else {
      setIsComplete(true);
      completeExercise(currentExercise.id);
      incrementStreak();
      playSound('complete');
    }
  };

  const handlePostureCorrect = () => {
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
            return currentExercise.duration;
          }

          return newTime;
        });
      }, 1000);
    }
  };

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
        onCalibrationComplete={() => setShowCalibrationModal(false)}
        onPostureCorrect={handlePostureCorrect}
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

      <Modal
        visible={showCalibrationModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Calibration Required</Text>
            <Text style={styles.modalText}>
              Please hold your phone in your ideal posture for the {currentExercise.name} exercise.
            </Text>
            <Text style={styles.modalText}>
              Keep your head aligned with the screen and maintain this position.
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
