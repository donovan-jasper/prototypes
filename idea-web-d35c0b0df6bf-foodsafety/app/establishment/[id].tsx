import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getEstablishmentDetails, getInspections } from '@/services/api';
import { getRecallAlertsForEstablishment } from '@/services/database';
import SafetyBadge from '@/components/SafetyBadge';
import InspectionTimeline from '@/components/InspectionTimeline';
import RecallAlert from '@/components/RecallAlert';
import { Establishment, Inspection, RecallAlert as RecallAlertType } from '@/types';

const EstablishmentDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [recallAlerts, setRecallAlerts] = useState<RecallAlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const establishmentData = await getEstablishmentDetails(id as string);
        const inspectionsData = await getInspections(id as string);
        const recallAlertsData = await getRecallAlertsForEstablishment(id as string);

        setEstablishment(establishmentData);
        setInspections(inspectionsData);
        setRecallAlerts(recallAlertsData);
      } catch (err) {
        setError('Failed to load establishment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
        <Text style={styles.name}>{establishment.name}</Text>
        <Text style={styles.address}>{establishment.address}</Text>
        <View style={styles.scoreContainer}>
          <SafetyBadge grade={establishment.safetyScore} />
          <Text style={styles.lastInspection}>
            Last inspected: {new Date(establishment.lastInspectionDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {recallAlerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recall Alerts</Text>
          {recallAlerts.map((alert, index) => (
            <RecallAlert
              key={index}
              recallDate={alert.recallDate}
              description={alert.description}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inspection History</Text>
        {inspections.length > 0 ? (
          <InspectionTimeline inspections={inspections} />
        ) : (
          <Text style={styles.noData}>No inspection history available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    marginLeft: 12,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  noData: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default EstablishmentDetailScreen;
