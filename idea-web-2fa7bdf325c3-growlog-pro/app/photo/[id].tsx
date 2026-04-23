import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { getPhotosForPlant } from '../../lib/photos';
import { analyzePhotoHealth } from '../../lib/ai';
import AIHealthReport from '../../components/AIHealthReport';
import { Ionicons } from '@expo/vector-icons';

export default function PhotoDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { db, aiChecksRemaining, decrementAIChecks } = useStore();
  const [photo, setPhoto] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (db && id) {
      loadPhoto();
    }
  }, [db, id]);

  async function loadPhoto() {
    if (!db || !id) return;

    try {
      const photos = await getPhotosForPlant(db, Number(id));
      if (photos.length > 0) {
        setPhoto(photos[0]);
      }
    } catch (err) {
      setError('Failed to load photo');
    }
  }

  async function runAIAnalysis() {
    if (!photo || !photo.uri) return;

    if (aiChecksRemaining <= 0) {
      setError('You have used all your free AI checks. Upgrade to Premium for unlimited checks.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzePhotoHealth(photo.uri);
      setAnalysis(result);
      decrementAIChecks();
    } catch (err) {
      setError('Failed to analyze photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!photo) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="contain" />

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={runAIAnalysis}
          disabled={isLoading || !!analysis}
        >
          <Ionicons name="scan" size={20} color="white" />
          <Text style={styles.analyzeButtonText}>
            {analysis ? 'Analysis Complete' : 'Analyze with AI'}
          </Text>
        </TouchableOpacity>

        {aiChecksRemaining > 0 && (
          <Text style={styles.checksRemaining}>
            {aiChecksRemaining} AI checks remaining
          </Text>
        )}
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Analyzing your plant...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {analysis && (
        <AIHealthReport
          analysis={analysis.analysis}
          healthScore={analysis.healthScore}
          issues={analysis.issues}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: 300,
    marginBottom: 16,
  },
  actions: {
    padding: 16,
    alignItems: 'center',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  checksRemaining: {
    color: '#666',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
  },
});
