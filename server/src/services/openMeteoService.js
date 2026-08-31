const axios = require('axios');

class OpenMeteoService {
  constructor() {
    this.cache = new Map(); // key -> { data, timestamp }
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache
  }

  async fetchForecast(latitude = 21.1492, longitude = 79.1613) {
    const cacheKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
      latitude,
      longitude,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'precipitation',
        'rain',
        'cloud_cover',
        'surface_pressure'
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'rain',
        'precipitation',
        'pressure_msl',
        'wind_speed_180m',
        'wind_direction_80m',
        'temperature_80m',
        'dew_point_2m',
        'apparent_temperature',
        'soil_temperature_18cm',
        'soil_moisture_9_to_27cm',
        'surface_pressure',
        'cloud_cover_high',
        'precipitation_probability',
        'visibility'
      ].join(','),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'wind_gusts_10m_max',
        'wind_speed_10m_max',
        'wind_direction_10m_dominant',
        'shortwave_radiation_sum',
        'et0_fao_evapotranspiration',
        'rain_sum',
        'precipitation_sum',
        'sunrise',
        'sunset'
      ].join(',')
    };

    try {
      const response = await axios.get(url, { params, timeout: 8000 });
      const data = response.data;
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.warn(`[OpenMeteoService] Warning fetching live Open-Meteo data for (${latitude}, ${longitude}):`, error.message);
      if (cached) return cached.data; // Return stale cache if available
      throw error;
    }
  }
}

const openMeteoService = new OpenMeteoService();
module.exports = openMeteoService;
