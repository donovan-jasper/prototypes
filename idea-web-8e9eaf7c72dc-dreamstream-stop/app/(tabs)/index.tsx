import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import SleepDetector from '../../components/SleepDetector';
import BatteryStats from '../../components/BatteryStats';
import { Ionicons } from '@expo/vector-icons';
import { sleepAudioBridge } from '../../services/sleepAudioBridge';

const HomeScreen = () => {
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const status = sleepAudioBridge.getStatus();
      setIsDetectionActive(status.isActive);

      // In a real app, we would get the current audio track from the system
      // For this prototype, we'll just simulate it
      setCurrentAudio('Your Favorite Podcast');
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SleepCue</Text>
        <Text style={styles.subtitle}>Smart Sleep Detection</Text>
      </View>

      <SleepDetector />

      <View style={styles.currentAudioContainer}>
        <Text style={styles.sectionTitle}>Current Audio</Text>
        <View style={styles.audioInfo}>
          <Ionicons name="musical-notes-outline" size={24} color="#666" />
          <Text style={styles.audioTitle}>
            {currentAudio || 'No audio playing'}
          </Text>
        </View>
      </View>

      <BatteryStats />

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <Link href="/timer" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="timer-outline" size={24} color="#4CAF50" />
              <Text style={styles.actionText}>Sleep Timer</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/insights" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="stats-chart-outline" size={24} color="#2196F3" />
              <Text style={styles.actionText}>Sleep Insights</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings-outline" size={24} color="#666" />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View style={styles.statusIndicator}>
        <View style={[
          styles.indicatorDot,
          isDetectionActive ? styles.activeDot : styles.inactiveDot
        ]} />
        <Text style={styles.statusText}>
          {isDetectionActive ? 'Sleep detection active' : 'Sleep detection inactive'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  currentAudioContainer: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioTitle: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  quickActions: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  inactiveDot: {
    backgroundColor: '#f44336',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
