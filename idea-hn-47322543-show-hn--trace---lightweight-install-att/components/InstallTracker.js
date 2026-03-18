import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { insertInstall } from '../services/InstallService';

const PREDEFINED_SOURCES = [
  'Social Media',
  'Paid Ads',
  'Referral',
  'Organic',
  'Email Campaign',
  'Influencer'
];

const InstallTracker = () => {
  const [installCount, setInstallCount] = useState(0);
  const [selectedSource, setSelectedSource] = useState(null);
  const [customSource, setCustomSource] = useState('');

  const trackInstall = async () => {
    try {
      const source = selectedSource === 'Custom' ? customSource : selectedSource;
      if (!source) {
        alert('Please select or enter a source');
        return;
      }
      await insertInstall(source);
      setInstallCount(installCount + 1);
      setSelectedSource(null);
      setCustomSource('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Track Install</Text>
      
      <Text style={styles.sectionTitle}>Select Source:</Text>
      <View style={styles.sourceGrid}>
        {PREDEFINED_SOURCES.map((source) => (
          <TouchableOpacity
            key={source}
            style={[
              styles.sourceButton,
              selectedSource === source && styles.sourceButtonSelected
            ]}
            onPress={() => setSelectedSource(source)}
          >
            <Text style={[
              styles.sourceButtonText,
              selectedSource === source && styles.sourceButtonTextSelected
            ]}>
              {source}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Or Enter Custom Source:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter custom source"
        value={customSource}
        onChangeText={(text) => {
          setCustomSource(text);
          if (text) {
            setSelectedSource('Custom');
          }
        }}
      />

      <TouchableOpacity style={styles.trackButton} onPress={trackInstall}>
        <Text style={styles.trackButtonText}>Track Install</Text>
      </TouchableOpacity>

      <View style={styles.countContainer}>
        <Text style={styles.countLabel}>Total Installs Tracked:</Text>
        <Text style={styles.countValue}>{installCount}</Text>
      </View>
    </ScrollView>
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
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#555',
  },
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sourceButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  sourceButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sourceButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  sourceButtonTextSelected: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  trackButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  countContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  countLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  countValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default InstallTracker;
