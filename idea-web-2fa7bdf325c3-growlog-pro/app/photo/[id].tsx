import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { getPhotoById } from '../../lib/photos';
import { analyzePhotoHealth } from '../../lib/ai';
import AIHealthReport from '../../components/AIHealthReport';
import { MaterialIcons } from '@expo/vector-icons';

export default function PhotoDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { db, isPremium, aiChecksRemaining, decrementAIChecks } = useStore();
  const [photo, setPhoto] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (db && id) {
      loadPhoto();
    }
  }, [db, id]);

  async function loadPhoto() {
    if (!db) return;
    const photoData = await getPhotoById(db, Number(id));
    setPhoto(photoData);

    // If photo already has analysis, load it
    if (photoData?.aiAnalysis) {
      try {
        setAnalysis(JSON.parse(photoData.aiAnalysis));
      } catch (e) {
        console.error('Error parsing saved analysis:', e);
      }
    }
  }

  async function handleAnalyzePhoto() {
    if (!photo?.uri) return;

    // Check if user has remaining AI checks or is premium
    if (!isPremium && aiChecksRemaining <= 0) {
      Alert.alert(
        'AI Checks Limit Reached',
        'You\'ve used all your free AI checks this month. Upgrade to Premium to get unlimited checks!',
        [
          { text: 'Cancel' },
          { text: 'Upgrade', onPress: () => router.push('/settings/subscription') }
        ]
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzePhotoHealth(photo.uri);
      setAnalysis(result);

      // Save analysis to database
      if (db) {
        await db.runAsync(
          'UPDATE photos SET ai_analysis = ?, health_score = ? WHERE id = ?',
          [JSON.stringify(result), result.healthScore, photo.id]
        );
      }

      // Decrement remaining checks if not premium
      if (!isPremium) {
        decrementAIChecks();
      }
    } catch (error) {
      console.error('Error analyzing photo:', error);
      Alert.alert('Error', 'Failed to analyze photo. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  if (!photo) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading photo...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.dateText}>
          Taken on {new Date(photo.takenAt).toLocaleDateString()}
        </Text>

        {!analysis ? (
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={handleAnalyzePhoto}
            disabled={isAnalyzing}
          >
            <MaterialIcons name="visibility" size={20} color="white" />
            <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
          </TouchableOpacity>
        ) : (
          <AIHealthReport
            analysis={analysis.analysis}
            healthScore={analysis.healthScore}
            issues={analysis.issues}
            isLoading={isAnalyzing}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 300,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  analyzeButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
