import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useSleepDetection } from '../hooks/useSleepDetection';
import { AudioController } from '../services/audioControl';
import { dbToLinear } from '../utils/audioAnalysis';
import { smoothMotionData } from '../utils/motionAnalysis';
import * as Notifications from 'expo-notifications';

interface SleepDetectorProps {
  confidenceThreshold?: number;
  fadeDuration?: number;
  rewindAmount?: number;
  onSleepDetected?: () => void;
}

export const SleepDetector: React.FC<SleepDetectorProps> = ({
  confidenceThreshold = 0.7,
  fadeDuration = 3000,
  rewindAmount = 120,
  onSleepDetected,
}) => {
  const {
    isSleeping,
    confidence,
    motionConfidence,
    audioConfidence,
    isDetecting,
    error,
    startDetection,
    stopDetection,
    resumeAudio,
    updateConfidenceThreshold,
    updateFadeDuration,
    updateRewindAmount,
  } = useSleepDetection(confidenceThreshold, fadeDuration, rewindAmount);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<Notifications.PermissionStatus | null>(null);

  useEffect(() => {
    if (isSleeping && onSleepDetected) {
      onSleepDetected();
    }

    // Request notification permissions
    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotificationPermission(status);
    });
  }, [isSleeping, onSleepDetected]);

  const handleStartDetection = async () => {
    try {
      // Check notification permissions
      if (notificationPermission !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        setNotificationPermission(status);
        if (status !== 'granted') {
          alert('Notification permissions are required for sleep detection alerts.');
          return;
        }
      }

      await startDetection();
    } catch (err) {
      console.error('Failed to start detection:', err);
      alert('Failed to start sleep detection. Please check permissions and try again.');
    }
  };

  const handleStopDetection = async () => {
    try {
      await stopDetection();
    } catch (err) {
      console.error('Failed to stop detection:', err);
      alert('Failed to stop sleep detection.');
    }
  };

  const handleResumeAudio = async () => {
    try {
      await resumeAudio();
    } catch (err) {
      console.error('Failed to resume audio:', err);
      alert('Failed to resume audio playback.');
    }
  };

  const renderMotionIndicator = () => {
    const motionLevel = motionConfidence * 100;
    const color = motionLevel > 70 ? 'red' : motionLevel > 30 ? 'orange' : 'green';

    return (
      <View style={styles.indicatorContainer}>
        <Text style={styles.indicatorLabel}>Motion</Text>
        <View style={styles.indicatorBarContainer}>
          <View style={[styles.indicatorBar, { width: `${motionLevel}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.indicatorValue}>{motionLevel.toFixed(1)}%</Text>
      </View>
    );
  };

  const renderAudioIndicator = () => {
    const audioLevel = audioConfidence * 100;
    const color = audioLevel > 70 ? 'red' : audioLevel > 30 ? 'orange' : 'green';

    return (
      <View style={styles.indicatorContainer}>
        <Text style={styles.indicatorLabel}>Audio</Text>
        <View style={styles.indicatorBarContainer}>
          <View style={[styles.indicatorBar, { width: `${audioLevel}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.indicatorValue}>{audioLevel.toFixed(1)}%</Text>
      </View>
    );
  };

  const renderCombinedIndicator = () => {
    const combinedLevel = confidence * 100;
    const color = combinedLevel > 70 ? 'red' : combinedLevel > 30 ? 'orange' : 'green';

    return (
      <View style={styles.indicatorContainer}>
        <Text style={styles.indicatorLabel}>Combined</Text>
        <View style={styles.indicatorBarContainer}>
          <View style={[styles.indicatorBar, { width: `${combinedLevel}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.indicatorValue}>{combinedLevel.toFixed(1)}%</Text>
      </View>
    );
  };

  const renderAdvancedControls = () => {
    return (
      <View style={styles.advancedContainer}>
        <Text style={styles.sectionTitle}>Advanced Settings</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Confidence Threshold:</Text>
          <Text style={styles.settingValue}>{confidenceThreshold.toFixed(1)}</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Fade Duration (ms):</Text>
          <Text style={styles.settingValue}>{fadeDuration}</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Rewind Amount (s):</Text>
          <Text style={styles.settingValue}>{rewindAmount}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowAdvanced(false)}
        >
          <Text style={styles.buttonText}>Hide Advanced</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Detection</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isSleeping ? (
        <View style={styles.sleepingContainer}>
          <Text style={styles.sleepingText}>Sleep Detected!</Text>
          <Text style={styles.confidenceText}>Confidence: {(confidence * 100).toFixed(1)}%</Text>

          <TouchableOpacity
            style={[styles.button, styles.resumeButton]}
            onPress={handleResumeAudio}
          >
            <Text style={styles.buttonText}>Resume Audio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStopDetection}
          >
            <Text style={styles.buttonText}>Stop Detection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.detectionContainer}>
          {isDetecting ? (
            <>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.detectingText}>Detecting sleep...</Text>

              {renderMotionIndicator()}
              {renderAudioIndicator()}
              {renderCombinedIndicator()}

              <TouchableOpacity
                style={[styles.button, styles.stopButton]}
                onPress={handleStopDetection}
              >
                <Text style={styles.buttonText}>Stop Detection</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.instructions}>
                Place your device on a flat surface and let SleepCue monitor your sleep patterns.
              </Text>

              <TouchableOpacity
                style={[styles.button, styles.startButton]}
                onPress={handleStartDetection}
              >
                <Text style={styles.buttonText}>Start Detection</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.advancedButton}
                onPress={() => setShowAdvanced(!showAdvanced)}
              >
                <Text style={styles.advancedButtonText}>
                  {showAdvanced ? 'Hide Advanced' : 'Show Advanced Settings'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {showAdvanced && renderAdvancedControls()}
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  sleepingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    marginBottom: 20,
  },
  sleepingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  confidenceText: {
    fontSize: 16,
    color: '#388e3c',
    marginBottom: 20,
  },
  detectingText: {
    fontSize: 18,
    marginVertical: 20,
    color: '#424242',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#424242',
    lineHeight: 24,
  },
  indicatorContainer: {
    width: '100%',
    marginVertical: 10,
  },
  indicatorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#424242',
  },
  indicatorBarContainer: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  indicatorBar: {
    height: '100%',
    borderRadius: 10,
  },
  indicatorValue: {
    fontSize: 14,
    textAlign: 'right',
    marginTop: 5,
    color: '#616161',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  resumeButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  advancedButton: {
    marginTop: 15,
    padding: 10,
  },
  advancedButtonText: {
    color: '#2196F3',
    textAlign: 'center',
  },
  advancedContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976d2',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#424242',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
  },
});
