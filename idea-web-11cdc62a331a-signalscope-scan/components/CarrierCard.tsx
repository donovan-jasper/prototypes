import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CarrierCardProps {
  carrier: string;
  signal: number;
  speed: number;
  upload: number;
  reliability: number;
  rank: number;
}

const CarrierCard: React.FC<CarrierCardProps> = ({
  carrier,
  signal,
  speed,
  upload,
  reliability,
  rank
}) => {
  const getSignalColor = (value: number) => {
    if (value > 80) return '#2E8B57';
    if (value > 60) return '#FFD700';
    return '#FF4500';
  };

  const getSpeedColor = (value: number) => {
    if (value > 90) return '#2E8B57';
    if (value > 70) return '#FFD700';
    return '#FF4500';
  };

  const getReliabilityColor = (value: number) => {
    if (value > 90) return '#2E8B57';
    if (value > 70) return '#FFD700';
    return '#FF4500';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.rank}>#{rank}</Text>
        <Text style={styles.carrier}>{carrier}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="wifi" size={20} color={getSignalColor(signal)} />
          <Text style={styles.statLabel}>Signal:</Text>
          <Text style={[styles.statValue, { color: getSignalColor(signal) }]}>{signal}%</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="cloud-download" size={20} color={getSpeedColor(speed)} />
          <Text style={styles.statLabel}>Download:</Text>
          <Text style={[styles.statValue, { color: getSpeedColor(speed) }]}>{speed} Mbps</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="cloud-upload" size={20} color={getSpeedColor(upload)} />
          <Text style={styles.statLabel}>Upload:</Text>
          <Text style={[styles.statValue, { color: getSpeedColor(upload) }]}>{upload} Mbps</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="stats-chart" size={20} color={getReliabilityColor(reliability)} />
          <Text style={styles.statLabel}>Reliability:</Text>
          <Text style={[styles.statValue, { color: getReliabilityColor(reliability) }]}>{reliability}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  carrier: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '48%',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CarrierCard;
