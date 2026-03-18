import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { runSpeedTest } from '@/services/speedtest';
import { SpeedTestResult } from '@/types';

export default function SpeedTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<SpeedTestResult | null>(null);
  const [history, setHistory] = useState<SpeedTestResult[]>([]);

  const handleRunTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentTest(null);

    try {
      const result = await runSpeedTest((progressValue) => {
        setProgress(progressValue);
      });

      setCurrentTest(result);
      setHistory((prev) => [result, ...prev].slice(0, 3));
    } catch (error) {
      console.error('Speed test failed:', error);
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  };

  const formatSpeed = (mbps: number) => {
    return mbps >= 1 ? `${mbps.toFixed(1)} Mbps` : `${(mbps * 1000).toFixed(0)} Kbps`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.testSection}>
        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={handleRunTest}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Ionicons name="speedometer" size={32} color="#fff" />
              <Text style={styles.buttonText}>Run Speed Test</Text>
            </>
          )}
        </TouchableOpacity>

        {isRunning && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}

        {currentTest && !isRunning && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Latest Result</Text>
            <View style={styles.resultRow}>
              <View style={styles.resultItem}>
                <Ionicons name="arrow-down" size={24} color="#4CAF50" />
                <Text style={styles.resultLabel}>Download</Text>
                <Text style={styles.resultValue}>{formatSpeed(currentTest.downloadSpeed)}</Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultItem}>
                <Ionicons name="arrow-up" size={24} color="#2196F3" />
                <Text style={styles.resultLabel}>Upload</Text>
                <Text style={styles.resultValue}>{formatSpeed(currentTest.uploadSpeed)}</Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultItem}>
                <Ionicons name="time" size={24} color="#FF9800" />
                <Text style={styles.resultLabel}>Latency</Text>
                <Text style={styles.resultValue}>{currentTest.latency}ms</Text>
              </View>
            </View>
            <Text style={styles.resultNetwork}>{currentTest.networkType}</Text>
          </View>
        )}
      </View>

      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent Tests</Text>
          {history.map((test, index) => (
            <View key={test.timestamp} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTime}>{formatDate(test.timestamp)}</Text>
                <Text style={styles.historyNetwork}>{test.networkType}</Text>
              </View>
              <View style={styles.historyStats}>
                <View style={styles.historyStat}>
                  <Ionicons name="arrow-down" size={16} color="#4CAF50" />
                  <Text style={styles.historyStatText}>{formatSpeed(test.downloadSpeed)}</Text>
                </View>
                <View style={styles.historyStat}>
                  <Ionicons name="arrow-up" size={16} color="#2196F3" />
                  <Text style={styles.historyStatText}>{formatSpeed(test.uploadSpeed)}</Text>
                </View>
                <View style={styles.historyStat}>
                  <Ionicons name="time" size={16} color="#FF9800" />
                  <Text style={styles.historyStatText}>{test.latency}ms</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    minWidth: 200,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#999',
    shadowColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  progressContainer: {
    width: '100%',
    marginTop: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  resultCard: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  resultItem: {
    alignItems: 'center',
    flex: 1,
  },
  resultDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#e0e0e0',
  },
  resultLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  resultNetwork: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  historySection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTime: {
    fontSize: 14,
    color: '#666',
  },
  historyNetwork: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyStatText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});
