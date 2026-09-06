const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const Observation = require('../models/Observation');
const store = require('../models/inMemoryStore');

// GET /api/stations
router.get('/', async (req, res) => {
  try {
    const stations = await Station.find().sort({ stationId: 1 });
    if (stations && stations.length > 0) return res.json(stations);
    res.json(store.getStations());
  } catch (err) {
    res.json(store.getStations());
  }
});

// GET /api/stations/:id
router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findOne({ stationId: req.params.id });
    if (station) return res.json(station);
    const st = store.getStation(req.params.id);
    if (!st) return res.status(404).json({ message: 'Station not found' });
    res.json(st);
  } catch (err) {
    const st = store.getStation(req.params.id);
    if (!st) return res.status(404).json({ message: 'Station not found' });
    res.json(st);
  }
});

// GET /api/stations/:id/observations
router.get('/:id/observations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const observations = await Observation.find({ stationId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(limit);
    if (observations && observations.length > 0) return res.json(observations.reverse());
    res.json(store.getObservations(req.params.id, limit));
  } catch (err) {
    res.json(store.getObservations(req.params.id, parseInt(req.query.limit) || 50));
  }
});

// GET /api/stations/:id/health
router.get('/:id/health', async (req, res) => {
  try {
    const station = await Station.findOne({ stationId: req.params.id });
    if (station) {
      return res.json({
        stationId: station.stationId,
        healthScore: station.healthScore,
        status: station.status,
        healthHistory: [],
        recentAnomalies: []
      });
    }
    const st = store.getStation(req.params.id);
    if (!st) return res.status(404).json({ message: 'Station not found' });
    res.json({
      stationId: st.stationId,
      healthScore: st.healthScore,
      status: st.status,
      healthHistory: [],
      recentAnomalies: store.getAnomalies({ station: st.stationId, limit: 10 })
    });
  } catch (err) {
    const st = store.getStation(req.params.id);
    if (!st) return res.status(404).json({ message: 'Station not found' });
    res.json({
      stationId: st.stationId,
      healthScore: st.healthScore,
      status: st.status,
      healthHistory: [],
      recentAnomalies: store.getAnomalies({ station: st.stationId, limit: 10 })
    });
  }
});

// GET /api/stations/:id/live-weather
router.get('/:id/live-weather', async (req, res) => {
  try {
    const station = store.getStation(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });

    const openMeteoService = require('../services/openMeteoService');
    const forecastData = await openMeteoService.fetchForecast(station.latitude, station.longitude);
    res.json({
      stationId: station.stationId,
      name: station.name,
      location: station.location,
      coordinates: { latitude: station.latitude, longitude: station.longitude },
      openMeteo: forecastData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
