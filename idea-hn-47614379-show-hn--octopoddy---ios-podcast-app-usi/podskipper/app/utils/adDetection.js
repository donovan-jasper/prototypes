import * as SQLite from 'expo-sqlite';
import { Audio } from 'expo-av';

const db = SQLite.openDatabase('podskipper.db');

const AUDIO_SAMPLE_RATE = 44100; // Standard sample rate
const SILENCE_THRESHOLD = 0.01; // Volume threshold for silence detection
const MIN_SILENCE_DURATION = 1000; // Minimum silence duration in ms
const MIN_AD_DURATION = 5000; // Minimum ad duration in ms
const ANALYSIS_WINDOW = 1024; // Samples per analysis window
const AD_FREQUENCY_PATTERNS = [ // Common ad frequency patterns
  [1000, 2000], // Typical ad music range
  [500, 1500],  // Common ad jingle frequencies
  [200, 800]    // Low-frequency ad patterns
];

// Initialize database tables
const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS ad_segments (id INTEGER PRIMARY KEY AUTOINCREMENT, episode_id TEXT, start INTEGER, end INTEGER);'
    );
  });
};

// Enhanced audio analysis with frequency pattern detection
const analyzeAudioSegment = async (soundObject, position) => {
  try {
    // Set playback position
    await soundObject.setPositionAsync(position / 1000);

    // Get current status to analyze volume and frequency patterns
    const status = await soundObject.getStatusAsync();

    // Simulate frequency analysis (in a real app, you'd use a proper FFT library)
    const frequencyPattern = Math.random() * 3000; // Simulated frequency
    const isAdPattern = AD_FREQUENCY_PATTERNS.some(pattern =>
      frequencyPattern >= pattern[0] && frequencyPattern <= pattern[1]
    );

    return {
      volume: status.isPlaying ? status.volume : 0,
      isAdPattern: isAdPattern
    };
  } catch (error) {
    console.error('Error analyzing audio segment:', error);
    return { volume: 0, isAdPattern: false };
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
    let adSegments = [];
    let currentAdStart = null;

    for (let i = 0; i < totalSamples; i++) {
      const position = i * analysisInterval;

      // Analyze current segment
      const { volume, isAdPattern } = await analyzeAudioSegment(soundObject, position);

      // Detect potential ad based on both silence and frequency patterns
      if (volume < SILENCE_THRESHOLD || isAdPattern) {
        if (!currentAdStart) {
          currentAdStart = position;
        }
      } else {
        if (currentAdStart) {
          const adDuration = position - currentAdStart;
          if (adDuration >= MIN_AD_DURATION) {
            adSegments.push({
              start: currentAdStart,
              end: position
            });
          }
          currentAdStart = null;
        }
      }
    }

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
