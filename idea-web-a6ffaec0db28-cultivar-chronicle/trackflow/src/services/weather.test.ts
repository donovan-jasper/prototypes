import { fetchWeather } from './weather';

describe('Weather Service', () => {
  test('fetches weather data', async () => {
    const weather = await fetchWeather(37.7749, -122.4194);
    expect(weather).toHaveProperty('temp');
    expect(weather).toHaveProperty('condition');
  });
});
