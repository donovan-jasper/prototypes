import * as SQLite from 'expo-sqlite';
import { Audio } from 'expo-av';

const db = SQLite.openDatabase('podskipper.db');

const AUDIO_SAMPLE_RATE = 44100; // Standard sample rate
const SILENCE_THRESHOLD = 0.01; // Volume threshold for silence detection
const MIN_SILENCE_DURATION = 1000; // Minimum silence duration in ms
const MIN_AD_DURATION = 5000; // Minimum ad duration in ms

// Initialize database tables
const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS ad_segments (id INTEGER PRIMARY KEY AUTOINCREMENT, episode_id TEXT, start INTEGER, end INTEGER);'
    );
  });
};

// Analyze audio buffer for volume
const analyzeAudioBuffer = (buffer) => {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += Math.abs(buffer[i]);
  }
  return sum / buffer.length;
};

export const detectAd = async (episode) => {
  try {
    initializeDatabase();

    // Load audio file
    const soundObject = new Audio.Sound();
    await soundObject.loadAsync({ uri: episode.audioUrl });

    // Get audio duration
    const status = await soundObject.getStatusAsync();
    const duration = status.durationMillis || 0;

    // Analyze audio in 1-second chunks
    const analysisInterval = 1000; // 1 second in ms
    const totalSamples = Math.floor(duration / analysisInterval);
    let silentSegments = [];
    let currentSilenceStart = null;

    // Process audio in chunks
    for (let i = 0; i < totalSamples; i++) {
      const position = i * analysisInterval;
      const startTime = position / 1000;
      const endTime = (position + analysisInterval) / 1000;

      // Get audio data for this chunk
      const { isLoaded } = await soundObject.getStatusAsync();
      if (!isLoaded) continue;

      // Set playback position
      await soundObject.setPositionAsync(startTime);

      // Get volume data (simplified approach)
      const volume = await getCurrentVolume(soundObject);

      if (volume < SILENCE_THRESHOLD) {
        if (!currentSilenceStart) {
          currentSilenceStart = position;
        }
      } else {
        if (currentSilenceStart) {
          const silenceDuration = position - currentSilenceStart;
          if (silenceDuration >= MIN_SILENCE_DURATION) {
            silentSegments.push({
              start: currentSilenceStart,
              end: position
            });
          }
          currentSilenceStart = null;
        }
      }
    }

    // Filter for potential ads (long silent segments)
    const adSegments = silentSegments.filter(segment =>
      (segment.end - segment.start) >= MIN_AD_DURATION
    );

    // Store ad segments in SQLite
    await new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Clear existing segments for this episode
        tx.executeSql(
          'DELETE FROM ad_segments WHERE episode_id = ?',
          [episode.id]
        );

        // Insert new segments
        adSegments.forEach(segment => {
          tx.executeSql(
            'INSERT INTO ad_segments (episode_id, start, end) VALUES (?, ?, ?)',
            [episode.id, segment.start, segment.end],
            (_, result) => resolve(result),
            (_, error) => reject(error)
          );
        });
      });
    });

    await soundObject.unloadAsync();
    return adSegments;
  } catch (error) {
    console.error('Ad detection failed:', error);
    return [];
  }
};

// Helper function to get current volume (simplified)
const getCurrentVolume = async (soundObject) => {
  // In a real implementation, this would use the Web Audio API or similar
  // For this prototype, we'll simulate volume detection
  const status = await soundObject.getStatusAsync();
  if (status.isPlaying) {
    // Simulate volume detection (0-1 range)
    return Math.random() * 0.5; // Random value for prototype
  }
  return 0;
};

export const getAdSegments = async (episodeId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM ad_segments WHERE episode_id = ?',
        [episodeId],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};
