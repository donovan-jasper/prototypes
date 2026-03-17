import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Request } from '../types';
import TrustScore from './TrustScore';
import { calculateDistance } from '../lib/location';

interface RequestCardProps {
  request: Request;
  userLocation: { latitude: number; longitude: number };
  onPress: () => void;
}

export default function RequestCard({ request, userLocation, onPress }: RequestCardProps) {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    request.latitude,
    request.longitude
  );

  const timeLeft = Math.round((new Date(request.expiresAt).getTime() - Date.now()) / 60000);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <TrustScore score={request.authorTrustScore} size="small" />
          <Text style={styles.authorName}>{request.authorName}</Text>
        </View>
        <Text style={styles.distance}>{distance.toFixed(1)} mi away</Text>
      </View>
      <Text style={styles.title}>{request.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{request.description}</Text>
      <Text style={styles.expires}>Expires in {timeLeft}m</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  distance: {
    fontSize: 12,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  expires: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
});
