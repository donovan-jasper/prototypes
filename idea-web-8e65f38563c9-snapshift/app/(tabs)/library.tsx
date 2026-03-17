import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useVoiceLibrary } from '../../hooks/useVoiceLibrary';
import VoicePlayer from '../../components/VoicePlayer';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import { useAudio } from '../../hooks/useAudio';

export default function LibraryScreen() {
  const { voiceClips } = useVoiceLibrary();
  const { isPremium } = useContext(SubscriptionContext);
  const { playAudio, stopAudio, isLoading, error } = useAudio();
  const [currentClip, setCurrentClip] = useState<string | null>(null);

  const handlePlayClip = async (clipId: string) => {
    try {
      if (currentClip === clipId) {
        await stopAudio();
        setCurrentClip(null);
      } else {
        await stopAudio();
        const clip = voiceClips.find(c => c.id === clipId);
        if (clip) {
          await playAudio(clip.audioFile);
          setCurrentClip(clipId);
        }
      }
    } catch (err) {
      console.error('Error playing clip:', err);
    }
  };

  const renderItem = ({ item }) => (
    <VoicePlayer
      clip={item}
      onPlay={() => handlePlayClip(item.id)}
      isLocked={item.isPremium && !isPremium}
    />
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Library</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Morning Boost</Text>
        <FlatList
          data={voiceClips.filter((clip) => clip.category === 'morning')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus</Text>
        <FlatList
          data={voiceClips.filter((clip) => clip.category === 'focus')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Energy</Text>
        <FlatList
          data={voiceClips.filter((clip) => clip.category === 'energy')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calm</Text>
        <FlatList
          data={voiceClips.filter((clip) => clip.category === 'calm')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Celebrate</Text>
        <FlatList
          data={voiceClips.filter((clip) => clip.category === 'celebrate')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      {isLoading && <Text style={styles.loadingText}>Loading audio...</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {currentClip && (
        <TouchableOpacity style={styles.stopAllButton} onPress={stopAudio}>
          <Text style={styles.stopAllButtonText}>Stop All</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingText: {
    textAlign: 'center',
    color: '#673ab7',
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
    color: '#e53935',
    marginTop: 8,
  },
  stopAllButton: {
    backgroundColor: '#673ab7',
    padding: 12,
    margin: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  stopAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
