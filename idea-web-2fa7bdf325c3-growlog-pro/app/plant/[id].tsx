import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { getPlant } from '../../lib/plants';
import { takePhoto, savePhoto, getPhotosForPlant } from '../../lib/photos';
import { analyzePhotoHealth } from '../../lib/ai';
import { Plant, Photo } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import AIHealthReport from '../../components/AIHealthReport';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { db, isPremium, aiChecksRemaining, decrementAIChecks } = useStore();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    analysis: string;
    healthScore: number;
    issues: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (db && id) {
      loadPlant();
      loadPhotos();
    }
  }, [db, id]);

  async function loadPlant() {
    if (!db || !id) return;
    const plantData = await getPlant(db, parseInt(id));
    setPlant(plantData);
  }

  async function loadPhotos() {
    if (!db || !id) return;
    const plantPhotos = await getPhotosForPlant(db, parseInt(id));
    setPhotos(plantPhotos);
  }

  async function handleTakePhoto() {
    if (!db || !id) return;

    // Check if user has remaining AI checks or is premium
    if (!isPremium && aiChecksRemaining <= 0) {
      alert('You need a premium subscription for unlimited AI health checks');
      return;
    }

    const photoUri = await takePhoto();
    if (!photoUri) return;

    setIsAnalyzing(true);
    try {
      // Save photo to database
      const photoId = await savePhoto(db, parseInt(id), photoUri);

      // Analyze photo with AI
      const result = await analyzePhotoHealth(photoUri);

      // Update photo with analysis results
      await db.runAsync(
        'UPDATE photos SET ai_analysis = ?, health_score = ? WHERE id = ?',
        [result.analysis, result.healthScore, photoId]
      );

      // Update state
      setAnalysisResult(result);
      setShowAnalysisModal(true);

      // Decrement remaining checks if not premium
      if (!isPremium) {
        decrementAIChecks();
      }

      // Reload photos to show the new one
      loadPhotos();
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze photo. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  if (!plant) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.plantName}>{plant.name}</Text>
        <Text style={styles.plantType}>{plant.type}</Text>
        <Text style={styles.plantDate}>
          Planted on {new Date(plant.plantedDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Check</Text>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleTakePhoto}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="scan" size={20} color="white" />
              <Text style={styles.aiButtonText}>AI Health Check</Text>
            </>
          )}
        </TouchableOpacity>
        {!isPremium && (
          <Text style={styles.remainingChecks}>
            {aiChecksRemaining} checks remaining
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        {photos.length === 0 ? (
          <Text style={styles.noPhotos}>No photos yet. Take your first photo!</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoContainer}>
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.photo}
                />
                {photo.healthScore && (
                  <View style={styles.healthScoreBadge}>
                    <Text style={styles.healthScoreText}>{photo.healthScore}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <Modal
        visible={showAnalysisModal}
        animationType="slide"
        onRequestClose={() => setShowAnalysisModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>AI Health Analysis</Text>
            <TouchableOpacity onPress={() => setShowAnalysisModal(false)}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
          </View>

          {analysisResult && (
            <AIHealthReport
              analysis={analysisResult.analysis}
              healthScore={analysisResult.healthScore}
              issues={analysisResult.issues}
            />
          )}
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
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  plantType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  plantDate: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  aiButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  remainingChecks: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  noPhotos: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  healthScoreBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthScoreText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
