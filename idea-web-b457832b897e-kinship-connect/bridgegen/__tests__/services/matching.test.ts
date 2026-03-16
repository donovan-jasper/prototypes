import { getMatchSuggestions, filterByDistance } from '../../services/matching';

describe('Matching Service', () => {
  const mockUsers = [
    { id: '1', lat: 40.7128, lon: -74.0060, interests: ['cooking'] },
    { id: '2', lat: 40.7580, lon: -73.9855, interests: ['reading'] },
    { id: '3', lat: 34.0522, lon: -118.2437, interests: ['cooking'] },
  ];

  test('filters users by distance', () => {
    const userLocation = { lat: 40.7128, lon: -74.0060 };
    const nearby = filterByDistance(mockUsers, userLocation, 25);
    expect(nearby.length).toBe(2);
    expect(nearby.find(u => u.id === '3')).toBeUndefined();
  });

  test('returns matches sorted by compatibility', () => {
    const currentUser = { interests: ['cooking', 'gardening'], age: 25 };
    const matches = getMatchSuggestions(currentUser, mockUsers);
    expect(matches[0].id).toBe('1'); // Best match
  });
});
