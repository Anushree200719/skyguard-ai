const axios = require('axios');

class OpenMeteoService {
  constructor() {
    this.cache = new Map(); // key -> { data, timestamp }
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache
  }

  async fetchForecast(latitude = 21.1492, longitude = 79.1613) {
    const latNum = Number(latitude);
    const lonNum = Number(longitude);
    const cacheKey = `${latNum.toFixed(4)}_${lonNum.toFixed(4)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
      latitude: latNum,
      longitude: lonNum,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m'
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation_probability',
        'precipitation',
        'rain',
        'snowfall',
        'weather_code',
        'pressure_msl',
        'surface_pressure',
        'evapotranspiration',
        'vapour_pressure_deficit',
        'wind_speed_80m',
        'wind_speed_10m',
        'wind_speed_180m',
        'wind_speed_120m',
        'wind_direction_10m',
        'wind_direction_80m',
        'wind_direction_120m',
        'wind_direction_180m',
        'wind_gusts_10m',
        'temperature_80m',
        'temperature_120m',
        'temperature_180m',
        'soil_temperature_0cm',
        'soil_temperature_6cm',
        'soil_temperature_54cm',
        'soil_moisture_0_to_1cm',
        'soil_moisture_1_to_3cm',
        'soil_moisture_9_to_27cm',
        'soil_moisture_27_to_81cm',
        'soil_moisture_3_to_9cm'
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'uv_index_max',
        'uv_index_clear_sky_max',
        'sunrise',
        'daylight_duration',
        'sunshine_duration',
        'moonrise',
        'moonset',
        'snowfall_sum',
        'precipitation_sum',
        'wind_speed_10m_max',
        'wind_gusts_10m_max',
        'wind_direction_10m_dominant',
        'shortwave_radiation_sum',
        'et0_fao_evapotranspiration'
      ].join(',')
    };

    try {
      const response = await axios.get(url, { params, timeout: 10000 });
      const data = response.data;
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.warn(`[OpenMeteoService] Warning fetching live Open-Meteo data for (${latNum}, ${lonNum}):`, error.message);
      if (cached) return cached.data; // Return stale cache if available
      throw error;
    }
  }

  async fetchCurrentWeatherForStation(latitude, longitude) {
    try {
      const forecast = await this.fetchForecast(latitude, longitude);
      if (forecast && forecast.current) {
        return {
          temperature: forecast.current.temperature_2m ?? null,
          humidity: forecast.current.relative_humidity_2m ?? null,
          pressure: forecast.current.surface_pressure ?? forecast.current.pressure_msl ?? null,
          windSpeed: forecast.current.wind_speed_10m ?? null,
          windDirection: forecast.current.wind_direction_10m ?? null,
          rainfall: forecast.current.precipitation ?? forecast.current.rain ?? 0.0,
          apparentTemperature: forecast.current.apparent_temperature ?? null,
          isDay: forecast.current.is_day,
          weatherCode: forecast.current.weather_code,
          cloudCover: forecast.current.cloud_cover,
          windGusts: forecast.current.wind_gusts_10m,
          pressureMsl: forecast.current.pressure_msl
        };
      }
    } catch (err) {
      console.warn(`[OpenMeteoService] Unable to fetch live current telemetry for (${latitude}, ${longitude}):`, err.message);
    }
    return null;
  }
}

const openMeteoService = new OpenMeteoService();
module.exports = openMeteoService;
