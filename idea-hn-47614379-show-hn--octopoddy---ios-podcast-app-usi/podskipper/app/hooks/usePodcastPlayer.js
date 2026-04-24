import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { detectAd } from '../utils/adDetection';

const usePodcastPlayer = (episode) => {
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

  return {
    sound,
    isPlaying,
    position,
    duration,
    adSegments,
    handlePlayPause,
    handleSkipAd,
  };
};

export default usePodcastPlayer;
