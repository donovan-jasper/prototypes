import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { detectAd } from '../utils/adDetection';

const PodcastPlayer = ({ episode }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [adSegments, setAdSegments] = useState([]);

  useEffect(() => {
    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        { uri: episode.audioUrl },
        { shouldPlay: false }
      );
      setSound(sound);
      setDuration(await sound.getStatusAsync().then(status => status.durationMillis));
      const segments = await detectAd(episode);
      setAdSegments(segments);
    })();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [episode]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkipAd = async () => {
    const currentPosition = await sound.getStatusAsync().then(status => status.positionMillis);
    const nextAd = adSegments.find(segment => segment.start > currentPosition);
    if (nextAd) {
      await sound.setPositionAsync(nextAd.end);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{episode.title}</Text>
      <Text style={styles.duration}>{`${Math.floor(position / 60000)}:${Math.floor((position % 60000) / 1000).toFixed(0).padStart(2, '0')}/${Math.floor(duration / 60000)}:${Math.floor((duration % 60000) / 1000).toFixed(0).padStart(2, '0')}`}</Text>
      <Button title={isPlaying ? 'Pause' : 'Play'} onPress={handlePlayPause} />
      <Button title="Skip Ad" onPress={handleSkipAd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  duration: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default PodcastPlayer;
