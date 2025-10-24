// Request user's browser location and update weather widget
document.addEventListener('DOMContentLoaded', function() {
  console.log('🌍 Requesting user location for accurate weather...');
  
  if ('geolocation' in navigator) {
    // Request user's actual location
    navigator.geolocation.getCurrentPosition(
      async function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        console.log(`📍 User location: Lat ${lat}, Lon ${lon}`);
        
        try {
          // Fetch weather data using actual coordinates
          const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch weather');
          }
          
          const weather = await response.json();
          console.log('✅ Weather data received:', weather);
          
          // Update the weather widget
          updateWeatherWidget(weather);
          
        } catch (error) {
          console.error('❌ Error fetching weather:', error);
        }
      },
      function(error) {
        console.warn('⚠️ Location access denied or unavailable:', error.message);
        // Keep the default IP-based weather if user denies location
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  } else {
    console.warn('⚠️ Geolocation is not supported by this browser');
  }
});

function updateWeatherWidget(weather) {
  // Update weather icon
  const weatherIcon = document.querySelector('.weather-icon');
  if (weatherIcon && weather.icon) {
    weatherIcon.src = weather.icon;
    weatherIcon.alt = weather.description;
  }
  
  // Update location
  const weatherLocation = document.querySelector('.weather-location');
  if (weatherLocation) {
    weatherLocation.textContent = `${weather.city}, ${weather.country}`;
  }
  
  // Update temperature
  const weatherTemp = document.querySelector('.weather-temp');
  if (weatherTemp) {
    weatherTemp.textContent = `${Math.round(weather.temp)}°C`;
  }
  
  // Update description
  const weatherDesc = document.querySelector('.weather-description');
  if (weatherDesc) {
    weatherDesc.textContent = weather.description;
  }
  
  // Update details
  const weatherDetails = document.querySelector('.weather-details');
  if (weatherDetails) {
    weatherDetails.textContent = `Feels like ${Math.round(weather.feels_like)}°C. Humidity ${weather.humidity}%.`;
  }
  
  console.log('✅ Weather widget updated with user location');
}
