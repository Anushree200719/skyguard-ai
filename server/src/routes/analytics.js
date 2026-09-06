const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const Anomaly = require('../models/Anomaly');
const store = require('../models/inMemoryStore');

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    const totalStations = await Station.countDocuments();
    const onlineStations = await Station.countDocuments({ status: { $ne: 'CRITICAL' } });
    const warningStations = await Station.countDocuments({ status: 'WARNING' });
    const criticalStations = await Station.countDocuments({ status: 'CRITICAL' });
    const weatherEventsCount = await Station.countDocuments({ status: 'WEATHER_EVENT' });

    const totalAnomalies = await Anomaly.countDocuments();
    const genuineEvents = await Anomaly.countDocuments({ anomalyType: 'GENUINE_WEATHER_EVENT' });
    const sensorFaults = await Anomaly.countDocuments({ 
      anomalyType: { $in: ['SENSOR_SPIKE', 'SENSOR_DRIFT', 'SENSOR_FROZEN', 'SENSOR_NOISE', 'MULTIVARIATE_INCONSISTENCY'] } 
    });
    const commFailures = await Anomaly.countDocuments({ 
      anomalyType: { $in: ['MISSING_DATA', 'COMMUNICATION_FAILURE'] } 
    });

    const stations = await Station.find();
    const avgHealth = stations.length > 0 ? (stations.reduce((acc, s) => acc + s.healthScore, 0) / stations.length) : 100;

    res.json({
      summary: {
        totalStations,
        onlineStations,
        warningStations,
        criticalStations,
        weatherEventsCount,
        overallQualityScore: roundVal(avgHealth),
        totalAnomalies,
        genuineWeatherEvents: genuineEvents,
        sensorFaults,
        communicationFailures: commFailures
      }
    });
  } catch (err) {
    const stations = store.getStations();
    const anomalies = store.getAnomalies();
    const totalStations = stations.length;
    const onlineStations = stations.filter(s => s.status !== 'CRITICAL').length;
    const warningStations = stations.filter(s => s.status === 'WARNING').length;
    const criticalStations = stations.filter(s => s.status === 'CRITICAL').length;
    const weatherEventsCount = stations.filter(s => s.status === 'WEATHER_EVENT').length;

    const genuineEvents = anomalies.filter(a => a.anomalyType === 'GENUINE_WEATHER_EVENT').length;
    const sensorFaults = anomalies.filter(a => ['SENSOR_SPIKE', 'SENSOR_DRIFT', 'SENSOR_FROZEN', 'SENSOR_NOISE', 'MULTIVARIATE_INCONSISTENCY'].includes(a.anomalyType)).length;
    const commFailures = anomalies.filter(a => ['MISSING_DATA', 'COMMUNICATION_FAILURE'].includes(a.anomalyType)).length;
    const avgHealth = stations.length > 0 ? (stations.reduce((acc, s) => acc + s.healthScore, 0) / stations.length) : 100;

    res.json({
      summary: {
        totalStations,
        onlineStations,
        warningStations,
        criticalStations,
        weatherEventsCount,
        overallQualityScore: roundVal(avgHealth),
        totalAnomalies: anomalies.length,
        genuineWeatherEvents: genuineEvents,
        sensorFaults,
        communicationFailures: commFailures,
        edgeAiSupport: {
          enabled: true,
          currentMode: 'CLOUD',
          edgeCapable: true,
          architecture: 'Sensor → Data Processing → AI Model → Anomaly Detection → Dashboard'
        }
      }
    });
  }
});

function roundVal(val) {
  return Math.round(val * 10) / 10;
}

module.exports = router;
