import { WEATHER_API_KEY } from '../utils/constants';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

const weatherCache: Record<string, { data: WeatherData; timestamp: number }> = {};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
  const cacheKey = `${lat},${lon}`;
  const now = Date.now();
  const cacheDuration = 60 * 60 * 1000; // 1 hour

  // Check cache first
  if (weatherCache[cacheKey] && now - weatherCache[cacheKey].timestamp < cacheDuration) {
    return weatherCache[cacheKey].data;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    const weatherData: WeatherData = {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
    };

    // Update cache
    weatherCache[cacheKey] = {
      data: weatherData,
      timestamp: now,
    };

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};
