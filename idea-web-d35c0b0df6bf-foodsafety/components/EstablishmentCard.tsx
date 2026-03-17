import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SafetyBadge from './SafetyBadge';
import { Ionicons } from '@expo/vector-icons';

interface EstablishmentCardProps {
  id: string;
  name: string;
  address: string;
  safetyScore: string;
  lastInspectionDate: string;
  recallCount?: number;
}

const EstablishmentCard: React.FC<EstablishmentCardProps> = ({
  id,
  name,
  address,
  safetyScore,
  lastInspectionDate,
  recallCount = 0
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/establishment/[id]',
      params: { id }
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {recallCount > 0 && (
            <View style={styles.recallBadge}>
              <Text style={styles.recallCount}>{recallCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.address} numberOfLines={1}>{address}</Text>
        <View style={styles.footer}>
          <SafetyBadge grade={safetyScore} size={24} />
          <Text style={styles.lastInspection}>
            Last inspected: {new Date(lastInspectionDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" style={styles.arrow} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  recallBadge: {
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  recallCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastInspection: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  arrow: {
    marginLeft: 8,
  },
});

export default EstablishmentCard;
