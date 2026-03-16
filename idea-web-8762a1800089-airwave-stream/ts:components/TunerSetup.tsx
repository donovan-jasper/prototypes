import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { discoverTuners } from '../lib/tuner';

interface Tuner {
  id: string;
  ip: string;
  model: string;
}

interface Props {
  onComplete: () => void;
}

export default function TunerSetup({ onComplete }: Props) {
  const [scanning, setScanning] = useState(true);
  const [tuners, setTuners] = useState<Tuner[]>([]);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const scanForTuners = async () => {
      try {
        // Simulate scanning for tuners
        setTimeout(() => {
          setTuners([
            { id: '1', ip: '192.168.1.100', model: 'HDHomeRun PRIME' },
            { id: '2', ip: '192.168.1.101', model: 'HDHomeRun DUAL' },
          ]);
          setScanning(false);
        }, 2000);
      } catch (error) {
        console.error('Error discovering tuners:', error);
        setScanning(false);
      }
    };

    scanForTuners();
  }, []);

  const connectToTuner = async (tuner: Tuner) => {
    setConnecting(true);
    try {
      // Save tuner configuration
      await AsyncStorage.setItem('tunerConfig', JSON.stringify(tuner));
      Alert.alert('Success', `Connected to ${tuner.model} at ${tuner.ip}`);
      onComplete();
    } catch (error) {
      console.error('Error connecting to tuner:', error);
      Alert.alert('Error', 'Failed to connect to tuner');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set up your OTA Tuner</Text>
      
      {scanning ? (
        <View style={styles.scanningContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.scanningText}>Searching for tuners on your network...</Text>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {tuners.length > 0 ? (
            <>
              <Text style={styles.resultsText}>Found {tuners.length} tuner(s):</Text>
              {tuners.map((tuner) => (
                <View key={tuner.id} style={styles.tunerCard}>
                  <Text style={styles.tunerModel}>{tuner.model}</Text>
                  <Text style={styles.tunerIP}>{tuner.ip}</Text>
                  <Button 
                    title={connecting ? "Connecting..." : "Connect"} 
                    onPress={() => connectToTuner(tuner)}
                    disabled={connecting}
                  />
                </View>
              ))}
            </>
          ) : (
            <View style={styles.noTunerContainer}>
              <Text style={styles.noTunerText}>No tuners found on your network.</Text>
              <Text style={styles.instructions}>
                Make sure your OTA tuner is connected to the same WiFi network as your device.
              </Text>
              <Button 
                title="Try Again" 
                onPress={() => {
                  setScanning(true);
                  setTimeout(() => {
                    setTuners([
                      { id: '1', ip: '192.168.1.100', model: 'HDHomeRun PRIME' },
                    ]);
                    setScanning(false);
                  }, 2000);
                }} 
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scanningContainer: {
    alignItems: 'center',
  },
  scanningText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  tunerCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tunerModel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tunerIP: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  noTunerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  noTunerText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
});
