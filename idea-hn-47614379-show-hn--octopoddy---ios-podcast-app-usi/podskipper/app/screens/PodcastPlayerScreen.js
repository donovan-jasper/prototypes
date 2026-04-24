import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import PodcastPlayer from '../components/PodcastPlayer';
import TranscriptModal from '../components/TranscriptModal';

const PodcastPlayerScreen = ({ route }) => {
  const { episode } = route.params;
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <View style={styles.container}>
      <PodcastPlayer episode={episode} />
      <Button title="Show Transcript" onPress={() => setShowTranscript(true)} />
      <TranscriptModal
        visible={showTranscript}
        onClose={() => setShowTranscript(false)}
        transcript={episode.transcript}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PodcastPlayerScreen;
