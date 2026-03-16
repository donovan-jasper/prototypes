import { restorePhoto } from '../services/RestorationService';

test('restorePhoto should return enhanced image', async () => {
  const mockImage = { uri: 'test.jpg' };
  const result = await restorePhoto(mockImage);
  expect(result).toHaveProperty('uri');
  expect(result.quality).toBeGreaterThan(0.8);
});
