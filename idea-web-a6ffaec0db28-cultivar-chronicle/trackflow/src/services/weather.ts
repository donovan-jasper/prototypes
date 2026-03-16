import { WEATHER_API_KEY } from '../utils/constants';

export const fetchWeather = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const data = await response.json();
    return {
      temp: data.main.temp,
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};
