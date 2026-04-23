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
        <View style={styles.breathingVisualizer}>
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  })
                }]
              }
            ]}
          />
          <Text style={styles.breathingPhase}>{phase}</Text>
          <Text style={styles.breathingTimer}>{formatTime(47 - breathingTime)}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {!isBreathingActive ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startBreathingExercise}
          >
            <Text style={styles.startButtonText}>Start Breathing Exercise</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.startButton, styles.stopButton]}
            onPress={() => {
              clearInterval(breathingIntervalRef.current);
              setIsBreathingActive(false);
            }}
          >
            <Text style={styles.startButtonText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderHeatTherapy = () => {
    const progress = (15 * 60 - heatTime) / (15 * 60);

    return (
      <View style={styles.contentContainer}>
        <View style={styles.heatVisualizer}>
          <MaterialCommunityIcons
            name="fire"
            size={80}
            color="#ff6b6b"
            style={{ opacity: isHeatActive ? 1 : 0.5 }}
          />
          <Text style={styles.heatTimer}>{formatTime(heatTime)}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.heatInstruction}>
            Apply heat pack to painful area for 15 minutes
          </Text>
        </View>

        {!isHeatActive ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startHeatTherapy}
          >
            <Text style={styles.startButtonText}>Start Heat Therapy</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.startButton, styles.stopButton]}
            onPress={() => {
              clearInterval(heatIntervalRef.current);
              setIsHeatActive(false);
            }}
          >
            <Text style={styles.startButtonText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderQuickExercises = () => {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Quick Access Exercises</Text>
        <View style={styles.exerciseList}>
          {favoriteExercises.length > 0 ? (
            favoriteExercises.map(exercise => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseItem}
                onPress={() => navigateToExercise(exercise.id)}
              >
                <View style={styles.exerciseIcon}>
                  <MaterialIcons
                    name={exercise.painTypes.includes('Anxiety') ? 'spa' : 'fitness-center'}
                    size={24}
                    color="#fff"
                  />
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  <Text style={styles.exerciseDuration}>
                    {exercise.duration} min • {exercise.difficulty}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noExercisesText}>
              No favorite exercises yet. Add some from the Relief Library!
            </Text>
          )}
        </View>
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
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#ff7e5f', '#feb47b']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Quick Relief</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'breathing' && styles.activeTab]}
              onPress={() => setActiveTab('breathing')}
            >
              <MaterialIcons name="air" size={24} color={activeTab === 'breathing' ? '#ff7e5f' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'breathing' && styles.activeTabText]}>
                Breathing
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'heat' && styles.activeTab]}
              onPress={() => setActiveTab('heat')}
            >
              <MaterialCommunityIcons name="fire" size={24} color={activeTab === 'heat' ? '#ff7e5f' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'heat' && styles.activeTabText]}>
                Heat Therapy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'exercises' && styles.activeTab]}
              onPress={() => setActiveTab('exercises')}
            >
              <MaterialIcons name="fitness-center" size={24} color={activeTab === 'exercises' ? '#ff7e5f' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'exercises' && styles.activeTabText]}>
                Exercises
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'breathing' && renderBreathingExercise()}
            {activeTab === 'heat' && renderHeatTherapy()}
            {activeTab === 'exercises' && renderQuickExercises()}
          </View>

          <View style={styles.emergencyContainer}>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={callEmergencyContact}
            >
              <MaterialIcons name="local-hospital" size={24} color="#fff" />
              <Text style={styles.emergencyText}>Emergency Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
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
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  activeTabText: {
    color: '#ff7e5f',
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
  },
  contentContainer: {
    alignItems: 'center',
  },
  breathingVisualizer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  breathingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ff7e5f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  breathingPhase: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  breathingTimer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff7e5f',
    marginBottom: 20,
  },
  heatVisualizer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heatTimer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginVertical: 20,
  },
  heatInstruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ff7e5f',
    borderRadius: 4,
  },
  startButton: {
    backgroundColor: '#ff7e5f',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  stopButton: {
    backgroundColor: '#ff6b6b',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  exerciseList: {
    width: '100%',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff7e5f',
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
    color: '#333',
  },
  exerciseDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noExercisesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  emergencyContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    borderRadius: 25,
  },
  emergencyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SOSModal;
