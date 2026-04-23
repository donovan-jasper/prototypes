import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ProgressBar } from 'react-native-paper';

interface DownloadProgressProps {
  message: string;
  progress?: {
    current: number;
    total: number;
  };
}

export const DownloadProgress: React.FC<DownloadProgressProps> = ({ message, progress }) => {
  const progressValue = progress ? progress.current / progress.total : 0;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6200ee" />
      <Text style={styles.message}>{message}</Text>
      {progress && (
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progressValue}
            color="#6200ee"
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {Math.round(progressValue * 100)}% of {formatBytes(progress.total)}
          </Text>
        </View>
      )}
    </View>
  );
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
