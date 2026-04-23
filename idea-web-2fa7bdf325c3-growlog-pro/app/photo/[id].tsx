import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
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
  const [showModal, setShowModal] = useState(false);

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
    setShowModal(true);

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
            style={[
              styles.analyzeButton,
              (!isPremium && aiChecksRemaining <= 0) && styles.disabledButton
            ]}
            onPress={handleAnalyzePhoto}
            disabled={isAnalyzing || (!isPremium && aiChecksRemaining <= 0)}
          >
            <MaterialIcons name="visibility" size={20} color="white" />
            <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
            {!isPremium && aiChecksRemaining > 0 && (
              <Text style={styles.checksRemaining}>{aiChecksRemaining} checks left</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.viewResultsButton}
            onPress={() => setShowModal(true)}
          >
            <MaterialIcons name="assessment" size={20} color="#4CAF50" />
            <Text style={styles.viewResultsText}>View AI Analysis</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>

            {isAnalyzing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Analyzing your plant...</Text>
              </View>
            ) : analysis ? (
              <AIHealthReport
                analysis={analysis.analysis}
                healthScore={analysis.healthScore}
                issues={analysis.issues}
                isLoading={false}
              />
            ) : null}
          </View>
        </View>
      </Modal>
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
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  checksRemaining: {
    color: 'white',
    fontSize: 12,
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  viewResultsButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  viewResultsText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
