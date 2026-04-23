import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SessionTimerProps {
  isActive: boolean;
  elapsedSeconds: number;
  drowsinessEvents: number;
  onStart: () => void;
  onStop: () => void;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  isActive,
  elapsedSeconds,
  drowsinessEvents,
  onStart,
  onStop,
}) => {
  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
        <Text style={styles.eventsText}>Drowsiness Events: {drowsinessEvents}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isActive ? styles.stopButton : styles.startButton]}
        onPress={isActive ? onStop : onStart}
        disabled={!isActive && elapsedSeconds > 0}
      >
        <Text style={styles.buttonText}>{isActive ? 'Stop Session' : 'Start Session'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  eventsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


+++++ src/components/ActivityProfileCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityProfile } from '../types';

interface ActivityProfileCardProps {
  profile: ActivityProfile;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (profile: ActivityProfile) => void;
}

export const ActivityProfileCard: React.FC<ActivityProfileCardProps> = ({
  profile,
  isSelected,
  isDisabled,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected ? styles.selectedCard : styles.unselectedCard,
        isDisabled && styles.disabledCard,
      ]}
      onPress={() => onSelect(profile)}
      disabled={isDisabled}
    >
      <Text style={styles.icon}>{profile.icon}</Text>
      <Text style={styles.name}>{profile.name}</Text>
      <View style={styles.sensitivityContainer}>
        <Text style={styles.sensitivityLabel}>Sensitivity:</Text>
        <Text style={styles.sensitivityValue}>{profile.sensitivity.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 100,
    height: 120,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  selectedCard: {
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  unselectedCard: {
    backgroundColor: '#E0E0E0',
  },
  disabledCard: {
    opacity: 0.7,
  },
  icon: {
    fontSize: 24,
    marginBottom: 5,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
  },
  sensitivityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sensitivityLabel: {
    fontSize: 10,
    color: 'white',
    marginRight: 3,
  },
  sensitivityValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
});
