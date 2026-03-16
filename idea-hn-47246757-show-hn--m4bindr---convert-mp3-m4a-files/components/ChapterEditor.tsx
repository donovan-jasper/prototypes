import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
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
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioFilePath },
        { shouldPlay: false }
      );
      setSound(newSound);
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
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
    const newChapter = {
      id: Date.now(),
      title: `Chapter ${chapters.length + 1}`,
      startTime: duration,
      endTime: duration,
    };
    setChapters([...chapters, newChapter]);
  };

  const updateChapter = (id: number, field: string, value: any) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === id ? { ...chapter, [field]: value } : chapter
      )
    );
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeString: string) => {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return (minutes * 60 + seconds) * 1000;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.chapterItem}>
            <TextInput
              style={styles.chapterTitle}
              value={item.title}
              onChangeText={(text) => updateChapter(item.id, 'title', text)}
            />
            <View style={styles.timeContainer}>
              <TextInput
                style={styles.timeInput}
                value={formatTime(item.startTime)}
                onChangeText={(text) => updateChapter(item.id, 'startTime', parseTime(text))}
              />
              <Text> - </Text>
              <TextInput
                style={styles.timeInput}
                value={formatTime(item.endTime)}
                onChangeText={(text) => updateChapter(item.id, 'endTime', parseTime(text))}
              />
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={addChapter}>
        <Text style={styles.addButtonText}>Add Chapter</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Chapters</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  chapterItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chapterTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 5,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CD964',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChapterEditor;
