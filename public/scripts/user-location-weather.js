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
    const weatherWidget = document.querySelector('.weather-widget');
    if (!weatherWidget) return;

    // Show loading state
    const originalContent = weatherWidget.innerHTML;
    weatherWidget.innerHTML = `
      <div class="weather-left me-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div class="weather-right">
        <h6 class="fw-semibold mb-1">Getting your location...</h6>
        <small class="text-muted">Please allow location access</small>
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
    const weatherWidget = document.querySelector('.weather-widget');
    if (!weatherWidget) return;

    weatherWidget.innerHTML = `
      <div class="weather-left me-3">
        <img
          src="${weather.icon}"
          alt="Weather icon"
          style="width: 60px; height: 60px;"
        />
      </div>
      <div class="weather-right">
        <h6 class="fw-semibold mb-1">${weather.city}, ${weather.country}</h6>
        <div class="d-flex align-items-center mb-1">
          <span class="fw-bold fs-4 me-2">${weather.temp}°C</span>
          <small class="text-muted text-capitalize">${weather.description}</small>
        </div>
        ${weather.feels_like || weather.humidity ? `
          <small class="text-muted">
            ${weather.feels_like ? `Feels like ${weather.feels_like}°C. ` : ''}
            ${weather.humidity ? `Humidity ${weather.humidity}%.` : ''}
          </small>
        ` : ''}
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
