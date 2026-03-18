import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSignalData } from '@/hooks/useSignalData';
import { getHealthColor } from '@/utils/signalCalculator';

export default function SignalMeter() {
  const { signalData, isLoading } = useSignalData();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!signalData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to fetch signal data</Text>
      </View>
    );
  }

  const healthColor = getHealthColor(signalData.healthScore);

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: healthColor }]}>
          <Text style={[styles.scoreText, { color: healthColor }]}>
            {signalData.healthScore}
          </Text>
          <Text style={styles.scoreLabel}>Health Score</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Network Type</Text>
          <Text style={styles.detailValue}>{signalData.networkType}</Text>
        </View>

        {signalData.carrier && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Carrier</Text>
            <Text style={styles.detailValue}>{signalData.carrier}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Signal Strength</Text>
          <View style={styles.strengthBar}>
            <View
              style={[
                styles.strengthFill,
                {
                  width: `${signalData.signalStrength * 10}%`,
                  backgroundColor: healthColor,
                },
              ]}
            />
          </View>
        </View>

        {signalData.latency !== null && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Latency</Text>
            <Text style={styles.detailValue}>{signalData.latency}ms</Text>
          </View>
        )}

        {signalData.downloadSpeed !== null && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Download</Text>
            <Text style={styles.detailValue}>
              {signalData.downloadSpeed.toFixed(1)} Mbps
            </Text>
          </View>
        )}

        {signalData.uploadSpeed !== null && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Upload</Text>
            <Text style={styles.detailValue}>
              {signalData.uploadSpeed.toFixed(1)} Mbps
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.timestamp}>
        Last updated: {new Date(signalData.timestamp).toLocaleTimeString()}
      </Text>
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
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  strengthBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 12,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
