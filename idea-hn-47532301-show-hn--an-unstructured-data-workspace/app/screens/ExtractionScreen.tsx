import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { extractData } from '../utils/extraction';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const ExtractionScreen = () => {
  const route = useRoute();
  const { text, audio, image } = route.params as { text?: string; audio?: string; image?: string };
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (audio) {
          // Handle audio data
          const uri = FileSystem.documentDirectory + 'recording.m4a';
          await FileSystem.writeAsStringAsync(uri, audio, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setAudioUri(uri);

          // In a real app, you would transcribe the audio here
          // For demo purposes, we'll use mock text
          const result = await extractData({ audio });
          setExtractedData(result);
        } else if (image) {
          // Handle image data
          const result = await extractData({ image });
          setExtractedData(result);
        } else if (text) {
          // Handle text data
          const result = await extractData({ text });
          setExtractedData(result);
        }
      } catch (error) {
        console.error('Extraction failed:', error);
        setError('Failed to process data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    processData();
  }, [text, audio, image]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Analyzing your data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => processData()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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

      {extractedData?.entities && extractedData.entities.length > 0 ? (
        <View style={styles.entitiesContainer}>
          <Text style={styles.sectionTitle}>Entities Found:</Text>
          {extractedData.entities.map((entity: any, index: number) => (
            <View key={index} style={styles.entityItem}>
              <Text style={styles.entityType}>{entity.type}</Text>
              <Text style={styles.entityValue}>{entity.value}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>No entities found in the data.</Text>
      )}

      {extractedData?.summary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Summary:</Text>
          <Text style={styles.summaryText}>{extractedData.summary}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const AudioPlayer = ({ uri }: { uri: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSound = async () => {
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
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  entitiesContainer: {
    marginTop: 10,
  },
  entityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 8,
  },
  entityType: {
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'capitalize',
  },
  entityValue: {
    marginTop: 5,
    color: '#333',
  },
  noDataText: {
    color: '#666',
    marginTop: 10,
  },
  audioContainer: {
    marginBottom: 20,
  },
  audioButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  audioButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 5,
  },
  summaryText: {
    color: '#333',
    lineHeight: 22,
  },
});

export default ExtractionScreen;
