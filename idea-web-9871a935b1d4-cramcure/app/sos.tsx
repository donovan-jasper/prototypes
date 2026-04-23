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
                    scale: breathingTime < 4
                      ? 1 + (breathingTime / 4) * 0.5
                      : breathingTime < 7
                      ? 1.5
                      : breathingTime < 11
                      ? 1.5 - ((breathingTime - 7) / 4) * 0.5
                      : 1
                  }
                ],
                opacity: breathingTime < 4
                  ? 0.3 + (breathingTime / 4) * 0.7
                  : breathingTime < 7
                  ? 1
                  : breathingTime < 11
                  ? 1 - ((breathingTime - 7) / 4) * 0.7
                  : 0.3
              }
            ]}
          />
          <Text style={styles.breathingPhase}>{phase}</Text>
        </View>

        <Text style={styles.breathingInstructions}>
          {phase === 'Inhale' && 'Breathe in deeply through your nose for 4 seconds'}
          {phase === 'Hold' && 'Hold your breath for 7 seconds'}
          {phase === 'Exhale' && 'Exhale slowly through your mouth for 8 seconds'}
          {phase === 'Complete' && 'Great job! You can repeat the cycle or try another exercise'}
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{formatTime(breathingTime)} / 00:47</Text>
        </View>

        {!isBreathingActive ? (
          <TouchableOpacity style={styles.startButton} onPress={startBreathingExercise}>
            <Text style={styles.startButtonText}>Start Breathing Exercise</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={() => setIsBreathingActive(false)}>
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderHeatTherapy = () => {
    const progress = heatTime / (15 * 60);

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Heat Therapy Timer</Text>

        <View style={styles.heatVisualizer}>
          <MaterialCommunityIcons name="fire" size={80} color="#FF6B6B" />
          <Text style={styles.heatTime}>{formatTime(heatTime)}</Text>
        </View>

        <Text style={styles.heatInstructions}>
          Apply heat to your lower abdomen for 15 minutes. Use a heating pad, warm towel, or warm water bottle.
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{formatTime(heatTime)} / 15:00</Text>
        </View>

        {!isHeatActive ? (
          <TouchableOpacity style={styles.startButton} onPress={startHeatTherapy}>
            <Text style={styles.startButtonText}>Start Heat Therapy</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={() => setIsHeatActive(false)}>
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderQuickExercises = () => {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Quick Access Exercises</Text>

        {favoriteExercises.length > 0 ? (
          <View style={styles.exerciseList}>
            {favoriteExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseItem}
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
            <MaterialCommunityIcons name="emoticon-sad-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No favorite exercises yet</Text>
            <Text style={styles.emptySubtext}>Browse the relief library to add favorites</Text>
          </View>
        )}
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
      <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.95)']}
          style={styles.modalContent}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>

          <Text style={styles.title}>Quick Relief Mode</Text>
          <Text style={styles.subtitle}>Immediate relief options for your pain</Text>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'breathing' && styles.activeTab]}
              onPress={() => setActiveTab('breathing')}
            >
              <MaterialCommunityIcons
                name="lungs"
                size={20}
                color={activeTab === 'breathing' ? '#8B5CF6' : '#9CA3AF'}
              />
              <Text style={[styles.tabText, activeTab === 'breathing' && styles.activeTabText]}>
                Breathing
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'heat' && styles.activeTab]}
              onPress={() => setActiveTab('heat')}
            >
              <MaterialCommunityIcons
                name="fire"
                size={20}
                color={activeTab === 'heat' ? '#8B5CF6' : '#9CA3AF'}
              />
              <Text style={[styles.tabText, activeTab === 'heat' && styles.activeTabText]}>
                Heat Therapy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'exercises' && styles.activeTab]}
              onPress={() => setActiveTab('exercises')}
            >
              <MaterialCommunityIcons
                name="yoga"
                size={20}
                color={activeTab === 'exercises' ? '#8B5CF6' : '#9CA3AF'}
              />
              <Text style={[styles.tabText, activeTab === 'exercises' && styles.activeTabText]}>
                Exercises
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'breathing' && renderBreathingExercise()}
          {activeTab === 'heat' && renderHeatTherapy()}
          {activeTab === 'exercises' && renderQuickExercises()}

          <View style={styles.emergencyContainer}>
            <Text style={styles.emergencyText}>If your pain is severe or worsening, please call emergency services:</Text>
            <TouchableOpacity style={styles.emergencyButton} onPress={callEmergencyContact}>
              <MaterialIcons name="phone" size={20} color="#fff" />
              <Text style={styles.emergencyButtonText}>Call Emergency</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.85,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 5,
  },
  activeTabText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  contentContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  breathingVisualizer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  breathingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingPhase: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
  },
  breathingInstructions: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  heatVisualizer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heatTime: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 10,
  },
  heatInstructions: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#F87171',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseList: {
    marginBottom: 20,
  },
  exerciseItem: {
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
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  exerciseDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'center',
  },
  emergencyContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  emergencyText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
    textAlign: 'center',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F87171',
    paddingVertical: 12,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default SOSModal;
