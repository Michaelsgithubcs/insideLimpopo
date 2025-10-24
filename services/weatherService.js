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
 * Uses reverse geocoding to find the nearest major city
 */
async function getWeatherByCoords(lat, lon) {
  try {
    const apiKey = "23595fd74cbd94da7e569f8a6919994d";
    
    // First, use reverse geocoding to find nearby cities
    const geoUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${apiKey}`;
    const { data: locations } = await axios.get(geoUrl);
    
    // Find the largest city (prefer cities over small towns)
    let bestLocation = locations[0];
    
    if (locations.length > 1) {
      // Known major South African cities
      const majorCities = ['Johannesburg', 'Pretoria', 'Cape Town', 'Durban', 'Port Elizabeth', 
                           'Bloemfontein', 'Polokwane', 'Nelspruit', 'Kimberley', 'East London'];
      
      // Try to find a major city in the results
      const majorCity = locations.find(loc => 
        majorCities.some(city => loc.name.toLowerCase().includes(city.toLowerCase()))
      );
      
      if (majorCity) {
        bestLocation = majorCity;
      } else {
        // Otherwise, prefer locations with "city" or larger population indicators
        const cityLocation = locations.find(loc => 
          loc.name && !loc.name.toLowerCase().includes('suburb')
        );
        bestLocation = cityLocation || locations[0];
      }
    }
    
    // Now get weather for the best location found
    if (bestLocation) {
      return fetchWeather(`lat=${bestLocation.lat}&lon=${bestLocation.lon}`);
    }
    
    // Fallback to original coordinates
    return fetchWeather(`lat=${lat}&lon=${lon}`);
  } catch (err) {
    console.error('❌ Geocoding failed, using direct coordinates:', err.message);
    // Fallback to direct coordinates
    return fetchWeather(`lat=${lat}&lon=${lon}`);
  }
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
