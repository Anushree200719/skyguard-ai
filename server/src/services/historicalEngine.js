/**
 * SkyGuard AI - Historical Weather Data Analysis Engine
 * Calculates statistical metrics (Min, Max, Avg, Trend) and integrates anomaly markers
 * over flexible time horizons (1h, 6h, 24h, 7d, 30d).
 */
const store = require('../models/inMemoryStore');
const mongoose = require('mongoose');
const openMeteoService = require('./openMeteoService');

class HistoricalEngine {
  constructor() {
    this.cache = new Map(); // key: stationId_range_param -> { data, timestamp }
    this.cacheTTL = 3 * 60 * 1000; // 3 minutes cache
  }

  async getHistoricalAnalysis(stationId, range = '24h', parameter = 'temperature') {
    const cacheKey = `${stationId}_${range}_${parameter}`;
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    const station = store.getStation(stationId) || { stationId, name: stationId, latitude: 21.1492, longitude: 79.1613 };
    const now = new Date();
    let windowMs = 24 * 3600 * 1000; // default 24h

    if (range === '1h') windowMs = 3600 * 1000;
    else if (range === '6h') windowMs = 6 * 3600 * 1000;
    else if (range === '24h') windowMs = 24 * 3600 * 1000;
    else if (range === '7d') windowMs = 7 * 24 * 3600 * 1000;
    else if (range === '30d') windowMs = 30 * 24 * 3600 * 1000;

    const startTime = new Date(now.getTime() - windowMs);

    // 1. Fetch raw telemetry observations from MongoDB or MemoryStore
    let rawObs = [];
    if (mongoose.connection.readyState === 1) {
      try {
        const Observation = require('../models/Observation');
        rawObs = await Observation.find({
          stationId,
          timestamp: { $gte: startTime }
        }).sort({ timestamp: 1 });
      } catch (err) {
        console.warn('MongoDB history query fallback:', err.message);
      }
    }

    if (!rawObs || rawObs.length === 0) {
      const allStoreObs = store.getObservations(stationId, 500);
      rawObs = allStoreObs.filter(o => new Date(o.timestamp).getTime() >= startTime.getTime());
    }

    // 2. Fetch anomalies for station in this window to overlay markers
    let anomalies = store.getAnomalies({ station: stationId, limit: 100 });
    if (mongoose.connection.readyState === 1) {
      try {
        const Anomaly = require('../models/Anomaly');
        const dbAnoms = await Anomaly.find({ stationId, timestamp: { $gte: startTime } }).sort({ timestamp: 1 });
        if (dbAnoms && dbAnoms.length > 0) anomalies = dbAnoms;
      } catch (err) {
        // fallback to memory
      }
    }

    // 3. For 7d and 30d ranges, if local observation count is sparse, augment with real Open-Meteo hourly observations
    let points = [];
    if ((range === '7d' || range === '30d') && rawObs.length < 24) {
      try {
        const forecast = await openMeteoService.fetchForecast(station.latitude, station.longitude);
        if (forecast && forecast.hourly && Array.isArray(forecast.hourly.time)) {
          const hourlyTimes = forecast.hourly.time;
          const paramKey = parameter === 'temperature' ? 'temperature_2m' :
                          (parameter === 'humidity' ? 'relative_humidity_2m' :
                          (parameter === 'pressure' ? 'surface_pressure' :
                          (parameter === 'windSpeed' ? 'wind_speed_10m' : 'precipitation')));

          const hourlyValues = forecast.hourly[paramKey] || [];
          const hoursCount = range === '7d' ? 168 : 720;
          
          points = hourlyTimes.slice(-hoursCount).map((tStr, idx) => {
            const ptTime = new Date(tStr);
            const val = hourlyValues[idx] !== undefined ? hourlyValues[idx] : null;
            return {
              timestamp: ptTime.toISOString(),
              timeLabel: ptTime.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
              value: val !== null ? Number(val.toFixed(1)) : null,
              isAnomaly: false
            };
          }).filter(p => p.value !== null);
        }
      } catch (err) {
        console.warn('Open-Meteo historical baseline fallback notice:', err.message);
      }
    }

    // Default: use local telemetry stream observations
    if (points.length === 0) {
      points = rawObs.map(o => {
        const ptTime = new Date(o.timestamp);
        const val = o[parameter] !== undefined && o[parameter] !== null ? Number(o[parameter]) : null;
        
        // Match anomalies
        const matchingAnom = anomalies.find(a => 
          a.sensor === parameter && 
          Math.abs(new Date(a.timestamp).getTime() - ptTime.getTime()) < 5 * 60 * 1000
        );

        return {
          timestamp: ptTime.toISOString(),
          timeLabel: ptTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: val,
          isAnomaly: !!matchingAnom,
          anomalyType: matchingAnom ? matchingAnom.anomalyType : null,
          severity: matchingAnom ? matchingAnom.severity : null,
          shortExplanation: matchingAnom ? (matchingAnom.shortExplanation || matchingAnom.probableCause) : null
        };
      }).filter(p => p.value !== null);
    }

    // 4. Calculate statistical metrics
    let minVal = null;
    let maxVal = null;
    let avgVal = null;
    let trend = 'STABLE';
    let trendLabel = 'Stable ➔';

    if (points.length > 0) {
      const validVals = points.map(p => p.value).filter(v => typeof v === 'number');
      if (validVals.length > 0) {
        minVal = Number(Math.min(...validVals).toFixed(1));
        maxVal = Number(Math.max(...validVals).toFixed(1));
        const sum = validVals.reduce((acc, v) => acc + v, 0);
        avgVal = Number((sum / validVals.length).toFixed(1));

        // Compute trend by comparing early third vs late third averages
        if (validVals.length >= 4) {
          const third = Math.floor(validVals.length / 3);
          const earlyAvg = validVals.slice(0, third).reduce((a, b) => a + b, 0) / third;
          const lateAvg = validVals.slice(-third).reduce((a, b) => a + b, 0) / third;
          const diff = lateAvg - earlyAvg;

          const threshold = parameter === 'pressure' ? 2.0 : (parameter === 'humidity' ? 3.0 : 0.6);
          if (diff > threshold) {
            trend = 'INCREASING';
            trendLabel = 'Increasing ↗';
          } else if (diff < -threshold) {
            trend = 'DECREASING';
            trendLabel = 'Decreasing ↘';
          } else {
            trend = 'STABLE';
            trendLabel = 'Stable ➔';
          }
        }
      }
    }

    const units = {
      temperature: '°C',
      humidity: '%',
      pressure: 'hPa',
      windSpeed: 'm/s',
      rainfall: 'mm'
    };

    const result = {
      stationId: station.stationId,
      stationName: station.name || stationId,
      parameter,
      range,
      unit: units[parameter] || '',
      statistics: {
        minimum: minVal,
        maximum: maxVal,
        average: avgVal,
        trend,
        trendLabel,
        totalObservations: points.length,
        anomaliesDetected: points.filter(p => p.isAnomaly).length
      },
      points,
      dataSource: points.length > 0 ? (range === '7d' || range === '30d' ? 'SkyGuard AWS Telemetry Stream + Open-Meteo Satellite Archive' : 'SkyGuard AWS Live Telemetry Stream') : 'No Data Available',
      lastUpdated: new Date().toISOString()
    };

    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }
}

const historicalEngine = new HistoricalEngine();
module.exports = historicalEngine;
