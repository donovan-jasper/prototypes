import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useChannels } from '../../hooks/useChannels';
import ChannelGrid from '../../components/ChannelGrid';
import TunerSetup from '../../components/TunerSetup';

export default function HomeScreen() {
  const { channels, loading, error } = useChannels();
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const checkTunerConfig = async () => {
      const config = await AsyncStorage.getItem('tunerConfig');
      if (!config) {
        setShowSetup(true);
      }
    };

    checkTunerConfig();
  }, []);

  if (showSetup) {
    return <TunerSetup onComplete={() => setShowSetup(false)} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading channels: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live TV Channels</Text>
      <ChannelGrid channels={channels} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
