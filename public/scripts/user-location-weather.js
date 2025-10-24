// User Location Weather - Uses browser geolocation API
(function() {
  'use strict';

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    console.log('Geolocation is not supported by this browser');
    return;
  }

  // Get user's location and update weather
  function getUserLocationWeather() {
    const weatherWidget = document.querySelector('.weather-widget-compact');
    if (!weatherWidget) return;

    // Show loading state
    const originalContent = weatherWidget.innerHTML;
    weatherWidget.innerHTML = `
      <div class="spinner-border spinner-border-sm text-light" role="status" style="width: 20px; height: 20px;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="weather-info">
        <div class="weather-location" style="font-size: 9px;">Getting location...</div>
      </div>
    `;

    navigator.geolocation.getCurrentPosition(
      // Success callback
      async function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        console.log('User location:', lat, lon);

        try {
          // Fetch weather data from our API
          const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch weather');
          }

          const weather = await response.json();
          
          // Update weather widget with new data
          updateWeatherWidget(weather);
          
          // Store location preference
          localStorage.setItem('weatherLocation', JSON.stringify({ lat, lon }));
          
        } catch (error) {
          console.error('Error fetching weather:', error);
          weatherWidget.innerHTML = originalContent; // Restore original
        }
      },
      // Error callback
      function(error) {
        console.log('Geolocation error:', error.message);
        // Keep the server-side detected weather (don't change anything)
      },
      // Options
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  }

  // Update the weather widget with new data
  function updateWeatherWidget(weather) {
    const weatherWidget = document.querySelector('.weather-widget-compact');
    if (!weatherWidget) return;

    weatherWidget.innerHTML = `
      <img class="weather-icon" src="${weather.icon}" alt="${weather.description}" />
      <div class="weather-info">
        <div class="weather-location">${weather.city}, ${weather.country}</div>
        <div class="weather-temp">${weather.temp}°C</div>
        <div class="weather-description">${weather.description}</div>
        <div class="weather-details">
          ${weather.feels_like ? `Feels like ${weather.feels_like}°C. ` : ''}
          ${weather.humidity ? `Humidity ${weather.humidity}%.` : ''}
        </div>
      </div>
    `;
  }

  // Try to get user location weather on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', getUserLocationWeather);
  } else {
    getUserLocationWeather();
  }
})();
