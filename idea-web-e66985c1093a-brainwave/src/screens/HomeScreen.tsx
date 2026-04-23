import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { SessionTimer } from '../components/SessionTimer';
import { ActivityProfileCard } from '../components/ActivityProfileCard';

const HomeScreen: React.FC = () => {
  const {
    isMonitoring,
    activeProfile,
    currentSession,
    startSession,
    stopSession,
    setActiveProfile,
  } = useAppContext();

  const profiles: ActivityProfile[] = [
    { id: 'study', name: 'Study', icon: 'book', sensitivity: 1.0 },
    { id: 'work', name: 'Work', icon: 'briefcase', sensitivity: 1.2 },
    { id: 'audiobook', name: 'Audiobook', icon: 'headphones', sensitivity: 0.8 },
  ];

  const handleStartSession = () => {
    if (activeProfile) {
      startSession(activeProfile);
    }
  };

  const handleStopSession = () => {
    stopSession();
  };

  const handleProfileSelect = (profile: ActivityProfile) => {
    if (!isMonitoring) {
      setActiveProfile(profile);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FlowGuard</Text>

      <View style={styles.profileContainer}>
        {profiles.map(profile => (
          <ActivityProfileCard
            key={profile.id}
            profile={profile}
            isSelected={activeProfile?.id === profile.id}
            isDisabled={isMonitoring}
            onSelect={handleProfileSelect}
          />
        ))}
      </View>

      <SessionTimer
        isActive={isMonitoring}
        elapsedSeconds={currentSession.elapsedTime}
        drowsinessEvents={currentSession.drowsinessEvents}
        onStart={handleStartSession}
        onStop={handleStopSession}
      />

      {isMonitoring && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Monitoring: {activeProfile?.name || 'Unknown'}
          </Text>
          <ActivityIndicator size="small" color="#4CAF50" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  statusText: {
    marginRight: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;
