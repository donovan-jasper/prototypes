import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Linking, Platform, Dimensions } from 'react-native';
import { useNavigation } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDatabase } from '../hooks/useDatabase';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SOSModal = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('breathing');
  const [breathingTime, setBreathingTime] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [heatTime, setHeatTime] = useState(15 * 60); // 15 minutes in seconds
  const [isHeatActive, setIsHeatActive] = useState(false);
  const [favoriteExercises, setFavoriteExercises] = useState([]);
  const { getFavoriteExercises } = useDatabase();
  const navigation = useNavigation();
  const breathingIntervalRef = useRef(null);
  const heatIntervalRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Load favorite exercises
      const loadFavorites = async () => {
        const exercises = await getFavoriteExercises();
        setFavoriteExercises(exercises.slice(0, 3));
      };
      loadFavorites();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (isBreathingActive) {
      breathingIntervalRef.current = setInterval(() => {
        setBreathingTime(prev => {
          if (prev >= 47) {
            clearInterval(breathingIntervalRef.current);
            setIsBreathingActive(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          // Trigger haptic feedback at phase changes
          if (prev === 3 || prev === 6 || prev === 10 || prev === 13) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, [isBreathingActive]);

  useEffect(() => {
    if (isHeatActive) {
      heatIntervalRef.current = setInterval(() => {
        setHeatTime(prev => {
          if (prev <= 0) {
            clearInterval(heatIntervalRef.current);
            setIsHeatActive(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            scheduleHeatReminder();
            return 0;
          }
          // Trigger haptic feedback every minute
          if (prev % 60 === 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (heatIntervalRef.current) {
        clearInterval(heatIntervalRef.current);
      }
    };
  }, [isHeatActive]);

  const scheduleHeatReminder = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Heat Therapy Complete",
        body: "Your heat therapy session is finished. Would you like to start another?",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: 60, // Remind after 1 minute
      },
    });
  };

  const startBreathingExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsBreathingActive(true);
    setBreathingTime(0);
  };

  const startHeatTherapy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsHeatActive(true);
    setHeatTime(15 * 60); // Reset to 15 minutes
  };

  const callEmergencyContact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const phoneNumber = 'tel:1234567890'; // Replace with actual emergency number
    Linking.openURL(phoneNumber).catch(err => console.error('Failed to open dialer:', err));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathingPhase = () => {
    if (breathingTime < 4) return 'Inhale';
    if (breathingTime < 7) return 'Hold';
    if (breathingTime < 11) return 'Exhale';
    if (breathingTime < 14) return 'Hold';
    return 'Complete';
  };

  const navigateToExercise = (id) => {
    navigation.navigate('exercise/[id]', { id });
    onClose();
  };

  const renderBreathingExercise = () => {
    const phase = getBreathingPhase();
    const progress = breathingTime / 47;

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.title}>4-7-8 Breathing Exercise</Text>
        <Text style={styles.subtitle}>Deep breathing to calm your nervous system</Text>

        <View style={styles.breathingVisualizer}>
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.2]
                  })
                }]
              }
            ]}
          />
          <Text style={styles.breathingPhase}>{phase}</Text>
        </View>

        <Text style={styles.timer}>{formatTime(47 - breathingTime)}</Text>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        <TouchableOpacity
          style={[styles.button, isBreathingActive && styles.buttonDisabled]}
          onPress={startBreathingExercise}
          disabled={isBreathingActive}
        >
          <Text style={styles.buttonText}>
            {isBreathingActive ? 'In Progress...' : 'Start Exercise'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.instructions}>
          Inhale for 4 seconds, hold for 7, exhale for 8. Repeat until the timer completes.
        </Text>
      </View>
    );
  };

  const renderHeatTherapy = () => {
    const progress = heatTime / (15 * 60);

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Heat Therapy Timer</Text>
        <Text style={styles.subtitle}>Apply heat to reduce pain and relax muscles</Text>

        <View style={styles.heatVisualizer}>
          <MaterialCommunityIcons
            name="fire"
            size={80}
            color="#ff6b6b"
            style={{ opacity: isHeatActive ? 1 : 0.5 }}
          />
        </View>

        <Text style={styles.timer}>{formatTime(heatTime)}</Text>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        <TouchableOpacity
          style={[styles.button, isHeatActive && styles.buttonDisabled]}
          onPress={startHeatTherapy}
          disabled={isHeatActive}
        >
          <Text style={styles.buttonText}>
            {isHeatActive ? 'Therapy Active' : 'Start Heat Therapy'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.instructions}>
          Apply heat to your lower abdomen for 15 minutes. You'll receive a notification when time is up.
        </Text>
      </View>
    );
  };

  const renderQuickRelief = () => {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Quick Relief Exercises</Text>
        <Text style={styles.subtitle}>Your most effective techniques</Text>

        {favoriteExercises.length > 0 ? (
          <View style={styles.exerciseList}>
            {favoriteExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => navigateToExercise(exercise.id)}
              >
                <View style={styles.exerciseIcon}>
                  <MaterialIcons
                    name={exercise.icon || 'spa'}
                    size={24}
                    color="#6c5ce7"
                  />
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  <Text style={styles.exerciseDuration}>
                    {exercise.duration} min • {exercise.difficulty}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="spa" size={48} color="#bdc3c7" />
            <Text style={styles.emptyText}>No favorite exercises yet</Text>
            <Text style={styles.emptySubtext}>
              Complete exercises to see your most effective ones here
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmergencyContact = () => {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Emergency Contact</Text>
        <Text style={styles.subtitle}>Quick access to help</Text>

        <View style={styles.emergencyContainer}>
          <MaterialIcons name="local-hospital" size={80} color="#ff6b6b" />
          <Text style={styles.emergencyText}>
            Need immediate medical attention?
          </Text>
          <Text style={styles.emergencySubtext}>
            Tap the button below to call your emergency contact
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.emergencyButton]}
            onPress={callEmergencyContact}
          >
            <MaterialIcons name="phone" size={24} color="#fff" />
            <Text style={[styles.buttonText, styles.emergencyButtonText]}>
              Call Emergency Contact
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#ff7e5f', '#feb47b']}
            style={styles.header}
          >
            <Text style={styles.modalTitle}>Quick Relief Mode</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'breathing' && styles.activeTab]}
              onPress={() => setActiveTab('breathing')}
            >
              <MaterialIcons
                name="air"
                size={20}
                color={activeTab === 'breathing' ? '#6c5ce7' : '#7f8c8d'}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'breathing' && styles.activeTabText
              ]}>Breathing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'heat' && styles.activeTab]}
              onPress={() => setActiveTab('heat')}
            >
              <MaterialCommunityIcons
                name="fire"
                size={20}
                color={activeTab === 'heat' ? '#6c5ce7' : '#7f8c8d'}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'heat' && styles.activeTabText
              ]}>Heat Therapy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'relief' && styles.activeTab]}
              onPress={() => setActiveTab('relief')}
            >
              <MaterialIcons
                name="spa"
                size={20}
                color={activeTab === 'relief' ? '#6c5ce7' : '#7f8c8d'}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'relief' && styles.activeTabText
              ]}>Quick Relief</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'emergency' && styles.activeTab]}
              onPress={() => setActiveTab('emergency')}
            >
              <MaterialIcons
                name="local-hospital"
                size={20}
                color={activeTab === 'emergency' ? '#6c5ce7' : '#7f8c8d'}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'emergency' && styles.activeTabText
              ]}>Emergency</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentWrapper}>
            {activeTab === 'breathing' && renderBreathingExercise()}
            {activeTab === 'heat' && renderHeatTherapy()}
            {activeTab === 'relief' && renderQuickRelief()}
            {activeTab === 'emergency' && renderEmergencyContact()}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6c5ce7',
  },
  tabText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  activeTabText: {
    color: '#6c5ce7',
    fontWeight: '600',
  },
  contentWrapper: {
    padding: 20,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  breathingVisualizer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  breathingPhase: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
  },
  heatVisualizer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timer: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6c5ce7',
    borderRadius: 3,
  },
  button: {
    backgroundColor: '#6c5ce7',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    textAlign: 'center',
  },
  exerciseList: {
    marginTop: 10,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  exerciseDuration: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  emergencyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 20,
  },
  emergencyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginTop: 20,
    marginBottom: 5,
    textAlign: 'center',
  },
  emergencySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
  },
  emergencyButtonText: {
    marginLeft: 10,
  },
});

export default SOSModal;
