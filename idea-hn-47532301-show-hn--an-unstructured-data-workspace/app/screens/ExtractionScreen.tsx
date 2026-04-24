import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
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

  useEffect(() => {
    const processData = async () => {
      try {
        if (audio) {
          // Handle audio data
          const uri = FileSystem.documentDirectory + 'recording.m4a';
          await FileSystem.writeAsStringAsync(uri, audio, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setAudioUri(uri);

          // In a real app, you would transcribe the audio here
          // For demo purposes, we'll use mock text
          const mockText = "This is a transcription of the recorded audio. The customer mentioned they need to schedule an appointment for December 15th at 2:30 PM.";
          const result = await extractData(mockText);
          setExtractedData(result);
        } else if (image) {
          // Handle image data
          // In a real app, you would process the image with OCR here
          // For demo purposes, we'll use mock text
          const mockText = "Invoice #12345\nDate: 2023-12-15\nTotal: $150.00\nCustomer: John Doe";
          const result = await extractData(mockText);
          setExtractedData(result);
        } else if (text) {
          // Handle text data
          const result = await extractData(text);
          setExtractedData(result);
        }
      } catch (error) {
        console.error('Extraction failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    processData();
  }, [text, audio, image]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Analyzing your data...</Text>
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
        <Text>No entities found in the data.</Text>
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  entitiesContainer: {
    marginTop: 10,
  },
  entityItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  entityType: {
    fontWeight: 'bold',
    color: '#666',
  },
  entityValue: {
    marginTop: 5,
  },
  audioContainer: {
    marginBottom: 20,
  },
  audioButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  audioButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ExtractionScreen;
