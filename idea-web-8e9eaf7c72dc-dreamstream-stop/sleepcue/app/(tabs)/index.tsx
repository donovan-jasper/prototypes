import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useSleepDetection } from '../../hooks/useSleepDetection';

export default function HomeScreen() {
  const { isSleeping, confidence, isDetecting, startDetection, stopDetection } = useSleepDetection();
  const [detectionStatus, setDetectionStatus] = useState<'awake' | 'drowsy' | 'asleep'>('awake');

  useEffect(() => {
    if (isSleeping) {
      setDetectionStatus('asleep');
    } else if (confidence > 0.4) {
      setDetectionStatus('drowsy');
    } else {
      setDetectionStatus('awake');
    }
  }, [isSleeping, confidence]);

  const handleToggleDetection = () => {
    if (isDetecting) {
      stopDetection();
    } else {
      startDetection();
    }
  };

  const getStatusColor = () => {
    switch (detectionStatus) {
      case 'asleep':
        return '#8B5CF6';
      case 'drowsy':
        return '#F59E0B';
      case 'awake':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusEmoji = () => {
    switch (detectionStatus) {
      case 'asleep':
        return '😴';
      case 'drowsy':
        return '😌';
      case 'awake':
        return '👁️';
      default:
        return '🤔';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SleepCue</Text>
      <Text style={styles.subtitle}>Never lose your place or drain your battery</Text>
      
      {isDetecting && (
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusEmoji}>{getStatusEmoji()}</Text>
            <Text style={styles.statusText}>{detectionStatus.toUpperCase()}</Text>
          </View>
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Detection Confidence</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    width: `${confidence * 100}%`,
                    backgroundColor: getStatusColor()
                  }
                ]} 
              />
            </View>
            <Text style={styles.confidencePercentage}>{Math.round(confidence * 100)}%</Text>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.mainButton, isDetecting && styles.mainButtonActive]} 
        onPress={handleToggleDetection}
      >
        <Text style={styles.mainButtonText}>
          {isDetecting ? 'Stop Detection' : 'Start Sleep Detection'}
        </Text>
      </TouchableOpacity>

      <View style={styles.linksContainer}>
        <Link href="/timer" style={styles.link}>
          <Text style={styles.linkText}>⏱️ Sleep Timer</Text>
        </Link>
        <Link href="/insights" style={styles.link}>
          <Text style={styles.linkText}>📊 Sleep Insights</Text>
        </Link>
        <Link href="/settings" style={styles.link}>
          <Text style={styles.linkText}>⚙️ Settings</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    color: '#6B7280',
  },
  statusContainer: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 20,
  },
  statusEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confidenceContainer: {
    width: '100%',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  confidenceBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 6,
    transition: 'width 0.3s ease',
  },
  confidencePercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  mainButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainButtonActive: {
    backgroundColor: '#EF4444',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    width: '100%',
    gap: 12,
  },
  link: {
    width: '100%',
  },
  linkText: {
    fontSize: 16,
    color: '#3B82F6',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
