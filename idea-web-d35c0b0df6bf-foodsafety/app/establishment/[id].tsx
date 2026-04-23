import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getEstablishmentDetails, getInspections, getRecalls } from '@/services/api';
import { getRecallAlertsForEstablishment, saveLocation, isLocationSaved, removeLocation, markRecallAlertAsRead } from '@/services/database';
import SafetyBadge from '@/components/SafetyBadge';
import InspectionTimeline from '@/components/InspectionTimeline';
import RecallAlert from '@/components/RecallAlert';
import { Establishment, Inspection, Recall } from '@/types';
import { Ionicons } from '@expo/vector-icons';

const EstablishmentDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const establishmentData = await getEstablishmentDetails(id as string);
      const inspectionsData = await getInspections(id as string);
      const recallsData = await getRecalls(id as string);

      setEstablishment(establishmentData);
      setInspections(inspectionsData);
      setRecalls(recallsData);

      // Check if location is saved
      const saved = await isLocationSaved(id as string);
      setIsSaved(saved);

      // Mark all recall alerts as read when viewing the establishment
      if (recallsData.length > 0) {
        const alerts = await getRecallAlertsForEstablishment(id as string);
        await Promise.all(alerts.map(alert => markRecallAlertAsRead(alert.id)));
      }
    } catch (err) {
      setError('Failed to load establishment details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveLocation = async () => {
    try {
      if (isSaved) {
        await removeLocation(id as string);
        setIsSaved(false);
        Alert.alert('Location removed', 'This establishment has been removed from your saved locations.');
      } else {
        if (establishment) {
          await saveLocation({
            establishmentId: establishment.id,
            name: establishment.name,
            address: establishment.address,
            safetyScore: establishment.safetyScore,
            lastInspectionDate: establishment.lastInspectionDate,
            savedDate: new Date().toISOString()
          });
          setIsSaved(true);
          Alert.alert('Location saved', 'You will receive alerts for this location.');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save location. Please try again.');
      console.error(err);
    }
  };

  const handleRecallPress = (recall: Recall) => {
    Alert.alert(
      'Recall Details',
      `${recall.description}\n\nSeverity: ${recall.severity}\nDate: ${new Date(recall.recallDate).toLocaleDateString()}`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!establishment) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Establishment not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.name}>{establishment.name}</Text>
          <Text style={styles.address}>{establishment.address}</Text>
          <View style={styles.scoreContainer}>
            <SafetyBadge grade={establishment.safetyScore} />
            <Text style={styles.lastInspection}>
              Last inspected: {new Date(establishment.lastInspectionDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveLocation}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
      </View>

      {recalls.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recall Alerts</Text>
          {recalls.map((recall) => (
            <RecallAlert
              key={recall.id}
              recall={recall}
              onPress={() => handleRecallPress(recall)}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inspection History</Text>
        {inspections.length > 0 ? (
          <InspectionTimeline inspections={inspections} />
        ) : (
          <Text style={styles.noDataText}>No inspection history available</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Location</Text>
        <View style={styles.infoRow}>
          <Ionicons name="restaurant-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{establishment.cuisineType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            {establishment.isOpen ? 'Currently open' : 'Currently closed'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff3b30',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lastInspection: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  saveButton: {
    padding: 8,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
});

export default EstablishmentDetailScreen;
