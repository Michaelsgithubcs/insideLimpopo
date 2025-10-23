const axios = require('axios');
require('dotenv').config();

/**
 * Get weather by city and country code
 */
async function getWeather(city, countryCode) {
  return fetchWeather(`q=${city},${countryCode}`);
}

/**
 * Get weather by latitude & longitude
 */
async function getWeatherByCoords(lat, lon) {
  return fetchWeather(`lat=${lat}&lon=${lon}`);
}

/**
 * Reusable function to fetch weather from OpenWeatherMap
 */
async function fetchWeather(query) {
  try {
    const apiKey = "23595fd74cbd94da7e569f8a6919994d";
    if (!apiKey) throw new Error('Missing WEATHER_API_KEY in .env');

    const url = `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric`;

    const { data } = await axios.get(url);

    return {
      city: data.name,
      country: data.sys?.country || "Unknown",
      temp: data.main?.temp || 0,
      feels_like: data.main?.feels_like || 0,
      humidity: data.main?.humidity || 0,
      description: data.weather[0]?.description || "No description",
      icon: data.weather[0]?.icon
        ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
        : null,
    };
  } catch (err) {
    console.error('❌ Weather API failed:', err.response?.data || err.message);
    return null; // Ensure it doesn't crash the page
  }
}



module.exports = { getWeather, getWeatherByCoords };
