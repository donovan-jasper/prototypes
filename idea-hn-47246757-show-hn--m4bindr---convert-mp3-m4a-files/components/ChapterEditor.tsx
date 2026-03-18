import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { updateChapters } from '@/lib/db/chapters';

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
  const [chapters, setChapters] = useState(initialChapters);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [duration, setDuration] = useState(0);

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

  const handleSave = async () => {
    await updateChapters(audiobookId, chapters);
    onSave();
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
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
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={addChapter}>
          <Text style={styles.addButtonText}>Add Chapter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Audiobook</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  chapterItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chapterNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  removeButton: {
    color: '#FF3B30',
    fontSize: 14,
  },
  chapterTitle: {
    fontSize: 16,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  timeLabel: {
    fontSize: 14,
    marginRight: 5,
    color: '#666',
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButton: {
    backgroundColor: '#4CD964',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
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
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChapterEditor;
