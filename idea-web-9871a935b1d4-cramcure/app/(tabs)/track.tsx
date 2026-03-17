import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import SymptomLogger from '@/components/SymptomLogger';
import CycleCalendar from '@/components/CycleCalendar';
import { useDatabase } from '@/hooks/useDatabase';
import { addSymptom } from '@/services/database';

export default function TrackScreen() {
  const { db, isLoading, error } = useDatabase();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSave = async (symptomData: {
    painLevel: number;
    location: string;
    type: string[];
    mood: string;
    energy: number;
    notes: string;
  }) => {
    if (!db) return;

    setSaveStatus('saving');
    try {
      await addSymptom(db, {
        date: new Date().toISOString(),
        painLevel: symptomData.painLevel,
        location: symptomData.location,
        type: symptomData.type.join(', '),
        mood: symptomData.mood,
        energy: symptomData.energy,
        notes: symptomData.notes,
      });
      setSaveStatus('success');
      setRefreshKey(prev => prev + 1);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to save symptom:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load database</Text>
          <Text style={styles.errorDetail}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Track Symptoms</Text>
          <Text style={styles.subtitle}>Log how you're feeling today</Text>
        </View>

        {saveStatus === 'success' && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Symptoms saved successfully</Text>
          </View>
        )}

        {saveStatus === 'error' && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>Failed to save. Please try again.</Text>
          </View>
        )}

        {db && <CycleCalendar key={refreshKey} db={db} />}

        <SymptomLogger onSave={handleSave} isLoading={saveStatus === 'saving'} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  successText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  errorBannerText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
