import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getSensorReadings } from '@/lib/storage/database';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { generateShareLink } from '@/lib/export/share';
import { useStore } from '@/store';

type DataExporterProps = {
  sensorId: string;
  sensorName: string;
};

const DataExporter = ({ sensorId, sensorName }: DataExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const { subscriptionStatus } = useStore();

  const exportToCSV = async () => {
    setIsExporting(true);

    try {
      // Get all readings for this sensor
      const readings = await getSensorReadings(sensorId, 10000); // Max 10,000 points

      // Convert to CSV format
      let csvContent = 'timestamp,value,confidence\n';
      readings.forEach((reading: any) => {
        csvContent += `${reading.timestamp},${reading.value},${reading.confidence || 1}\n`;
      });

      // Create file
      const fileUri = `${FileSystem.documentDirectory}${sensorName}_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: `Export ${sensorName} data`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Could not export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateShareableLink = async () => {
    setIsGeneratingLink(true);

    try {
      const link = await generateShareLink(sensorId, '24h'); // Default to last 24 hours
      await Sharing.shareAsync(link, {
        dialogTitle: `Share ${sensorName} data`,
        message: `Here's a link to view ${sensorName} data: ${link}`,
      });
    } catch (error) {
      console.error('Link generation failed:', error);
      Alert.alert('Link Generation Failed', 'Could not generate shareable link. Please try again.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const generateAnalyticsReport = async () => {
    if (subscriptionStatus !== 'premium') {
      Alert.alert('Premium Feature', 'Advanced analytics requires a premium subscription');
      return;
    }

    Alert.alert('Analytics Report', 'Generating machine learning insights...');
    // In a real implementation, this would call a backend service
    // to generate and return analytics reports
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Export Data</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={exportToCSV}
        disabled={isExporting || isGeneratingLink}
      >
        {isExporting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Export to CSV</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.shareButton]}
        onPress={generateShareableLink}
        disabled={isExporting || isGeneratingLink}
      >
        {isGeneratingLink ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Generate Shareable Link</Text>
        )}
      </TouchableOpacity>

      {subscriptionStatus === 'premium' && (
        <TouchableOpacity
          style={[styles.button, styles.analyticsButton]}
          onPress={generateAnalyticsReport}
        >
          <Text style={styles.buttonText}>Generate Analytics Report</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  shareButton: {
    backgroundColor: '#2196F3',
  },
  analyticsButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DataExporter;
