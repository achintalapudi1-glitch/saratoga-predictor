const express = require('express');
const axios   = require('axios');
const router  = express.Router();

const SARATOGA_COORDS = { lat: 43.0783, lon: -73.7834 };
const SARATOGA_CITY   = 'Saratoga Springs,NY,US';

/**
 * Map OWM weather condition to track condition
 */
function mapCondition(weatherId, pop) {
  // pop = probability of precipitation (0–1)
  if (pop >= 0.7)            return 'sloppy';
  if (pop >= 0.4)            return 'muddy';
  if (weatherId >= 200 && weatherId < 700) return 'good'; // any precip
  return 'fast';
}

/**
 * Mock forecast (used when no API key provided)
 */
function mockForecast() {
  return {
    source:    'mock',
    location:  'Saratoga Springs, NY',
    current: {
      temp:      76,
      feelsLike: 74,
      humidity:  55,
      windSpeed: 8,
      condition: 'Partly Cloudy',
      icon:      '02d',
    },
    trackCondition:   'fast',
    rainProbability:  15,
    alert:            null,
    wetScenario:      false,
    hourly: [
      { time: '1:00 PM', temp: 76, rainProb: 10, condition: 'Partly Cloudy' },
      { time: '2:00 PM', temp: 78, rainProb: 15, condition: 'Partly Cloudy' },
      { time: '3:00 PM', temp: 79, rainProb: 20, condition: 'Mostly Sunny' },
      { time: '4:00 PM', temp: 80, rainProb: 10, condition: 'Sunny' },
      { time: '5:00 PM', temp: 79, rainProb: 5,  condition: 'Clear' },
    ],
  };
}

// GET /api/weather — Saratoga current conditions
router.get('/', async (_req, res) => {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return res.json(mockForecast());
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${SARATOGA_CITY}&units=imperial&appid=${apiKey}&cnt=8`;
    const { data } = await axios.get(url, { timeout: 5000 });

    const current = data.list[0];
    const maxPop  = Math.max(...data.list.map((h) => h.pop || 0));
    const condition = mapCondition(current.weather[0].id, current.pop || 0);

    const hourly = data.list.slice(0, 5).map((h) => ({
      time:      new Date(h.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      temp:      Math.round(h.main.temp),
      rainProb:  Math.round((h.pop || 0) * 100),
      condition: h.weather[0].description,
    }));

    res.json({
      source:          'openweathermap',
      location:        data.city.name + ', ' + data.city.country,
      current: {
        temp:      Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        humidity:  current.main.humidity,
        windSpeed: Math.round(current.wind.speed),
        condition: current.weather[0].description,
        icon:      current.weather[0].icon,
      },
      trackCondition:  condition,
      rainProbability: Math.round(maxPop * 100),
      alert:           maxPop >= 0.6 ? '⚠️ Rain likely — check wet-track rankings' : null,
      wetScenario:     maxPop >= 0.4,
      hourly,
    });
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.json({ ...mockForecast(), error: 'Live weather unavailable — showing mock data' });
  }
});

module.exports = router;
