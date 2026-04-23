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
        <Text style={styles.sectionTitle}>4-7-8 Breathing Exercise</Text>

        <View style={styles.breathingVisualizer}>
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          />
          <Text style={styles.breathingPhase}>{phase}</Text>
          <Text style={styles.breathingTime}>{formatTime(breathingTime)}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        <Text style={styles.instructions}>
          {phase === 'Inhale' && 'Breathe in deeply through your nose for 4 seconds'}
          {phase === 'Hold' && 'Hold your breath for 7 seconds'}
          {phase === 'Exhale' && 'Exhale slowly through your mouth for 8 seconds'}
          {phase === 'Complete' && 'Great job! You can restart the exercise'}
        </Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={startBreathingExercise}
          disabled={isBreathingActive}
        >
          <Text style={styles.startButtonText}>
            {isBreathingActive ? 'In Progress' : 'Start Exercise'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeatTherapy = () => {
    const progress = heatTime / (15 * 60);

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Heat Therapy Timer</Text>

        <View style={styles.heatVisualizer}>
          <MaterialCommunityIcons
            name="fire"
            size={80}
            color="#FF6B6B"
            style={[
              styles.fireIcon,
              {
                opacity: isHeatActive ? 1 : 0.5,
                transform: [{ scale: isHeatActive ? 1.1 : 1 }],
              },
            ]}
          />
          <Text style={styles.heatTime}>{formatTime(heatTime)}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        <Text style={styles.instructions}>
          Apply heat to your lower abdomen for 15 minutes.
          Use a heating pad, warm towel, or warm bath.
          {isHeatActive ? ' Keep the heat on until the timer completes.' : ''}
        </Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={startHeatTherapy}
          disabled={isHeatActive}
        >
          <Text style={styles.startButtonText}>
            {isHeatActive ? 'Therapy Active' : 'Start Heat Therapy'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuickExercises = () => {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Quick Relief Exercises</Text>

        {favoriteExercises.length > 0 ? (
          <View style={styles.exerciseList}>
            {favoriteExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => navigateToExercise(exercise.id)}
              >
                <View style={styles.exerciseIcon}>
                  <MaterialCommunityIcons
                    name={exercise.icon || 'yoga'}
                    size={24}
                    color="#8B5CF6"
                  />
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  <Text style={styles.exerciseDuration}>
                    {exercise.duration} min • {exercise.difficulty}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="emoticon-sad-outline"
              size={48}
              color="#9CA3AF"
            />
            <Text style={styles.emptyText}>No favorite exercises yet</Text>
            <Text style={styles.emptySubtext}>
              Go to the Relief tab to add your favorites
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#F3E8FF', '#E9D5FF']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Quick Relief Mode</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'breathing' && styles.activeTab]}
              onPress={() => setActiveTab('breathing')}
            >
              <MaterialCommunityIcons
                name="breath"
                size={20}
                color={activeTab === 'breathing' ? '#8B5CF6' : '#6B7280'}
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
                color={activeTab === 'heat' ? '#8B5CF6' : '#6B7280'}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'heat' && styles.activeTabText
              ]}>Heat Therapy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'exercises' && styles.activeTab]}
              onPress={() => setActiveTab('exercises')}
            >
              <MaterialCommunityIcons
                name="meditation"
                size={20}
                color={activeTab === 'exercises' ? '#8B5CF6' : '#6B7280'}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'exercises' && styles.activeTabText
              ]}>Exercises</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {activeTab === 'breathing' && renderBreathingExercise()}
            {activeTab === 'heat' && renderHeatTherapy()}
            {activeTab === 'exercises' && renderQuickExercises()}
          </View>

          <View style={styles.emergencyContainer}>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={callEmergencyContact}
            >
              <MaterialIcons name="local-hospital" size={24} color="#FF3B30" />
              <Text style={styles.emergencyText}>Emergency Contact</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  breathingVisualizer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  breathingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  breathingPhase: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 5,
  },
  breathingTime: {
    fontSize: 20,
    color: '#4B5563',
  },
  heatVisualizer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fireIcon: {
    marginBottom: 15,
  },
  heatTime: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  instructions: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseList: {
    flex: 1,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  exerciseDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 5,
  },
  emergencyContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  emergencyText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SOSModal;
