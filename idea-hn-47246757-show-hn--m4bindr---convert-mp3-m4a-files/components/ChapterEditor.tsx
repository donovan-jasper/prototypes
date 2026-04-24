import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { updateChapters } from '@/lib/db/chapters';
import { mergeAudioFiles } from '@/lib/audio/processor';
import { useRouter } from 'expo-router';
import { Canvas, Path, Skia, useTouchHandler } from '@shopify/react-native-skia';

interface Chapter {
  id: number;
  title: string;
  startTime: number;
  endTime: number;
}

interface ChapterEditorProps {
  audiobookId: number;
  initialChapters: Chapter[];
  audioFilePath: string;
  onSave: () => void;
}

const ChapterEditor: React.FC<ChapterEditorProps> = ({ audiobookId, initialChapters, audioFilePath, onSave }) => {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const canvasRef = useRef<Canvas>(null);
  const { width: screenWidth } = Dimensions.get('window');

  useEffect(() => {
    const loadAudio = async () => {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioFilePath },
          { shouldPlay: false }
        );
        setSound(newSound);
        const status = await newSound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
          generateWaveform(newSound);
        }
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };
    loadAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioFilePath]);

  const generateWaveform = async (sound: Audio.Sound) => {
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;

      const samples = await sound.getAudioSamplesAsync({
        numberOfSamples: 100,
        minSampleValue: -1,
        maxSampleValue: 1,
      });

      if (samples.isLoaded) {
        setWaveformData(samples.samples);
      }
    } catch (error) {
      console.error('Error generating waveform:', error);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      // Update chapters in database
      await updateChapters(audiobookId, chapters);

      // Merge audio files if multiple were imported
      const mergedFilePath = await mergeAudioFiles([audioFilePath]);

      // Navigate back to library
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error saving chapters:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const addChapter = () => {
    const lastChapter = chapters[chapters.length - 1];
    const newStartTime = lastChapter ? lastChapter.endTime : 0;
    const newChapter = {
      id: Date.now(),
      title: `Chapter ${chapters.length + 1}`,
      startTime: newStartTime,
      endTime: Math.min(newStartTime + 600000, duration),
    };
    setChapters([...chapters, newChapter]);
  };

  const removeChapter = (id: number) => {
    if (chapters.length > 1) {
      setChapters(chapters.filter((chapter) => chapter.id !== id));
    }
  };

  const updateChapter = (id: number, field: string, value: any) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === id ? { ...chapter, [field]: value } : chapter
      )
    );
  };

  const formatTime = (millis: number) => {
    const hours = Math.floor(millis / 3600000);
    const minutes = Math.floor((millis % 3600000) / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeString: string) => {
    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return (hours * 3600 + minutes * 60 + seconds) * 1000;
    } else if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return (minutes * 60 + seconds) * 1000;
    }
    return 0;
  };

  const renderWaveform = () => {
    if (waveformData.length === 0 || !duration) return null;

    const path = Skia.Path.Make();
    const width = screenWidth - 40;
    const height = 100;
    const step = width / waveformData.length;

    path.moveTo(0, height / 2);

    waveformData.forEach((sample, index) => {
      const x = index * step;
      const y = (sample * height / 2) + (height / 2);
      path.lineTo(x, y);
    });

    return (
      <Canvas ref={canvasRef} style={{ width, height }}>
        <Path path={path} color="blue" style="stroke" strokeWidth={2} />
      </Canvas>
    );
  };

  const renderChapterMarkers = () => {
    if (waveformData.length === 0 || !duration) return null;

    const width = screenWidth - 40;
    const height = 100;

    return chapters.map((chapter, index) => {
      const startX = (chapter.startTime / duration) * width;
      const endX = (chapter.endTime / duration) * width;

      return (
        <View
          key={chapter.id}
          style={[
            styles.chapterMarker,
            {
              left: startX,
              width: endX - startX,
              height: height,
            }
          ]}
        >
          <Text style={styles.chapterMarkerText}>{index + 1}</Text>
        </View>
      );
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.waveformContainer}>
        {renderWaveform()}
        <View style={styles.chapterMarkersContainer}>
          {renderChapterMarkers()}
        </View>
      </View>

      <View style={styles.chaptersContainer}>
        {chapters.map((item, index) => (
          <View key={item.id} style={styles.chapterItem}>
            <View style={styles.chapterHeader}>
              <Text style={styles.chapterNumber}>Chapter {index + 1}</Text>
              {chapters.length > 1 && (
                <TouchableOpacity onPress={() => removeChapter(item.id)}>
                  <Text style={styles.removeButton}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.chapterTitle}
              value={item.title}
              onChangeText={(text) => updateChapter(item.id, 'title', text)}
              placeholder="Chapter title"
            />
            <View style={styles.timeContainer}>
              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>Start:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={formatTime(item.startTime)}
                  onChangeText={(text) => updateChapter(item.id, 'startTime', parseTime(text))}
                />
              </View>
              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>End:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={formatTime(item.endTime)}
                  onChangeText={(text) => updateChapter(item.id, 'endTime', parseTime(text))}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={addChapter}>
          <Text style={styles.addButtonText}>Add Chapter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isProcessing && styles.disabledButton]}
          onPress={handleSave}
          disabled={isProcessing}
        >
          <Text style={styles.saveButtonText}>
            {isProcessing ? 'Processing...' : 'Save Audiobook'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  waveformContainer: {
    margin: 20,
    position: 'relative',
  },
  chapterMarkersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chapterMarker: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterMarkerText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chaptersContainer: {
    paddingHorizontal: 20,
  },
  chapterItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chapterNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    color: '#FF3B30',
    fontSize: 14,
  },
  chapterTitle: {
    fontSize: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  timeInput: {
    fontSize: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  addButton: {
    backgroundColor: '#4CD964',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default ChapterEditor;
