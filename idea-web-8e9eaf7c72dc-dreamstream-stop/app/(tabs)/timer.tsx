import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sleepAudioBridge } from '../../components/sleepAudioBridge';
import TimerControl from '../../components/TimerControl';

const TimerScreen = () => {
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'smart' | 'manual'>('smart');
  const [presetTimes, setPresetTimes] = useState([15, 30, 45, 60]);
  const [selectedTime, setSelectedTime] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      const status = sleepAudioBridge.getStatus();
      setIsDetectionActive(status.isActive);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleTimerMode = () => {
    setTimerMode(prev => prev === 'smart' ? 'manual' : 'smart');
  };

  const addCustomTime = () => {
    // In a real app, this would show a modal to add a custom time
    console.log('Add custom time');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sleep Timer</Text>
        <Text style={styles.subtitle}>Choose your timer mode</Text>
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, timerMode === 'smart' && styles.activeMode]}
          onPress={() => setTimerMode('smart')}
        >
          <Ionicons
            name="brain-outline"
            size={24}
            color={timerMode === 'smart' ? '#4CAF50' : '#666'}
          />
          <Text style={[
            styles.modeText,
            timerMode === 'smart' && styles.activeModeText
          ]}>Smart Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, timerMode === 'manual' && styles.activeMode]}
          onPress={() => setTimerMode('manual')}
        >
          <Ionicons
            name="timer-outline"
            size={24}
            color={timerMode === 'manual' ? '#4CAF50' : '#666'}
          />
          <Text style={[
            styles.modeText,
            timerMode === 'manual' && styles.activeModeText
          ]}>Manual Timer</Text>
        </TouchableOpacity>
      </View>

      {timerMode === 'smart' && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Smart Timer Features</Text>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Automatically extends if you're still awake</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Uses motion and audio analysis</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Pauses playback when you fall asleep</Text>
          </View>
        </View>
      )}

      <View style={styles.timerContainer}>
        <TimerControl
          initialTime={selectedTime * 60}
          mode={timerMode}
          onTimeUp={() => {
            // Handle timer completion
            console.log('Timer completed');
          }}
        />
      </View>

      <View style={styles.presetContainer}>
        <Text style={styles.sectionTitle}>Preset Times</Text>
        <View style={styles.presetButtons}>
          {presetTimes.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.presetButton,
                selectedTime === time && styles.selectedPreset
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[
                styles.presetText,
                selectedTime === time && styles.selectedPresetText
              ]}>{time} min</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addPresetButton}
            onPress={addCustomTime}
          >
            <Ionicons name="add-outline" size={24} color="#666" />
          </TouchableOpacity>
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
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  modeButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  activeMode: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  modeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  activeModeText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  timerContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  presetContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
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
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    width: '30%',
    alignItems: 'center',
  },
  selectedPreset: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  presetText: {
    fontSize: 14,
    color: '#666',
  },
  selectedPresetText: {
    color: '#fff',
    fontWeight: '600',
  },
  addPresetButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
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

export default TimerScreen;
