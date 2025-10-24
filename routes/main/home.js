const express = require('express');
const router = express.Router();
const { getWeather, getWeatherByCoords } = require('../../services/weatherService');
const geoip = require('geoip-lite');

router.get('/', async (req, res) => {
  try {
    let ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket.remoteAddress ||
      null;

    // ✅ Convert IPv6 localhost (::1) to valid IPv4 fallback
    if (ip === '::1' || ip === '127.0.0.1') {
      ip = '197.242.144.2'; // Example: A valid public IP in South Africa (Open to change)
    }

    console.log('📍 User IP:', ip);

    const geo = ip ? geoip.lookup(ip) : null;
    console.log('📍 Geo Data:', geo);

    let weather;

    if (geo && geo.ll) {
      const [lat, lon] = geo.ll;
      console.log(`🌍 Detected Location: Lat ${lat}, Lon ${lon}`);
      weather = await getWeatherByCoords(lat, lon);
    } else {
      console.log('⚠️ No location detected, falling back to Polokwane.');
      weather = await getWeather('Polokwane', 'ZA');
    }

    console.log('✅ Weather Data:', weather);

    res.render('main/home', {
      title: 'Weather in Your Area',
      weather: weather || null,
      error: weather ? null : 'Unable to fetch weather data.',
    });
  } catch (err) {
    console.error('🌧 Weather route error:', err);
    res.render('main/home', {
      title: 'Weather in Your Area',
      weather: null,
      error: 'An unexpected error occurred. Please check your API key or internet connection.',
    });
  }
});

// API endpoint for getting weather by coordinates (client-side geolocation)
router.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const weather = await getWeatherByCoords(parseFloat(lat), parseFloat(lon));
    
    if (!weather) {
      return res.status(500).json({ error: 'Unable to fetch weather data' });
    }

    res.json(weather);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

module.exports = router;
