import { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

/**
 * Maps OpenWeather API conditions + temperature to app-friendly weather categories.
 */
function mapWeatherCondition(weatherMain, temp) {
  // Temperature-based overrides first
  if (temp >= 35) return 'hot';
  if (temp <= 5) return 'cold';

  // Condition-based mapping
  const conditionMap = {
    'Thunderstorm': 'rainy',
    'Drizzle': 'rainy',
    'Rain': 'rainy',
    'Snow': 'cold',
    'Clear': temp > 30 ? 'hot' : 'sunny',
    'Clouds': 'cloudy',
    'Mist': 'cloudy',
    'Fog': 'cloudy',
    'Haze': 'cloudy',
    'Smoke': 'cloudy',
    'Dust': 'windy',
    'Sand': 'windy',
    'Squall': 'windy',
    'Tornado': 'windy',
  };

  return conditionMap[weatherMain] || 'sunny';
}

/**
 * Returns a Bootstrap Icon class for the detected weather type.
 */
function getWeatherIcon(weatherType) {
  const iconMap = {
    'sunny': 'bi-brightness-high-fill',
    'rainy': 'bi-cloud-rain-fill',
    'cold': 'bi-thermometer-snow',
    'hot': 'bi-thermometer-high',
    'cloudy': 'bi-cloud-fill',
    'windy': 'bi-wind',
  };
  return iconMap[weatherType] || 'bi-cloud-sun';
}

/**
 * Custom hook: useWeather
 *
 * Automatically detects the user's location and fetches current weather data
 * from the OpenWeather API. Returns the mapped weather type, temperature,
 * description, icon, and loading/error states.
 *
 * Falls back gracefully if location is denied or the API key is missing.
 */
export default function useWeather() {
  const [weatherType, setWeatherType] = useState(null);  // 'sunny' | 'rainy' | 'cold' | 'hot' | 'cloudy' | 'windy'
  const [temperature, setTemperature] = useState(null);   // number in °C
  const [description, setDescription] = useState('');      // e.g. "clear sky"
  const [icon, setIcon] = useState('');                    // Bootstrap icon class
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('');    // e.g. "Mumbai"

  useEffect(() => {
    // If no API key, bail out immediately
    if (!API_KEY) {
      setError('Weather API key not configured');
      setLoading(false);
      return;
    }

    // If geolocation is not supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );

          if (!res.ok) {
            throw new Error(`Weather API error: ${res.status}`);
          }

          const data = await res.json();

          const temp = Math.round(data.main.temp);
          const condition = data.weather[0].main;
          const desc = data.weather[0].description;
          const mapped = mapWeatherCondition(condition, temp);

          setTemperature(temp);
          setDescription(desc);
          setWeatherType(mapped);
          setIcon(getWeatherIcon(mapped));
          setLocationName(data.name || '');
        } catch (err) {
          console.error('Weather fetch error:', err);
          setError('Could not fetch weather data');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied:', err.message);
        setError('Location access denied');
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache location for 5 minutes
      }
    );
  }, []);

  return {
    weatherType,
    temperature,
    description,
    icon,
    loading,
    error,
    locationName,
  };
}
