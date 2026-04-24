import { detectAd } from '../../app/utils/adDetection';

test('detects ad segments in audio', () => {
  const mockEpisode = {
    id: '1',
    title: 'Test Episode',
    audioUrl: 'http://example.com/test.mp3',
    transcript: 'Test transcript'
  };

  // Mock the Audio module
  jest.mock('expo-av', () => ({
    Audio: {
      Sound: jest.fn().mockImplementation(() => ({
        loadAsync: jest.fn().mockResolvedValue(true),
        getStatusAsync: jest.fn().mockImplementation(() => {
          // Alternate between playing and silent states
          const isPlaying = Math.random() > 0.5;
          return Promise.resolve({
            durationMillis: 120000,
            isPlaying,
            volume: isPlaying ? 0.5 : 0.005 // Simulate low volume for "silence"
          });
        }),
        setPositionAsync: jest.fn().mockResolvedValue(true),
        unloadAsync: jest.fn().mockResolvedValue(true)
      }))
    }
  }));

  // Mock the SQLite database
  jest.mock('expo-sqlite', () => ({
    openDatabase: jest.fn().mockImplementation(() => ({
      transaction: jest.fn((callback) => {
        const tx = {
          executeSql: jest.fn()
        };
        callback(tx);
      })
    }))
  }));

  return detectAd(mockEpisode).then(segments => {
    // Verify we got some segments back
    expect(Array.isArray(segments)).toBe(true);
    // Verify each segment has required properties
    segments.forEach(segment => {
      expect(segment).toHaveProperty('start');
      expect(segment).toHaveProperty('end');
      expect(segment.end).toBeGreaterThan(segment.start);
    });
  });
});
