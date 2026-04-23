import { WEATHER_API_KEY } from '../utils/constants';

const WEATHER_CACHE: Record<string, { data: any, timestamp: number }> = {};

export const fetchWeather = async (lat: number, lon: number) => {
  const cacheKey = `${lat},${lon}`;
  const now = Date.now();

  // Check cache first (valid for 1 hour)
  if (WEATHER_CACHE[cacheKey] && now - WEATHER_CACHE[cacheKey].timestamp < 3600000) {
    return WEATHER_CACHE[cacheKey].data;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.weather || !data.weather[0] || !data.main) {
      throw new Error('Invalid weather data format');
    }

    const weatherData = {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
    };

    // Cache the result
    WEATHER_CACHE[cacheKey] = {
      data: weatherData,
      timestamp: now,
    };

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};
