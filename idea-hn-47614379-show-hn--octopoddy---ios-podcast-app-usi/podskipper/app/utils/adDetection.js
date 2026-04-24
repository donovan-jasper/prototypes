import * as SQLite from 'expo-sqlite';
import { Audio } from 'expo-av';

const db = SQLite.openDatabase('podskipper.db');

const AUDIO_SAMPLE_RATE = 44100; // Standard sample rate
const SILENCE_THRESHOLD = 0.01; // Volume threshold for silence detection
const MIN_SILENCE_DURATION = 1000; // Minimum silence duration in ms
const MIN_AD_DURATION = 5000; // Minimum ad duration in ms
const ANALYSIS_WINDOW = 1024; // Samples per analysis window

// Initialize database tables
const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS ad_segments (id INTEGER PRIMARY KEY AUTOINCREMENT, episode_id TEXT, start INTEGER, end INTEGER);'
    );
  });
};

// Simplified audio analysis using Expo Audio API
const analyzeAudioSegment = async (soundObject, position) => {
  try {
    // Set playback position
    await soundObject.setPositionAsync(position / 1000);

    // Get current status to analyze volume
    const status = await soundObject.getStatusAsync();
    return status.isPlaying ? status.volume : 0;
  } catch (error) {
    console.error('Error analyzing audio segment:', error);
    return 0;
  }
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

    // Analyze audio in chunks
    const analysisInterval = 1000; // 1 second in ms
    const totalSamples = Math.floor(duration / analysisInterval);
    let silentSegments = [];
    let currentSilenceStart = null;

    for (let i = 0; i < totalSamples; i++) {
      const position = i * analysisInterval;

      // Analyze current segment
      const volume = await analyzeAudioSegment(soundObject, position);

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
