import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSleepDetection } from '../hooks/useSleepDetection';
import { AudioController } from '../services/audioControl';
import { dbToLinear } from '../utils/audioAnalysis';
import { smoothMotionData } from '../utils/motionAnalysis';

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

  useEffect(() => {
    if (isSleeping && onSleepDetected) {
      onSleepDetected();
    }
  }, [isSleeping, onSleepDetected]);

  const handleStartDetection = async () => {
    try {
      await startDetection();
    } catch (err) {
      console.error('Failed to start detection:', err);
    }
  };

  const handleStopDetection = async () => {
    try {
      await stopDetection();
    } catch (err) {
      console.error('Failed to stop detection:', err);
    }
  };

  const handleResumeAudio = async () => {
    try {
      await resumeAudio();
    } catch (err) {
      console.error('Failed to resume audio:', err);
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
        </View>
      ) : (
        <>
          {renderMotionIndicator()}
          {renderAudioIndicator()}
          {renderCombinedIndicator()}

          <View style={styles.controlsContainer}>
            {isDetecting ? (
              <TouchableOpacity
                style={[styles.button, styles.stopButton]}
                onPress={handleStopDetection}
              >
                <Text style={styles.buttonText}>Stop Detection</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.startButton]}
                onPress={handleStartDetection}
              >
                <Text style={styles.buttonText}>Start Detection</Text>
              </TouchableOpacity>
            )}

            {!showAdvanced && (
              <TouchableOpacity
                style={styles.advancedButton}
                onPress={() => setShowAdvanced(true)}
              >
                <Text style={styles.advancedButtonText}>Advanced Settings</Text>
              </TouchableOpacity>
            )}
          </View>

          {showAdvanced && renderAdvancedControls()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  indicatorContainer: {
    marginBottom: 15,
  },
  indicatorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
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
    marginTop: 5,
    textAlign: 'right',
  },
  controlsContainer: {
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  resumeButton: {
    backgroundColor: '#2196F3',
    marginTop: 20,
  },
  advancedButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  advancedButtonText: {
    color: '#6200ee',
    textDecorationLine: 'underline',
  },
  sleepingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  sleepingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 10,
  },
  confidenceText: {
    fontSize: 18,
    marginBottom: 20,
  },
  advancedContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SleepDetector;
