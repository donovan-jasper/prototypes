import { detectAd } from '../../app/utils/adDetection';

test('detects ad segments in audio', () => {
  const mockEpisode = { id: 1, title: 'Test Episode', audioUrl: 'http://example.com/test.mp3', transcript: 'Test transcript' };
  const mockAdSegments = [
    { start: 10000, end: 30000 },
    { start: 60000, end: 90000 },
  ];

  return detectAd(mockEpisode).then(segments => {
    expect(segments).toEqual(mockAdSegments);
  });
});
