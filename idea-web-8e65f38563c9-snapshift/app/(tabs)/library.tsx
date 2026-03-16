import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useVoiceLibrary } from '../../hooks/useVoiceLibrary';
import VoicePlayer from '../../components/VoicePlayer';
import { SubscriptionContext } from '../../context/SubscriptionContext';

export default function LibraryScreen() {
  const { voiceClips, playClip } = useVoiceLibrary();
  const { isPremium } = useContext(SubscriptionContext);

  const renderItem = ({ item }) => (
    <VoicePlayer
      clip={item}
      onPlay={() => playClip(item.id)}
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
});
