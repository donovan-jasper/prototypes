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
        getStatusAsync: jest.fn().mockResolvedValue({ durationMillis: 120000 }),
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

  // Mock the fetch API
  global.fetch = jest.fn(() =>
    Promise.resolve({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
    })
  );

  // Mock AudioContext
  global.AudioContext = jest.fn().mockImplementation(() => ({
    createBufferSource: jest.fn().mockReturnValue({
      connect: jest.fn()
    }),
    createAnalyser: jest.fn().mockReturnValue({
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteTimeDomainData: jest.fn().mockImplementation((array) => {
        // Fill the array with mock data
        for (let i = 0; i < array.length; i++) {
          array[i] = i % 2 === 0 ? 128 : 130; // Alternating values
        }
      })
    }),
    decodeAudioData: jest.fn().mockResolvedValue({
      duration: 120
    })
  }));

  return detectAd(mockEpisode).then(segments => {
    expect(segments).toEqual([
      { start: 10000, end: 30000 },
      { start: 60000, end: 90000 }
    ]);
  });
});
