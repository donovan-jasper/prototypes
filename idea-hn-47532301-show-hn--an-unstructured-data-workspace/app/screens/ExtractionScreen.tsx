import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useExtraction } from '../hooks/useExtraction';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface Entity {
  type: string;
  value: string;
}

interface ExtractionResult {
  entities?: Entity[];
  summary?: string;
  error?: string;
}

const ExtractionScreen = () => {
  const route = useRoute();
  const { text, audio, image } = route.params as { text?: string; audio?: string; image?: string };
  const { extractData, isLoading, result } = useExtraction();
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);

  useEffect(() => {
    const processData = async () => {
      if (audio) {
        try {
          const uri = FileSystem.documentDirectory + 'recording.m4a';
          await FileSystem.writeAsStringAsync(uri, audio, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setAudioUri(uri);
        } catch (error) {
          console.error('Audio processing error:', error);
        }
      }

      const extractionResponse = await extractData({ text, audio, image });
      setExtractionResult(extractionResponse);
    };

    processData();
  }, [text, audio, image]);

  const handleRetry = async () => {
    const extractionResponse = await extractData({ text, audio, image });
    setExtractionResult(extractionResponse);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Analyzing your data...</Text>
      </View>
    );
  }

  if (extractionResult?.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{extractionResult.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!extractionResult) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Preparing your data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Extracted Data</Text>

      {audioUri && (
        <View style={styles.audioContainer}>
          <Text style={styles.sectionTitle}>Recorded Audio:</Text>
          <AudioPlayer uri={audioUri} />
        </View>
      )}

      {extractionResult.entities && extractionResult.entities.length > 0 ? (
        <View style={styles.entitiesContainer}>
          <Text style={styles.sectionTitle}>Entities Found:</Text>
          {extractionResult.entities.map((entity, index) => (
            <View key={index} style={styles.entityItem}>
              <Text style={styles.entityType}>{entity.type}</Text>
              <Text style={styles.entityValue}>{entity.value}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>No entities found in the data.</Text>
      )}

      {extractionResult.summary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Summary:</Text>
          <Text style={styles.summaryText}>{extractionResult.summary}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const AudioPlayer = ({ uri }: { uri: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSound = async () => {
    try {
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate(status => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      } else {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <TouchableOpacity onPress={playSound} style={styles.audioButton}>
      <Text style={styles.audioButtonText}>
        {isPlaying ? 'Pause Audio' : 'Play Audio'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  audioContainer: {
    marginBottom: 20,
  },
  audioButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  entitiesContainer: {
    marginBottom: 20,
  },
  entityItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  entityType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  entityValue: {
    fontSize: 16,
    color: '#333',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

export default ExtractionScreen;
