import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '../../../store/useStore';
import { takePhoto, savePhoto } from '../../../lib/photos';
import { analyzePhotoHealth } from '../../../lib/ai';
import AIHealthReport from '../../../components/AIHealthReport';
import * as FileSystem from 'expo-file-system';

export default function PlantPhotoScreen() {
  const router = useRouter();
  const { id: plantId } = useLocalSearchParams<{ id: string }>();
  const { db, isPremium, aiChecksRemaining, decrementAIChecks } = useStore();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    analysis: string;
    healthScore: number;
    issues: string[];
  } | null>(null);

  useEffect(() => {
    if (!isPremium && aiChecksRemaining <= 0) {
      Alert.alert(
        'AI Checks Limit Reached',
        'You\'ve used all your free AI checks this month. Upgrade to Premium to get unlimited checks.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/upgrade') }
        ]
      );
    }
  }, [isPremium, aiChecksRemaining]);

  const handleTakePhoto = async () => {
    if (!isPremium && aiChecksRemaining <= 0) {
      Alert.alert(
        'Limit Reached',
        'You need a Premium subscription to perform more AI checks this month.'
      );
      return;
    }

    try {
      const uri = await takePhoto();
      if (uri) {
        setPhotoUri(uri);
        setAnalysisResult(null);
        await analyzePhoto(uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const analyzePhoto = async (uri: string) => {
    if (!db || !plantId) return;

    setIsAnalyzing(true);

    try {
      // Save photo to database
      const photoId = await savePhoto(db, parseInt(plantId), uri);

      // Analyze with AI
      const result = await analyzePhotoHealth(uri);
      setAnalysisResult(result);

      // Update database with analysis results
      await db.runAsync(
        'UPDATE photos SET ai_analysis = ?, health_score = ? WHERE id = ?',
        [result.analysis, result.healthScore, photoId]
      );

      // Decrement AI checks if not premium
      if (!isPremium) {
        decrementAIChecks();
      }
    } catch (error) {
      console.error('Error analyzing photo:', error);
      Alert.alert('Error', 'Failed to analyze photo. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToTimeline = async () => {
    if (!photoUri || !db || !plantId) return;

    try {
      // Photo is already saved during analysis
      Alert.alert('Success', 'Photo saved to your plant timeline!');
      router.back();
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Plant Health Check</Text>

      <View style={styles.photoContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No photo taken yet</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleTakePhoto}
          disabled={isAnalyzing || (!isPremium && aiChecksRemaining <= 0)}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        {photoUri && !isAnalyzing && (
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveToTimeline}
          >
            <Text style={styles.buttonText}>Save to Timeline</Text>
          </TouchableOpacity>
        )}
      </View>

      {isAnalyzing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Analyzing your plant...</Text>
        </View>
      )}

      {analysisResult && (
        <AIHealthReport
          analysis={analysisResult.analysis}
          healthScore={analysisResult.healthScore}
          issues={analysisResult.issues}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 24,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
});
