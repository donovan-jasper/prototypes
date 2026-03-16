import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ActivityProfileCard } from '../components/ActivityProfileCard';
import { SessionTimer } from '../components/SessionTimer';
import { AppContext } from '../context/AppContext';
import { ActivityProfile } from '../types';

export const HomeScreen: React.FC = () => {
  const { profiles, activeProfile, startSession, stopSession, isSessionActive, elapsedTime, drowsinessEvents } = useContext(AppContext);
  const [selectedProfile, setSelectedProfile] = useState<ActivityProfile | null>(null);

  useEffect(() => {
    if (activeProfile) {
      setSelectedProfile(profiles.find(p => p.id === activeProfile) || null);
    }
  }, [activeProfile, profiles]);

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profiles.find(p => p.id === profileId) || null);
  };

  const handleStartSession = () => {
    if (selectedProfile) {
      startSession(selectedProfile.id);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>FlowGuard</Text>
      <Text style={styles.subtitle}>Stay focused longer</Text>

      <View style={styles.profileSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {profiles.map(profile => (
            <ActivityProfileCard
              key={profile.id}
              profile={profile}
              isSelected={selectedProfile?.id === profile.id}
              onSelect={handleProfileSelect}
              onEdit={() => {}}
            />
          ))}
        </ScrollView>
      </View>

      <SessionTimer
        isActive={isSessionActive}
        elapsedSeconds={elapsedTime}
        drowsinessEvents={drowsinessEvents}
        onStart={handleStartSession}
        onStop={stopSession}
      />

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Today's Stats</Text>
        <Text style={styles.statsValue}>3 alerts</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  profileSelector: {
    marginBottom: 20,
  },
  statsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
