import { WEATHER_API_KEY } from '@/constants/config';

interface WeatherData {
  temp: number;
  condition: string;
}

export async function getWeather(): Promise<WeatherData> {
  // In a real app, you would use the device's location
  // For this prototype, we'll use a default location
  const defaultLocation = {
    lat: 37.7749,
    lon: -122.4194 // San Francisco coordinates
  };

  try {
    // Check for cached data first
    const cachedData = await getCachedWeather();
    if (cachedData) {
      return cachedData;
    }

    // Fetch fresh data from API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${defaultLocation.lat}&lon=${defaultLocation.lon}&appid=${WEATHER_API_KEY}&units=imperial`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    const weatherData: WeatherData = {
      temp: data.main.temp,
      condition: mapWeatherCondition(data.weather[0].main)
    };

    // Cache the data for 1 hour
    await cacheWeather(weatherData);

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Return default weather if API fails
    return {
      temp: 72,
      condition: 'sunny'
    };
  }
}

function mapWeatherCondition(condition: string): string {
  switch (condition.toLowerCase()) {
    case 'clear':
      return 'sunny';
    case 'clouds':
      return 'cloudy';
    case 'rain':
    case 'drizzle':
      return 'rainy';
    case 'snow':
      return 'snowy';
    case 'thunderstorm':
      return 'stormy';
    default:
      return 'sunny';
  }
}

async function cacheWeather(data: WeatherData): Promise<void> {
  try {
    const cacheExpiry = new Date();
    cacheExpiry.setHours(cacheExpiry.getHours() + 1);

    await db.runAsync(
      'INSERT OR REPLACE INTO weather_cache (id, data, expiry) VALUES (1, ?, ?)',
      JSON.stringify(data),
      cacheExpiry.toISOString()
    );
  } catch (error) {
    console.error('Error caching weather:', error);
  }
}

async function getCachedWeather(): Promise<WeatherData | null> {
  try {
    const now = new Date().toISOString();
    const row = await db.getFirstAsync<any>(
      'SELECT data FROM weather_cache WHERE id = 1 AND expiry > ?',
      now
    );

    if (row) {
      return JSON.parse(row.data);
    }
  } catch (error) {
    console.error('Error getting cached weather:', error);
  }

  return null;
}
